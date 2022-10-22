# Mapty App - JavaScript OOP Project

"Mapty" is a proeject from [JavaScript Course by Jonas Schmedtmann](https://www.udemy.com/course/the-complete-javascript-course/). This course solidifies my understanding on different JavaScript concepts (e.g. DOM, Mordern OOP, Asynchronous JS and Modern tools for JS) and offers me challenging exercises and realistic projects to improve my coding skills.

"Mapty" is a project to work on OOP, JS Classes, DOM, Geolocation, External Library "Leaflet" and project planning. The application incorporate a map, a user can use the map to keep track of their exercise records, edit and navigate their exercise history.

In addition to the features coded during the tutorial, I added serveral features by myself to reinforce my learning and upgrade the functionality of the app.

![image](Screenshot-mapty.png?raw=true)

## Overview

### The challenge

Users should be able to:

- View the map on a user's current location and their workout records when visiting the page
- See add-workout form when clicking a place on the map
- Change input options after selecting a different workout type
- add a new item to the list and add its marker to the map by submiting a form
- See the map move to corresponding marker when clicking a workout on the list

**Addtional features I added:**

- Delete a workout and its marker
- Deleting all workouts and all markers
- Show edit-workout form when the edit button is click, the information of the workout will be updated after submitting the form
- Sort workouts in the list

### Links

- Live: [Mapty](https://mapty-isaactangky.netlify.app/)

## My process

### Built with

- HTML
- CSS
- JavaScript
- OOP
- Geolocation API
- [Leaflet Library](https://leafletjs.com/)

### Build Process of self-initiated features

#### Rebuilding Workout objects from localStorage data

JSON.parse(data) function parses the data to an unstructured JS Object, a function was coded to rebuild a Workout object:

```js
export const objectToWorkout = function (data) {
  // self-initiated funtion 2. convert object array to workout array
  console.log("data", data);
  return data.map((object) => {
    const workout =
      object.type === "running"
        ? new Running(
            object.coords,
            object.distance,
            object.duration,
            object.cadence
          )
        : new Cycling(
            object.coords,
            object.distance,
            object.duration,
            object.elevationGain
          );
    workout.setDate(object.date);
    workout.setId(object.id);
    return workout;
  });
};
```

#### Deleting a workout

Deleting a workout involves deleting Workout object in App state, deleting DOM element and deleting marker on the map.

```js
 _deleteWorkout(e) {
    ...
    const workoutEl = e.target.closest(".workout");
    const deletingWorkout = this.#workouts.find(
      (workout) => workout.id === workoutEl.dataset.id
    );
    const index = this.#workouts.indexOf(deletingWorkout);
    this._deleteWorkoutMarker(deletingWorkout);
    this.#workouts.splice(index, 1);
    workoutEl.remove();
    this._setLocalStorage();
  }
```

#### Editing Workout data

A seperate form is add to workout container, the edit form filled with Workout values shows up when the edit button is clicked.

The form stores the id of the workout. So the workout can be found when the form is submited. The workout display will also be updated after submiting the form.

#### Sorting Workouts

Sorting is triggered when a user selects a different sorting criteria. Sorting is applied on a copy of the workouts array, the copy array then rerender on the list.

The value of option elements determine the comparator function passed to .sort() function:

```js
export const copyAndSortWorkouts = function (criteria, array) {
  const arrayCopy = array.slice(0);
  switch (criteria) {
    case "duration":
    case "distance":
      arrayCopy.sort((a, b) => parseFloat(a[criteria]) - parseInt(b[criteria]));
      break;
    case "date":
      arrayCopy.sort((a, b) => new Date(a[criteria]) - new Date(b[criteria]));
      break;
    case "type":
      arrayCopy.sort((a, b) => (a.type > b.type ? 1 : -1));
      break;
  }
  return arrayCopy;
};
```

### Continued development

New features to be implements

- responsive website designs
- server-site storage
- add workout type
- add workout summary

## Acknowledgments

The HTML work and CSS designs are credited to [Jonas Schmedtmann](https://www.udemy.com/course/the-complete-javascript-course/).

I contributed a few HTML and CSS works for the features I added.
