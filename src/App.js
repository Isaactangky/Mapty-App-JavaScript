"use strict";
import { Running, Cycling } from "./Wortkout.js";
import {
  objectToWorkout,
  copyAndSortWorkouts,
  validInputs,
} from "./helpers.js";

///////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector(".form");
const editForm = document.querySelector(".edit-form");
const editFormInputType = editForm.querySelector(".form__input--type");
const editFormInputDistance = editForm.querySelector(".form__input--distance");
const editFormInputDuration = editForm.querySelector(".form__input--duration");
const editFormInputCadence = editForm.querySelector(".form__input--cadence");
const editFormInputElevation = editForm.querySelector(
  ".form__input--elevation"
);

const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const editPanel = document.querySelector(".edit__panel");
const deleteAllBtn = document.querySelector(".delete__all__btn");
const sortSelect = document.querySelector("#sort__workout");
const defaultLocation = {
  latitude: 22.311490382666655,
  longitude: 114.16837692260744,
};

class App {
  // private variables
  #map;
  #markers = [];
  #zoomLevel = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    // Get user position
    this._getPosition();
    // Get localStorage
    this._getLocalStorage();
    // Attach event handlers
    // bind(this) this is the App class, not the form element
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    editFormInputType.addEventListener(
      "change",
      this._toggleEditFormElevationField
    );
    containerWorkouts.addEventListener("click", this._editWorkout.bind(this));
    containerWorkouts.addEventListener("click", this._deleteWorkout.bind(this));
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));

    sortSelect.addEventListener("change", this._sortWorkouts.bind(this));
    deleteAllBtn.addEventListener("click", this._deleteAll.bind(this));
    editForm.addEventListener("submit", this._updateWorkout.bind(this));
  }
  //TODO Async Load
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert(
          "Cannot get user location. Please grant permission for getting user location and reload the page. \n\nSetting map location to default location (Hong Kong)."
        );
        this._loadMap(null);
      });
    }
  }

  async _loadMap(position) {
    const { latitude, longitude } = position
      ? position.coords
      : defaultLocation;
    const coords = [latitude, longitude];
    // leaflet library to display current location
    this.#map = L.map("map").setView(coords, this.#zoomLevel);

    L.tileLayer("https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // Add marker on click ( .on() is a function from Leaflet)
    this.#map.on("click", this._showForm.bind(this));

    this.#workouts.forEach((workout) => {
      this._renderWorkoutMarker(workout); // add after map loaded
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _hideForm() {
    // Empty Inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    // Hide form
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // creating new workout
    // 1. get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // 2. If type is running, create Running object
    if (type === "running") {
      // data validation
      const cadence = +inputCadence.value;
      if (!validInputs(distance, duration, cadence)) return;

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // 3. If type is cycling, create Cycling object
    if (type === "cycling") {
      // data validation
      const elevation = +inputElevation.value;
      if (!validInputs(distance, duration, elevation)) return;
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // 4. Add new object to the workout array
    this.#workouts.push(workout);
    // 5. Render workout on map as marker
    this._renderWorkoutMarker(workout);
    // 6. Render workout on list
    this._renderWorkout(workout);
    // 7. Clear form inputs, Hide form
    this._hideForm();
    // 8. Set workout to localStorage
    this._setLocalStorage();
  }
  _renderWorkoutMarker(workout) {
    const marker = L.marker(workout.coords);

    this.#markers.push(marker);
    marker
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      ) // new popup object
      .setPopupContent(
        `${workout.type === "running" ? "?????????????" : "?????????????"} ${workout.description}`
      )
      .openPopup();
  }
  _deleteWorkoutMarker(workout) {
    const index = this.#markers.findIndex(
      (m) =>
        m._latlng.lat === workout.coords[0] &&
        m._latlng.lng === workout.coords[1]
    );
    const marker = this.#markers[index];
    this.#map.removeLayer(marker);
    this.#markers.splice(index, 1);
  }
  _renderWorkout(workout, render = true) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="edit__btns">
          <button class="edit__btn" title="edit">!</button>
          <button class="delete__btn">x</button>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "?????????????" : "?????????????"
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">???</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
      `;
    if (workout.type === "running") {
      html += `
        <div class="workout__details">
            <span class="workout__icon">??????</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">????????</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
      </li>
      `;
    }
    if (workout.type === "cycling") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">??????</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">???</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }
    if (!render) return html;
    editPanel.insertAdjacentHTML("afterend", html);
  }
  _moveToPopup(e) {
    if (e.target.classList.contains("delete__btn")) return;
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;
    const workout = this.#workouts.find(
      (ele) => ele.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 2,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("workout", JSON.stringify(this.#workouts));
    localStorage.setItem("sort", sortSelect.value);
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workout"));
    if (!data) return;
    // convert object array from localStorage to Workout array

    this.#workouts = objectToWorkout(data);
    // this.#workouts = data; data is an object array, not Workout array
    // render Workouts
    const sortOption = localStorage.getItem("sort");
    if (!sortOption) {
      this.#workouts.forEach((workout) => {
        this._renderWorkout(workout);
        // this._renderWorkoutMarker(workout); // cannot be loaded because the map is not loaded yet
      });
    } else {
      // display sorted
      sortSelect.value = sortOption;
      this._sortWorkouts();
    }
  }
  reset() {
    localStorage.removeItem("workout");
    localStorage.removeItem("sort", sortSelect.value);
    location.reload();
  }

  /////////////////////////////////////////////////////////////////////////////////
  // extra functions
  // 1. delete button
  _containerWorkoutsEventCallbacks(e) {
    if (e.target.classList.contains("delete__btn")) {
      this._deleteWorkout(e);
    } else {
      this._moveToPopup(e);
    }
  }
  _clearWorkoutElements() {
    const workoutsEl = document.querySelectorAll("li.workout");
    workoutsEl.forEach((workoutEl) => workoutEl.remove());
  }

  _sortWorkouts() {
    const workoutsCopy = copyAndSortWorkouts(sortSelect.value, this.#workouts);

    this._clearWorkoutElements();
    workoutsCopy.forEach((workout) => {
      this._renderWorkout(workout);
      // this._renderWorkoutMarker(workout); // cannot be loaded because the map is not loaded yet
    });
    // store sorting option
    this._setLocalStorage();
  }

  _deleteWorkout(e) {
    // event delegation
    if (!e.target.classList.contains("delete__btn")) return;

    const workoutEl = e.target.closest(".workout");
    const deletingWorkout = this.#workouts.find(
      (workout) => workout.id === workoutEl.dataset.id
    );
    const index = this.#workouts.indexOf(deletingWorkout);
    // remove markup
    this._deleteWorkoutMarker(deletingWorkout);
    // delete it from #workouts, remove the ele and update localStorage
    this.#workouts.splice(index, 1);
    workoutEl.remove();
    this._setLocalStorage();
  }
  _deleteAll(e) {
    this.reset();
  }

  ////////////////////////////////////////////////////////////////////////
  // Edit information of workouts
  _editWorkout(e) {
    if (!e.target.classList.contains("edit__btn")) return;

    const workoutEl = e.target.closest(".workout");
    const workout = this.#workouts.find(
      (ele) => ele.id === workoutEl.dataset.id
    );
    editForm.classList.remove("hidden");
    this._populateFormInputs(workout);
    editForm.dataset.id = workout.id;
  }
  _populateFormInputs(workout) {
    editFormInputType.value = workout.type;
    editFormInputDistance.value = workout.distance;
    editFormInputDuration.value = workout.duration;
    if (workout.type === "running") {
      editFormInputCadence.value = workout.cadence;
      editFormInputCadence
        .closest(".form__row")
        .classList.remove("form__row--hidden");
      editFormInputElevation
        .closest(".form__row")
        .classList.add("form__row--hidden");
    }
    if (workout.type === "cycling") {
      editFormInputElevation.value = workout.elevationGain;
      editFormInputCadence
        .closest(".form__row")
        .classList.add("form__row--hidden");
      editFormInputElevation
        .closest(".form__row")
        .classList.remove("form__row--hidden");
    }
  }
  _toggleEditFormElevationField() {
    editFormInputCadence
      .closest(".form__row")
      .classList.toggle("form__row--hidden");
    editFormInputElevation
      .closest(".form__row")
      .classList.toggle("form__row--hidden");
  }
  // Submit edit form
  _updateWorkout(e) {
    e.preventDefault();
    const workoutId = editForm.dataset.id;
    const workout = this.#workouts.find((ele) => ele.id === workoutId);
    // update workout data from input values
    const distance = +editFormInputDistance.value;
    const duration = +editFormInputDuration.value;

    if (workout.type === "running") {
      const cadence = editFormInputCadence.value;
      if (!validInputs(distance, duration, cadence)) return;
      workout.cadence = cadence;
      workout.calcPace();
    }
    if (workout.type === "cycling") {
      const elevationGain = +editFormInputElevation.value;
      if (!validInputs(distance, duration, elevationGain)) return;
      workout.elevationGain = elevationGain;
      workout.calcSpeed();
    }
    workout.distance = distance;
    workout.duration = duration;
    this._updateWorkoutDisplay(workout);
    editForm.classList.add("hidden");
    this._setLocalStorage();
  }

  _updateWorkoutDisplay(workout) {
    const workoutEl = Array.from(
      containerWorkouts.querySelectorAll("li.workout")
    ).find((ele) => ele.dataset.id === workout.id);
    const newMarkup = this._renderWorkout(workout, false);
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // Compare newDOM and currentDOM, update current elements if any changes
    const newElements = Array.from(newDOM.querySelectorAll("*")).slice(1); //excluding li
    const curElements = Array.from(workoutEl.querySelectorAll("*"));
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        curEl.textContent = newEl.textContent;
      }
    });
  }
}

const app = new App();
