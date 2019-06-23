import React from "react";
import "./App.css";
// import road from "./Road.json";

let road = Array(400).fill(null);
road = road.map(() => {
  return Array(400)
    .fill(null)
    .map(element => (Math.random() > 0.2 ? 1 : 0));
});

// console.log(road);
const MAX_DEPTH = 10000;
const unitSize = 3;
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

// const targetIndex = Math.floor(
//   validRoadCells.length * 0.95 +
//     Math.random() * (validRoadCells.length * 0.05 - 1)
// );
const targetIndex = validRoadCells.length - 1;
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

  let isOK = road[y + speedY] && road[y + speedY][x + speedX] === 1;

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
  } else {
    return false;
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
    this.waves = [[{ cell: [0, 0] }]];
    window.waves = this.waves;
    window.cars = this.state.cars;
  }

  componentDidMount() {
    // window.tick = this.tick;
    // tickInterval = setInterval(this.tick, tickDelay);
    window.cars = this.printCars;
    window.start = this.start;
    // setTimeout(this.start, 1000);
  }

  start = () => {
    this.startTime = Date.now();
    // this.next(paths);
    this.nextWave();
  };

  isTarget = cell => {
    return cell[0] === target[0] && cell[1] === target[1];
  };

  nextWave = () => {
    // debugger;
    const currentWave = this.waves[this.waves.length - 1];
    // console.log("starting wave", this.waves.length);
    // console.log(this.waves);
    let targetFound = false;
    const nextWave = [];

    for (let i = 0; i < currentWave.length; i++) {
      const parent = currentWave[i];

      for (let directionName in directions) {
        const newCell = canGo(parent.cell[0], parent.cell[1], directionName);
        // debugger;

        if (newCell) {
          const newParent = {
            cell: newCell,
            parent: parent,
            directionName
          };

          if (this.isTarget(newCell)) {
            targetFound = true;
            this.setShortestPath(newParent);
            break;
          } else {
            nextWave.push(newParent);
          }
        }
      }
    }

    this.waves.push(nextWave);
    // this.setState({ waves: this.waves });
    if (targetFound) {
      this.endTime = Date.now();
      this.duration = this.endTime - this.startTime;
      // alert(`Target found in ${this.duration}ms`);
      console.log(
        `targetFound at level ${this.waves.length} in ${this.duration} ms`
      );
      // this.setState({ waves: this.waves });
    } else {
      if (this.waves.length % 10) {
        setTimeout(this.nextWave, 0);
      } else {
        this.nextWave();
      }
    }
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
      setTimeout(() => alert(`Target found in ${this.duration}ms`), 1000);
      // this.setState({ path: paths });
      this.setShortestPath(currentParent);
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
      currentParent.branches.forEach(branch => {
        if (!this.targetFound) {
          this.next(branch);
        }
      });
    }, 1);
  };

  setShortestPath = currentCell => {
    // debugger;
    let shortestPath = this.getParentPath([], currentCell).reverse();
    // console.log("shortestPath:", shortestPath);
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

  printCars = () => {
    console.log(this.state.cars[0]);
  };

  // tick = () => {
  //   let newCars = this.state.cars.map(car => {
  //     let newSpeedX = 0;
  //     let newSpeedY = 0;
  //     let canMove = true;
  //     if (car.x === target[0] && car.y === target[1]) {
  //       canMove = false;
  //       if (tickInterval) clearInterval(tickInterval);
  //       // alert("yohoo");
  //     }
  //     const newDirection = chooseDirection(car.x, car.y, [
  //       car.speedX,
  //       car.speedY
  //     ]);
  //     newSpeedX = newDirection.newSpeedX;
  //     newSpeedY = newDirection.newSpeedY;

  //     let newCarProperties = {
  //       ...car,
  //       speedX: newSpeedX,
  //       speedY: newSpeedY
  //     };

  //     if (canMove) {
  //       newCarProperties.x = newCarProperties.x + newSpeedX;
  //       newCarProperties.y = newCarProperties.y + newSpeedY;
  //     } else {
  //       newCarProperties.x = car.x;
  //       newCarProperties.y = car.y;
  //     }
  //     return newCarProperties;
  //   });
  //   let newPath = [...this.state.path, [newCars[0].x, newCars[0].y]];

  //   this.setState({
  //     cars: newCars,
  //     path: newPath
  //   });
  // };

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

  displayMap = () => {
    let style = {
      left: 0,
      top: 0,
      height: road.length * unitSize + "px",
      width: road[0].length * unitSize + "px",
      backgroundColor: "#444"
    };
    return <div style={style} />;
  };

  displayRoad = () => {
    return road.map((row, rowIndex) => {
      return row.map((isRoad, columnIndex) => {
        if (isRoad) return null;
        let style = {
          left: columnIndex * unitSize,
          top: rowIndex * unitSize,
          width: unitSize + "px",
          height: unitSize + "px",
          backgroundColor: "#eee"
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

  displayWaves = () => {
    if (!this.state.waves) {
      return null;
    }
    return this.state.waves.map((wave, waveIndex) => {
      if (!wave) {
        return null;
      }
      return wave.map((parent, cellIndex) => {
        // console.log("cell = ", cell);
        const wavePercentage = waveIndex / (this.state.waves.length - 1);
        const red = wavePercentage * 150 + 100;
        const blue = wavePercentage * 150 + 100;
        const green = wavePercentage * 150 + 100;
        let style = {
          left: parent.cell[0] * unitSize,
          top: parent.cell[1] * unitSize,
          width: unitSize / 2 + "px",
          height: unitSize / 2 + "px",
          backgroundColor: `rgb(0,${green},${blue})`
        };
        return (
          <div
            className="path"
            key={`wave-${waveIndex}-cell-${cellIndex}`}
            style={style}
          />
        );
      });
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

  flattenLevel = currentParent => {
    const flat = [currentParent.cell];
    if (currentParent.branches) {
      currentParent.branches.forEach(branch => {
        flat.push(...this.flattenLevel(branch));
      });
    }

    return flat;
  };

  // displayPathLevel = currentParent => {
  //   if (currentParent.branches) {
  //     branches = currentParent.branches.map(branch =>
  //       this.displayPathLevel(branch)
  //     );
  //   }
  //   if (!currentParent || !currentParent.cell) {
  //     return null;
  //   }
  // };

  render() {
    return (
      <div className="game">
        {this.displayRoad()}
        {this.displayMap()}
        {/* {this.displayWaves()} */}
        {this.displayShortestPath()}
        {this.displayCars()}
        {this.displayTarget()}
      </div>
    );
  }
}

export default App;
