import { Running, Cycling } from "./Wortkout.js";

export const objectToWorkout = function (data) {
  // self-initiated funtion 2. convert object array to workout array
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

const numberInputs = (...inputs) => inputs.every((num) => Number.isFinite(num));

const allPositive = (...inputs) => inputs.every((num) => num > 0);

export const validInputs = function (...inputs) {
  if (!numberInputs(...inputs) || !allPositive(...inputs)) {
    alert("Input has to be positive number");
    return false;
  }
  return true;
};
