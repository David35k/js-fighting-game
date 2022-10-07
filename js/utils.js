//Changing the timer
let timerId;
function decreaseTimer() {
    if (!gameOver) {
        if (timer > 0) {
            timerId = setTimeout(decreaseTimer, 1000);
            timer--;
            timeText.innerHTML = timer;
        }

        //End game based on time. Whoever has more health wins
        if (timer === 0) {
            whoWins({ player, enemy });
        }
    }
}

//A function that checks the different collisions in the game
//The different types of collisions are long and short range
function attackCollision({ rectangle1, rectangle2 }, type) {
    if (type === "short") {
        return (
            rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
            rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
            rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
        );
    } else if (type === "long") {
        return (
            rectangle1.attackBoxRange.position.x + rectangle1.attackBoxRange.size >= rectangle2.position.x &&
            rectangle1.attackBoxRange.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.attackBoxRange.position.y + rectangle1.attackBoxRange.size >= rectangle2.position.y &&
            rectangle1.attackBoxRange.position.y <= rectangle2.position.y + rectangle2.height
        );
    }
}

//A function that will detect whether there has been a deflection
function isDeflected({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBoxRange.position.x + rectangle1.attackBoxRange.size >= rectangle2.attackBox.position.x &&
        rectangle1.attackBoxRange.position.x <= rectangle2.attackBox.position.x + rectangle2.attackBox.width &&
        rectangle1.attackBoxRange.position.y + rectangle1.attackBoxRange.size >= rectangle2.attackBox.position.y &&
        rectangle1.attackBoxRange.position.y <= rectangle2.attackBox.position.y + rectangle2.attackBox.height
    );
}

//This is for changing the css variables depending on the background

// Get the root element
var r = document.querySelector(':root');

// Create a function for getting a variable value
function cssGetVar(variable) {
  // Get the styles (properties and values) for the root
  var rs = getComputedStyle(r);
  //Log the value of the variable
  console.log("The value of the variable is: " + rs.getPropertyValue(variable));
}

// Create a function for setting a variable value
function cssSetVar(variable, value) {
  r.style.setProperty(variable, value);
}
