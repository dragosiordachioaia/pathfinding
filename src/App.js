import React from 'react';
import './App.css';

const unitSize = 20;
const carCount = 1;
const tickInterval = 200;

let road = [
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,0,0,0,1],
  [1,0,1,0,1,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,0,0,0,1],
  [1,1,1,1,1,0,1,0,0,0,1],
  [1,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1],
]

let validRoadCells = [];

road.forEach((row, rowIndex) => {
  row.forEach((isRoad, columnIndex) => {
    if(isRoad) {
      validRoadCells.push({x: rowIndex, y: columnIndex});
    }
  })  
});


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: this.generateCars(),
    }
  }

  componentDidMount() {
    setInterval(this.tick, tickInterval);
  }

  tick = () => {
    let newCars = this.state.cars.map(car => {
      let newSpeedX = car.speedX;
      let newSpeedY = car.speedY;

      let newCell = null;
      // debugger;
      if(newSpeedX) {
        
        try { newCell = road[car.y][car.x + newSpeedX] } catch(e) {}
  
        if (!newCell) {
          try { newCell = road[car.y + 1][car.x] } catch(e) {}  
  
          if (newCell) {
            newSpeedX = 0;
            newSpeedY = 1;
          } else {
            try { newCell = road[car.y -1][car.x] } catch(e) {}  
  
            if (newCell) {
              newSpeedX = 0;
              newSpeedY = -1;
            } else {
              newSpeedX = -newSpeedX;
            }
          }
        }
      } else if(newSpeedY){

        try { newCell = road[car.y+newSpeedY][car.x] } catch(e) {}
  
        if (!newCell) {
          try { newCell = road[car.y][car.x + 1] } catch(e) {}  
  
          if (newCell) {
            newSpeedX = 1;
            newSpeedY = 0;
          } else {
            try { newCell = road[car.y][car.x - 1] } catch(e) {}  
  
            if (newCell) {
              newSpeedX = -1;
              newSpeedY = 0;
            } else {
              newSpeedY = -newSpeedY;
            }
          }
        }

      }
      

      return {
        ...car,
        x: car.x + newSpeedX,
        y: car.y + newSpeedY,
        speedX: newSpeedX,
        speedY: newSpeedY,
      }
    });
    this.setState({cars: newCars})
  }

  generateCars = () => {
    return Array(carCount).fill(null).map(car => {
      const red = Math.round(Math.random() * 255);
      const blue = Math.round(Math.random() * 255);
      const green = Math.round(Math.random() * 255);
      const rgb = `rgb(${red},${blue},${green})`;

      // let randomInitialCell = Math.round(Math.random() * validRoadCells.length);
      let randomInitialCell = 0;
      
      const carParams = {
        id: Math.floor(Math.random() * 10000000),
        color: rgb,
        speedX: 1,
        speedY: 0,
        x: validRoadCells[randomInitialCell].x,
        y: validRoadCells[randomInitialCell].y,
      }
      // debugger;
      return carParams;
    })
  }

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
            width: unitSize+'px', 
            height: unitSize+'px'
          }}
        >  
        </div>
      )
    })
  }
  
  displayRoad = () => {
    return road.map((row, rowIndex) => {
      return row.map((isRoad, columnIndex) => {
        let style = {
          left: columnIndex*unitSize, 
          top: rowIndex*unitSize, 
          width: unitSize+'px', 
          height: unitSize+'px',
          backgroundColor: isRoad ? '#444' : '#fff'
        }
        return (
          <div 
            className="road" 
            key={`road-${rowIndex}-${columnIndex}`} 
            style={style}
          >
          </div>
        )

      })
    })
  }

  

  render() {
    return (
      <div className="game">
        {this.displayRoad()}
        {this.displayCars()}
      </div>
    )
  }
}

export default App;
