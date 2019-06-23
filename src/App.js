import React from "react";
import "./App.css";
// import road from "./Road.json";

let road = Array(100).fill(null);
road = road.map(() => {
  return Array(200)
    .fill(null)
    .map(element => (Math.random() > 0.2 ? 1 : 0));
});

// console.log(road);
const MAX_DEPTH = 10000;
const unitSize = 6;
const carCount = 1;
const tickDelay = 16;
const junctionChance = 0.5;
let tickInterval = null;
let visitedCells = {};

const directions = {
  up: [0, -1],
  down: [0, 1],
  right: [1, 0],
  left: [-1, 0]
};

let validRoadCells = [];

road.forEach((row, rowIndex) => {
  row.forEach((isRoad, columnIndex) => {
    if (isRoad) {
      validRoadCells.push({ x: columnIndex, y: rowIndex });
    }
  });
});

const targetIndex = Math.floor(Math.random() * (validRoadCells.length - 1));
const targetCell = validRoadCells[targetIndex];
const target = [targetCell.x, targetCell.y];
window.target = target;

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

  if (isOK) {
    // debugger;
    let cellKey = `${x + speedX}-${y + speedY}`;
    if (visitedCells[cellKey]) {
      // console.log("coming from cell", x, y, "visitedCell:", cellKey);
      return false;
    } else {
      // console.log("cell", cellKey, "is fine");
      visitedCells[cellKey] = true;
      return [x + speedX, y + speedY];
    }
  }
}

let paths = { cell: [0, 0], level: 0 };

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: this.generateCars(),
      path: [],
      shortestPath: []
    };

    this.targetFound = false;
    this.messagePrinted = false;
    this.canContinue = true;
    this.deepestLevel = 0;

    window.cars = this.state.cars;
  }

  componentDidMount() {
    window.tick = this.tick;
    // tickInterval = setInterval(this.tick, tickDelay);
    window.cars = this.printCars;
    window.start = this.start;
    setTimeout(this.start, 1000);
  }

  start = () => {
    this.startTime = Date.now();
    this.next(paths);
  };

  setShortestPath = currentCell => {
    let shortestPath = this.getParentPath([], currentCell).reverse();
    console.log("shortestPath:", shortestPath);
    this.setState({ shortestPath });
  };

  getParentPath = (pathSoFar, currentCell) => {
    if (!currentCell.parent) {
      return pathSoFar;
    }
    return this.getParentPath(
      [...pathSoFar, currentCell.parent.cell],
      currentCell.parent
    );
  };

  next = currentParent => {
    const cell = currentParent.cell;
    // console.log("next");
    // debugger;
    if (!this.canContinue) return;

    if (cell[0] === target[0] && cell[1] === target[1]) {
      this.targetFound = true;
      this.canContinue = false;
      this.messagePrinted = true;
      this.endTime = Date.now();
      this.duration = this.endTime - this.startTime;
      // this.setState({ path: paths });
      this.setShortestPath(currentParent);
      setTimeout(() => alert(`Target found in ${this.duration}ms`), 1000);
      console.log(`found at level ${currentParent.level}`);

      return;
    }

    if (currentParent.level > MAX_DEPTH) {
      this.canContinue = false;
      if (!this.messagePrinted) {
        this.messagePrinted = true;
        alert("max level reached");
        console.log(paths);
      }
    }

    if (!currentParent.branches) {
      currentParent.branches = [];
    }
    for (let directionName in directions) {
      const newCell = canGo(cell[0], cell[1], directionName);
      let directionIsOK = true;
      // if (currentParent.directionName) {
      //   directionIsOK = !directionsAreOpposite(
      //     directions[directionName],
      //     directions[currentParent.directionName]
      //   );
      // }

      if (newCell && directionIsOK) {
        const newBranch = {
          cell: newCell,
          cellParent: currentParent.cell,
          directionName,
          parent: currentParent,
          level: currentParent.level + 1
        };
        currentParent.branches.push(newBranch);
      }
    }

    // console.log("currentParent = ", currentParent);
    if (currentParent.level > this.deepestLevel) {
      this.deepestLevel = currentParent.level;
      // this.setState({ path: paths });
    }
    setTimeout(() => {
      // console.log(
      //   "currentParent.branches.length = ",
      //   currentParent.branches.length
      // );
      currentParent.branches.forEach(branch => {
        if (!this.targetFound) {
          this.next(branch);
        }
      });
    }, 1);
  };

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
      return newCarProperties;
    });
    let newPath = [...this.state.path, [newCars[0].x, newCars[0].y]];

    this.setState({
      cars: newCars,
      path: newPath
    });
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
        // let initialCell = validRoadCells[randomInitialCellIndex];
        // validRoadCells.splice(randomInitialCellIndex, 1);
        // let direction = chooseDirection(initialCell.x, initialCell.y, [0, 0]);

        // debugger;
        // let randomInitialCellIndex = 6;
        let initialCell = {
          x: 0,
          y: 0
        };
        // let direction = chooseDirection(initialCell.x, initialCell.y, [0, 0]);
        // let direction = {
        //   newSpeedY: 0,
        //   newSpeedX: 1
        // };

        // debugger;
        const carParams = {
          id: Math.floor(Math.random() * 10000000),
          color: rgb,
          speedX: 0,
          speedY: 0,
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

  displayTarget = () => {
    const style = {
      left: target[0] * unitSize,
      top: target[1] * unitSize,
      width: unitSize * 1.5 + "px",
      height: unitSize * 1.5 + "px",
      backgroundColor: "red"
    };
    return <div className="target" style={style} />;
  };

  displayShortestPath = () => {
    return this.state.shortestPath.map((cell, index) => {
      let style = {
        left: cell[0] * unitSize,
        top: cell[1] * unitSize,
        width: unitSize / 2 + "px",
        height: unitSize / 2 + "px",
        backgroundColor: "rgb(0,255,0)"
      };

      return (
        <div
          className="shortest-path"
          style={style}
          key={`shortest-path-${cell[0]}-${cell[1]}-${index}`}
        />
      );
    });
  };

  displayPath = () => {
    const pathElements = this.flattenLevel(this.state.path);
    // console.log(pathElements);

    return pathElements.map((cell, index) => {
      if (!cell) {
        return null;
      }

      let style = {
        left: cell[0] * unitSize,
        top: cell[1] * unitSize,
        width: unitSize / 4 + "px",
        height: unitSize / 4 + "px",
        backgroundColor: "#2ecc71"
      };

      return (
        <div
          className="path"
          style={style}
          key={`path-${cell[0]}-${cell[1]}-${index}`}
        />
      );
    });
  };

  // flattenLevel = currentParent => {
  //   if (currentParent.branches) {
  //     return currentParent.cell;
  //   }
  //   return;
  // };

  flattenLevel = currentParent => {
    const flat = [currentParent.cell];
    if (currentParent.branches) {
      currentParent.branches.forEach(branch => {
        flat.push(...this.flattenLevel(branch));
      });
    }

    return flat;
  };

  displayPathLevel = currentParent => {
    let branches = null;
    if (currentParent.branches) {
      branches = currentParent.branches.map(branch =>
        this.displayPathLevel(branch)
      );
    }
    if (!currentParent || !currentParent.cell) {
      return null;
    }
  };

  render() {
    return (
      <div className="game">
        {this.displayRoad()}
        {this.displayPath()}
        {this.displayShortestPath()}
        {this.displayCars()}
        {this.displayTarget()}
      </div>
    );
  }
}

export default App;
