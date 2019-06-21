import React from 'react';
import './App.css';

let unitSize = 20;

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
    setInterval(this.tick, 100);
  }

  tick = () => {
    let newCars = this.state.cars.map(car => {
      return {
        ...car,
        x: car.x + car.speedX,
        y: car.y + car.speedY,
      }
    });
    this.setState({cars: newCars})
  }

  generateCars = () => {
    return Array(2).fill(null).map(car => {
      const red = Math.round(Math.random() * 255);
      const blue = Math.round(Math.random() * 255);
      const green = Math.round(Math.random() * 255);
      const rgb = `rgb(${red},${blue},${green})`;

      let randomInitialCell = Math.round(Math.random()*validRoadCells.length);
      
      const carParams = {
        id: Math.floor(Math.random() * 10000000),
        color: rgb,
        speedX: 1,
        speedY: 0,
        x: validRoadCells[randomInitialCell].x * unitSize,
        y: validRoadCells[randomInitialCell].y * unitSize,
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
          style={{top: car.x, left: car.y, backgroundColor: car.color, width: unitSize+'px', height: unitSize+'px'}}
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
