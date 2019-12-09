import React from "react";
import "./App.css";

let road = Array(80).fill(null);
road = road.map(() => {
  return Array(270)
    .fill(null)
    .map(() => (Math.random() > 0.2 ? 1 : 0));
});

const unitSize = 5;
const carCount = 1;
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

let target = null;
window.target = target;

function canGo(x, y, direction) {
  let speedX = directions[direction][0];
  let speedY = directions[direction][1];

  let isOK = road[y + speedY] && road[y + speedY][x + speedX] === 1;

  if (isOK) {
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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: this.generateCars(),
      path: [],
      shortestPath: [],
      target: null
    };

    this.initialWaves = [[{ cell: [0, 0] }]];
    this.waves = JSON.parse(JSON.stringify(this.initialWaves));
    window.waves = this.waves;
    window.cars = this.state.cars;
  }

  chooseTarget = () => {
    // const targetIndex = validRoadCells.length - 1;
    const targetIndex = Math.floor(
      // validRoadCells.length * 0.95 +
      Math.random() * (validRoadCells.length - 1)
    );
    const targetCell = validRoadCells[targetIndex];
    target = [targetCell.x, targetCell.y];
    this.setState({ target });
  };

  componentDidMount() {
    // tickInterval = setInterval(this.tick, tickDelay);
    window.cars = this.printCars;
    window.start = this.start;
    window.startAutoRefresh = this.startAutoRefresh;
    window.clearWaves = this.clearWaves;
    // this.chooseTarget();
    // setTimeout(this.start, 1000);
  }

  clearWaves = () => {
    visitedCells = {};
    this.waves = JSON.parse(JSON.stringify(this.initialWaves));
    // this.setState({shortestPath: []});
  };

  startAutoRefresh = () => {
    window.startInterval = window.setInterval(this.start, 350);
  };

  start = () => {
    this.clearWaves();
    this.chooseTarget();
    this.startTime = Date.now();
    this.nextWave();
  };

  isTarget = cell => {
    return cell[0] === target[0] && cell[1] === target[1];
  };

  nextWave = () => {
    const currentWave = this.waves[this.waves.length - 1];
    // console.log("starting wave", this.waves.length);
    // console.log(this.waves);
    let targetFound = false;
    const nextWave = [];

    for (let i = 0; i < currentWave.length; i++) {
      const parent = currentWave[i];

      for (let directionName in directions) {
        const newCell = canGo(parent.cell[0], parent.cell[1], directionName);

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
      // if (this.waves.length > 99 && this.waves.length % 100) {
      // setTimeout(this.nextWave, 0);
      // } else {
      this.nextWave();
      // }
    }
  };

  setShortestPath = currentCell => {
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

  generateCars = () => {
    return Array(carCount)
      .fill(null)
      .map((car, index) => {
        const red = Math.round(Math.random() * 155) + 100;
        const blue = Math.round(Math.random() * 155) + 100;
        const green = Math.round(Math.random() * 155) + 100;
        const rgb = `rgb(${red},${blue},${green})`;

        let initialCell = {
          x: 0,
          y: 0
        };

        const carParams = {
          id: Math.floor(Math.random() * 10000000),
          color: rgb,
          speedX: 0,
          speedY: 0,
          x: initialCell.x,
          y: initialCell.y
        };
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
    if (!this.state.target) {
      return null;
    }
    // console.log("this.state.target: ", this.state.target);
    const style = {
      left: this.state.target[0] * unitSize,
      top: this.state.target[1] * unitSize,
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
