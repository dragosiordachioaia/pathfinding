import React from "react";
import "./App.css";

const unitSize = 30;
const carCount = 1;
const tickDelay = 16;
const junctionChance = 0.5;
let tickInterval = null;

const directions = {
  up: [0, -1],
  down: [0, 1],
  right: [1, 0],
  left: [-1, 0]
};

let road = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const targetRowIndex = road.length - 1;
const targetColumnIndex = road[targetRowIndex].length - 1;
const target = [targetColumnIndex, targetRowIndex];
console.log(target);
const targetRow = road[target[0]];
const targetCell = targetRow[target[1]];
console.log(targetCell);
// debugger;
window.target = target;

let validRoadCells = [];

road.forEach((row, rowIndex) => {
  row.forEach((isRoad, columnIndex) => {
    if (isRoad) {
      validRoadCells.push({ x: columnIndex, y: rowIndex });
    }
  });
});

function directionsAreOpposite(oldDirection, newDirection) {
  let opposite = false;

  if (oldDirection[0]) {
    if (
      oldDirection[0] === -newDirection[0] &&
      oldDirection[1] === newDirection[1]
    ) {
      opposite = true;
    }
  }
  if (oldDirection[1]) {
    if (
      oldDirection[1] === -newDirection[1] &&
      oldDirection[0] === newDirection[0]
    ) {
      opposite = true;
    }
  }
  return opposite;
}

function canGo(x, y, direction, speedXParam, speedYParam) {
  let speedX = 0;
  let speedY = 0;

  if (direction) {
    speedX = directions[direction][0];
    speedY = directions[direction][1];
  } else {
    speedX = speedXParam;
    speedY = speedYParam;
  }

  let isOK = road[y + speedY] && road[y + speedY][x + speedX];

  return isOK;
}

function isAnotherCarInFront({ x, y, speedX, speedY }, cars) {
  return (
    cars.filter(currentCar => {
      return currentCar.x === x + speedX && currentCar.y === y + speedY;
    }).length > 0
  );
}

function isJunction(x, y) {
  let validDirections = [];
  for (let directionName in directions) {
    if (canGo(x, y, directionName)) {
      validDirections.push(directions[directionName]);
    }
  }
  return validDirections.length >= 3;
}

function chooseDirection(x, y, oldDirection) {
  let validDirections = [];
  // debugger;
  for (let directionName in directions) {
    if (
      !directionsAreOpposite(directions[directionName], oldDirection) &&
      canGo(x, y, directionName)
    ) {
      validDirections.push(directions[directionName]);
    }
  }
  // const newDirectionIndex = Math.floor(Math.random() * validDirections.length);
  let newDirectionIndex = null;
  let minDistance = Number.MAX_SAFE_INTEGER;
  validDirections.forEach((direction, directionIndex) => {
    const newCellX = x + direction[0];
    const newCellY = y + direction[1];
    const distance = getDistance(
      { x: target[0], y: target[1] },
      { x: newCellX, y: newCellY }
    );
    if (distance < minDistance) {
      minDistance = distance;
      newDirectionIndex = directionIndex;
    }
  });
  console.log("minDistance: ", minDistance);
  let newDirection = validDirections[newDirectionIndex];
  let returnValue = {
    newSpeedX: newDirection[0],
    newSpeedY: newDirection[1]
  };

  if (!returnValue) {
    debugger;
  }
  return returnValue;
}

function getDistance(pointA, pointB) {
  const deltaX = pointA.x - pointB.x;
  const deltaY = pointA.y - pointB.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: this.generateCars()
    };
    window.cars = this.state.cars;
  }

  componentDidMount() {
    window.tick = this.tick;
    tickInterval = setInterval(this.tick, tickDelay);
    window.cars = this.printCars;
  }

  printCars = () => {
    console.log(this.state.cars[0]);
  };

  tick = () => {
    let newCars = this.state.cars.map(car => {
      let newSpeedX = 0;
      let newSpeedY = 0;
      let canMove = true;
      if (car.x === target[0] && car.y === target[1]) {
        canMove = false;
        if (tickInterval) clearInterval(tickInterval);
        // alert("yohoo");
      }
      const newDirection = chooseDirection(car.x, car.y, [
        car.speedX,
        car.speedY
      ]);
      newSpeedX = newDirection.newSpeedX;
      newSpeedY = newDirection.newSpeedY;

      let newCarProperties = {
        ...car,
        speedX: newSpeedX,
        speedY: newSpeedY
      };

      if (canMove) {
        newCarProperties.x = newCarProperties.x + newSpeedX;
        newCarProperties.y = newCarProperties.y + newSpeedY;
      } else {
        newCarProperties.x = car.x;
        newCarProperties.y = car.y;
      }
      console.log(newCarProperties);
      return newCarProperties;
    });
    this.setState({ cars: newCars });
  };

  generateCars = () => {
    return Array(carCount)
      .fill(null)
      .map((car, index) => {
        const red = Math.round(Math.random() * 155) + 100;
        const blue = Math.round(Math.random() * 155) + 100;
        const green = Math.round(Math.random() * 155) + 100;
        const rgb = `rgb(${red},${blue},${green})`;

        let randomInitialCellIndex = Math.round(
          Math.random() * (validRoadCells.length - 1)
        );
        // let randomInitialCellIndex = 0;
        // let initialCell = validRoadCells[randomInitialCellIndex];
        // if (!initialCell) {
        //   debugger;
        // }
        // validRoadCells.splice(randomInitialCellIndex, 1);
        // let direction = chooseDirection(initialCell.x, initialCell.y, [0, 0]);

        // debugger;
        // let randomInitialCellIndex = 6;
        let initialCell = {
          x: 11,
          y: 0
        };
        let direction = {
          newSpeedY: 0,
          newSpeedX: 1
        };

        // debugger;
        const carParams = {
          id: Math.floor(Math.random() * 10000000),
          color: rgb,
          speedX: direction.newSpeedX,
          speedY: direction.newSpeedY,
          x: initialCell.x,
          y: initialCell.y
        };
        // debugger;
        return carParams;
      });
  };

  displayCars = () => {
    return this.state.cars.map(car => {
      return (
        <div
          className="car"
          key={car.id}
          style={{
            left: car.x * unitSize,
            top: car.y * unitSize,
            backgroundColor: car.color,
            width: unitSize + "px",
            height: unitSize + "px"
          }}
        >
          {/* <span className="car-label">
            {car.x}:{car.y}
          </span> */}
        </div>
      );
    });
  };

  displayRoad = () => {
    return road.map((row, rowIndex) => {
      return row.map((isRoad, columnIndex) => {
        let style = {
          left: columnIndex * unitSize,
          top: rowIndex * unitSize,
          width: unitSize + "px",
          height: unitSize + "px",
          backgroundColor: isRoad ? "#444" : "#fff"
        };
        if (rowIndex === target[1] && columnIndex === target[0]) {
          style.backgroundColor = "red";
        }
        return (
          <div
            className="road"
            key={`road-${rowIndex}-${columnIndex}`}
            style={style}
          >
            {/* <span className="road-label">
              {columnIndex}:{rowIndex}
            </span> */}
          </div>
        );
      });
    });
  };

  render() {
    return (
      <div className="game">
        {this.displayRoad()}
        {this.displayCars()}
      </div>
    );
  }
}

export default App;
