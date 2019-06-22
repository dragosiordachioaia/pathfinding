import React from "react";
import "./App.css";

const unitSize = 30;
const carCount = 20;
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

  if (
    oldDirection[0] + newDirection[0] === 0 &&
    oldDirection[1] === newDirection[1]
  ) {
    opposite = true;
  }
  if (
    oldDirection[1] + newDirection[1] === 0 &&
    oldDirection[0] === newDirection[0]
  ) {
    opposite = true;
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

  let isOK = false;
  try {
    isOK = road[y + speedY][x + speedX];
  } catch (e) {}
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
  for (let directionName in directions) {
    if (
      !directionsAreOpposite(directions[directionName], oldDirection) &&
      canGo(x, y, directionName)
    ) {
      validDirections.push(directions[directionName]);
    }
  }
  const newDirectionIndex = Math.floor(Math.random() * validDirections.length);
  let newDirection = null;
  let returnValue = null;

  try {
    newDirection = validDirections[newDirectionIndex];
    returnValue = {
      newSpeedX: newDirection[0],
      newSpeedY: newDirection[1]
    };
  } catch (e) {
    clearInterval(tickInterval);
  }

  if (!returnValue) {
    debugger;
  }
  return returnValue;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: this.generateCars()
    };
  }

  componentDidMount() {
    window.tick = this.tick;
    tickInterval = setInterval(this.tick, tickDelay);
  }

  tick = () => {
    let newCars = this.state.cars.map(car => {
      let newSpeedX = 0;
      let newSpeedY = 0;
      let canMove = true;

      let shouldChangeDirectionAtJunction = Math.random() > junctionChance;
      let mustChangeDirection = false;

      if (!canGo(car.x, car.y, null, car.speedX, car.speedY)) {
        mustChangeDirection = true;
      } else if (isJunction(car.x, car.y) && shouldChangeDirectionAtJunction) {
        mustChangeDirection = true;
      }
      if (mustChangeDirection) {
        const newDirection = chooseDirection(car.x, car.y, [
          car.speedX,
          car.speedY
        ]);
        newSpeedX = newDirection.newSpeedX;
        newSpeedY = newDirection.newSpeedY;
      } else {
        newSpeedX = car.speedX;
        newSpeedY = car.speedY;

        if (isAnotherCarInFront(car, this.state.cars)) {
          canMove = false;
        }
      }

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

        // let randomInitialCellIndex = Math.round(
        //   Math.random() * (validRoadCells.length - 1)
        // );
        let randomInitialCellIndex = 0;
        let initialCell = validRoadCells[randomInitialCellIndex];
        if (!initialCell) {
          debugger;
        }
        validRoadCells.splice(randomInitialCellIndex, 1);
        // debugger;
        // let randomInitialCellIndex = 6;
        // let initialCell = {
        //   x: 0,
        //   y: 16
        // };
        // let direction = {
        //   newSpeedY: 1,
        //   newSpeedX: 0
        // };

        let direction = chooseDirection(initialCell.x, initialCell.y, [0, 0]);

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
        // if (rowIndex === 1 && columnIndex === 2) {
        //   style.backgroundColor = "red";
        // }
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
