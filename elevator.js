{
  init: function(elevators, floors) {
    let floorQueue = [];

    elevators.map((elevator, index) => {

      elevator.on("idle", () => {


        if (floorQueue.length > 0 && elevator.getPressedFloors().length === 0) {
          //console.log("lift idle kijk naar queue ", floorQueue)
          if (floorQueue[0] > elevator.currentFloor()) {
            if (elevator.goingUpIndicator()) {
              elevator.goingDownIndicator(false);
            }
          } else if (floorQueue[0] < elevator.currentFloor()) {
            if (elevator.goingDownIndicator()) {
              elevator.goingUpIndicator(false);
            }
          }
          // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! map de elevators en controleer op destiantionqueue gelijks is aan floorqueue
          console.log(elevators)
          elevator.goToFloor(floorQueue[0]);
          floorQueue.shift();
        } else if (elevator.getPressedFloors().length > 0) {
          elevator.goToFloor(elevator.getPressedFloors()[elevator.getPressedFloors().length - 1])
        }

      })

      elevator.on("passing_floor", (floorPassing, direction) => {

        if (floors[floorPassing].buttonStates[direction] === "activated" && elevator.loadFactor() < 0.65) {
          elevator.goToFloor(floorPassing, true)
        }

        elevator.getPressedFloors().map(e => {
          if (e === floorPassing) {
            elevator.goToFloor(floorPassing, true)
          }
        })
      });
      elevator.on("floor_button_pressed", (floorNum) => {
        if (floorNum > elevator.currentFloor()) {
          if (elevator.goingUpIndicator()) {
            elevator.goingDownIndicator(false);
          }
        } else if (floorNum < elevator.currentFloor()) {
          if (elevator.goingDownIndicator()) {
            elevator.goingUpIndicator(false);
          }
        }
      })

      elevator.on("stopped_at_floor", (stopFloor) => {
        //console.log("lift ",index," ",elevator.destinationQueue)
        if (elevator.getPressedFloors().length === 0) {
          elevator.goingDownIndicator(true);
          elevator.goingUpIndicator(true);

        }

        //zorgt er voor dat wachtende niet uit queue wordt gehaald
        if (elevator.goingUpIndicator() && elevator.goingDownIndicator() === false) {
          if (floors[elevator.currentFloor()].buttonStates["down"] !== "activated") {
            floorQueue = floorQueue.filter(e => e !== stopFloor);
          }
        }
        if (elevator.goingDownIndicator() && elevator.goingUpIndicator() === false) {
          if (floors[elevator.currentFloor()].buttonStates["up"] !== "activated") {
            floorQueue = floorQueue.filter(e => e !== stopFloor);
          }

        }
        console.log(floorQueue);


      });
    })

    floors.map((floor) => {
      floor.on("up_button_pressed down_button_pressed", () => {
        //console.log("knop ingedrukt op ", floor.level)
        floorQueue.indexOf(floor.level) === -1 ? floorQueue.push(floor.level) : null

        if (floorQueue.length === 1) {
          for (i = 0; i < elevators.length; i++) {
            if (elevators[i].destinationQueue.length === 0) {
              if (floor.level > elevators[i].currentFloor()) {
                if (elevators[i].goingUpIndicator()) {
                  elevators[i].goingDownIndicator(false);
                }
              } else if (floor.level < elevators[i].currentFloor()) {
                if (elevators[i].goingDownIndicator()) {
                  elevators[i].goingUpIndicator(false);
                }
              }
              elevators[i].goToFloor(floor.level);

              break;
            }
          }

        }
      })
    })
  },

  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  }
}
