# Mapty App - JavaScript OOP Project

This is a project "Mapty" of [JavaScript Course by Jonas Schmedtmann](https://www.udemy.com/course/the-complete-javascript-course/). This course solidifies my understanding on different JavaScript concepts (e.g. DOM, Mordern OOP, Asynchronous JS and Modern tools for JS) and offer me challenging exercises and realistic projects to improve my coding skills.

"Mapty" is a code-alone project to work on OOP, JS Classes, DOM, Geolocation, External Library "Leaflet" and project planning.

In addition to the functions coded during the course, I also add serveral functions by myself to reinforce the learning and improve the functionality of the app. The appllication incorporate map, a user can use the map to keep track of their exercise records, and edit and navigate their exercise history.

![image](Screenshot-mapty.png?raw=true)

## Overview

### The challenge

Users should be able to:

- View the map capturing a user's current location and their workout records when visisting the page
- See add-workout form when clicking a place on the map
- Change input options when selecting a different workout type
- add a new item to the list and its markup to the map by submiting the form
- See the map move to the markup when clicking a workout on the list

Addtional functions I added:

- Delete a workout and its markup
- Deleting all workouts and all markups
- Show edit-workout form when the edit button is click, the information of the workout will be updated after submitting the form
- Sort workouts on the list

### Screenshot

![](./screenshot.jpg)

Add a screenshot of your solution. The easiest way to do this is to use Firefox to view your project, right-click the page and select "Take a Screenshot". You can choose either a full-height screenshot or a cropped one based on how long the page is. If it's very long, it might be best to crop it.

Alternatively, you can use a tool like [FireShot](https://getfireshot.com/) to take the screenshot. FireShot has a free option, so you don't need to purchase it.

Then crop/optimize/edit your image however you like, add it to your project, and update the file path in the image above.

**Note: Delete this note and the paragraphs above when you add your screenshot. If you prefer not to add a screenshot, feel free to remove this entire section.**

### Links

- Live: [Mapty](https://mapty-isaactangky.netlify.app/)

## My process

### Built with

- CSS
- DOM Manipultion
- OOP
- Geolocation API
- [Leaflet Library](https://leafletjs.com/)

### Build Process for self-initiated features

#### Rebuilding Workout objects from localStorage data

JSON.parse(data) function parses the data to an unstructured JS Object, a function was coded to rebuild a Workout object:

```js
_objectToWorkout(data) {
    let workout;
    // self-initiated funtion 2. convert object array to workout array
    console.log(data);
    data.forEach((object) => {
      object.type === "running"
        ? (workout = new Running(
            object.coords,
            object.distance,
            object.duration,
            object.cadence
          ))
        : (workout = new Cycling(
            object.coords,
            object.distance,
            object.duration,
            object.elevationGain
          ));
      // Correct date and id
      workout.setDate(object.date);
      workout.setId(object.id);
      this.#workouts.push(workout);
    });
  }
```

The **MVC architecture** is the most important concept I learned in the project. I was amazed by how this help to clearify the structure of the projects. From my understanding, model helps to deal with the business logic and state, Controller calls the actual functions and View components accept user input and render information to the user. This architecture help to increase the maintainability and expandibility of the codes. I look forward to exploring more on this architecture and other architecture concepts.

```js
addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault() // cannot call handler directly
      handler();
    });
  }
```

and call the addHandler methods at page load. By applying the pattern, we do not need to add event listeners in the controller, which means that we can maintain the MVC structure.

The **Algorithm to Update the DOM** was also good lesson to me. I was also frustrated by the that the whole page has to be reloaded even when I change only one component in the DOM. Janas' algorithm creates a virtual DOM fragment containing the new elements, compares the existing DOM and new elements, updates the element text content and attribute only when there are any changes. This algorithm prevent the whole page reloading and flashing. This algorithm is useful in reducing the page loads and improving user experience.

**Error Handling**

Use this section to recap over some of your major learnings while working through this project. Writing these out and providing code samples of areas you want to highlight is a great way to reinforce your own knowledge.

To see how you can add code snippets, see below:

```html
<h1>Some HTML code I'm proud of</h1>
```

```css
.proud-of-this-css {
  color: papayawhip;
}
```

If you want more help with writing markdown, we'd recommend checking out [The Markdown Guide](https://www.markdownguide.org/) to learn more.

**Note: Delete this note and the content within this section and replace with your own learnings.**

### Continued development

New features to be implements

- displaying no of pages at the bottom of Pagination area
- sort search results by duration / num of ing
- perform ingredient input validation
- improve recipe ingredient input

- shopping list feature

- Weekly meal planning feature

- Get nutrition data from food-api

Use this section to outline areas that you want to continue focusing on in future projects. These could be concepts you're still not completely comfortable with or techniques you found useful that you want to refine and perfect.

**Note: Delete this note and the content within this section and replace with your own plans for continued development.**

### Useful resources

- [Example resource 1](https://www.example.com) - This helped me for XYZ reason. I really liked this pattern and will use it going forward.
- [Example resource 2](https://www.example.com) - This is an amazing article which helped me finally understand XYZ. I'd recommend it to anyone still learning this concept.

**Note: Delete this note and replace the list above with resources that helped you during the challenge. These could come in handy for anyone viewing your solution or for yourself when you look back on this project in the future.**

## Author

- Website - [Add your name here](https://www.your-site.com)
- Frontend Mentor - [@yourusername](https://www.frontendmentor.io/profile/yourusername)
- Twitter - [@yourusername](https://www.twitter.com/yourusername)

**Note: Delete this note and add/remove/edit lines above based on what links you'd like to share.**

## Acknowledgments

Most of the html and CSS designs are credited to Jonas Schmedtmann.
