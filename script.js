'use strict';




class Workout {
  date = new Date();

  id = (Date.now() + ' ').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `
      ${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} 
      ${this.date.getDate()}
    `
  }
  // extra functions
  setDate(date) {
    this.date = new Date(date);
  }
  setId(id) {
    this.id == id;
  }
}
class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min / km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km / h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run = new Running([39, -12], 12, 100, 500);
// console.log(run);
///////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const sortDeleteAll = document.querySelector('.sort__delete__btns');
const deleteAllBtn = document.querySelector('.delete__all__btn')
const sortSelect = document.querySelector('#sort__workout');

class App {
  // private variables
  #map;
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
    containerWorkouts.addEventListener("click", this._containerWorkoutsEventCallbacks.bind(this));
    sortSelect.addEventListener('change', this._sortWorkouts.bind(this))
    deleteAllBtn.addEventListener('dblclick', this._deleteAll)

    // containerWorkouts.addEventListener("click", this._deleteWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Cannot Get Current Location!")
        })
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude]
    // leaflet library to display current location
    this.#map = L.map('map').setView(coords, this.#zoomLevel);

    L.tileLayer('https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    // Add marker on click ( .on() is a function from Leaflet)
    this.#map.on("click", this._showForm.bind(this));

    this.#workouts.forEach(workout => {
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
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    // Hide form
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => form.style.display = "grid", 1000);
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(num => Number.isFinite(num));
    const allPositive = (...inputs) =>
      inputs.every(num => num > 0);

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
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence) 
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Input has to be positive number");
      }
      workout = new Running([lat, lng], distance, duration, cadence);

    }
    // 3. If type is cycling, create Cycling object
    if (type === "cycling") {
      // data validation
      const elevation = +inputElevation.value;
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(elevation) 
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) // elevation can be negative
      ) {

        return alert("Input has to be positive number");
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    console.log(workout.date);
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
    L.marker(workout.coords).addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`
      })) // new popup object 
      .setPopupContent(`${workout.type === "running" ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="edit__btns">
          <button class="edit__btn">+</button>
          <button class="delete__btn">x</button>
        </div>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === "running" ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
      `
    if (workout.type === "running") {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
      </li>
      `
    }
    if (workout.type === "cycling") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `
    }
    sortDeleteAll.insertAdjacentHTML("afterend", html);
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;
    const workout = this.#workouts.find(ele =>
      ele.id === workoutEl.dataset.id);
    this.#map.setView(workout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1
      }
    })
  }

  _setLocalStorage() {
    localStorage.setItem("workout", JSON.stringify(this.#workouts));
    localStorage.setItem("sort", sortSelect.value);
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workout"));
    if (!data) return;
    // convert object array from localStorage to Workout array 
    sortSelect.value = localStorage.getItem("sort")
    this._objectToWorkout(data)

    // this.#workouts = data; data is an object array, not Workout array
    // render Workouts
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
      // this._renderWorkoutMarker(workout); // cannot be loaded because the map is not loaded yet
    });

  }
  reset() {
    localStorage.removeItem("workout");
    location.reload();
  }

  /////////////////////////////////////////////////////////////////////////////////
  // extra functions
  // 1. delete button 
  _containerWorkoutsEventCallbacks(e) {
    if (e.target.classList.contains("delete__btn")) {
      this._deleteWorkout(e);
    }
    else {
      this._moveToPopup(e);
    }
  }

  _sortWorkouts() {
    console.log(this.#workouts)
    console.log(sortSelect.value)
    const criteria = sortSelect.value;
    switch (criteria) {
      case 'duration':
      case 'distance':
        this.#workouts.sort((a, b) => {
          return parseFloat(a[criteria]) - parseInt(b[criteria])
        });
        break;
      case 'type':
        this.#workouts.sort((a, b) => a.type > b.type ? 1 : -1);
        break;
    }
    const workoutsEl = document.querySelectorAll('li.workout');
    workoutsEl.forEach(workoutEl => workoutEl.remove());

    console.log(this.#workouts)
    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
      // this._renderWorkoutMarker(workout); // cannot be loaded because the map is not loaded yet
    });
    this._setLocalStorage();
    // location.reload();
  }

  _deleteWorkout(e) {
    // event delegation
    const workoutEl = e.target.closest(".workout");
    const workout = this.#workouts.find(ele =>
      ele.id === workoutEl.dataset.id);
    const index = this.#workouts.indexOf(workout);
    // delete it from #workouts, remove the ele and update localStorage
    this.#workouts.splice(index, 1);
    workoutEl.remove();
    this._setLocalStorage()

  }
  _deleteAll() {
    this.reset();
  }
  // 2. convert object array from localStorage to Workout array
  _objectToWorkout(data) {
    let workout;
    // self-initiated funtion 2. convert object array to workout array 
    data.forEach(object => {
      if (object.type === "running")
        workout = new Running(object.coords, object.distance, object.duration, object.cadence);
      if (object.type === "cycling")
        workout = new Cycling(object.coords, object.distance, object.duration, object.elevationGain);
      workout.setDate(object.date);
      workout.setId(object.id);
      this.#workouts.push(workout);
    })
  }

}
const app = new App();



