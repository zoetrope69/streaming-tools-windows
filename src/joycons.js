import { EventEmitter } from "events";

import HID from "node-hid";

const VENDOR_ID = 1406;
const PRODUCT_ID_JOYCON_LEFT = 8198;
const PRODUCT_ID_JOYCON_RIGHT = 8199;

/*
  We can also get move events for combinations
  if we really wanted, just presses for now
*/
const EVENTS = {
  LEFT: {
    "0 0 8": "release",

    "0 1 8": "minus",
    "0 64 8": "L",
    "0 128 8": "ZL",
    "4 0 8": "up",
    "8 0 8": "right",
    "2 0 8": "down",
    "1 0 8": "left",
    "0 32 8": "capture",
    "16 0 8": "SL",
    "32 0 8": "SR",

    "0 4 8": "joystick-in",
    "0 0 0": "joystick-right",
    "0 0 1": "joystick-bottom-right",
    "0 0 2": "joystick-bottom",
    "0 0 3": "joystick-bottom-left",
    "0 0 4": "joystick-left",
    "0 0 5": "joystick-top-left",
    "0 0 6": "joystick-top",
    "0 0 7": "joystick-top-right",
  },
  RIGHT: {
    "0 0 8": "release",

    "0 2 8": "plus",
    "0 64 8": "R",
    "0 128 8": "ZR",
    "2 0 8": "X",
    "1 0 8": "A",
    "4 0 8": "B",
    "8 0 8": "Y",
    "0 16 8": "home",
    "16 0 8": "SL",
    "32 0 8": "SR",

    "0 8 8": "joystick-in",
    "0 0 4": "joystick-right",
    "0 0 5": "joystick-bottom-right",
    "0 0 6": "joystick-bottom",
    "0 0 7": "joystick-bottom-left",
    "0 0 0": "joystick-left",
    "0 0 1": "joystick-top-left",
    "0 0 2": "joystick-top",
    "0 0 3": "joystick-top-right",
  },
};

class Joycons extends EventEmitter {
  constructor() {
    super();

    try {
      const left = new HID.HID(VENDOR_ID, PRODUCT_ID_JOYCON_LEFT);
      const right = new HID.HID(VENDOR_ID, PRODUCT_ID_JOYCON_RIGHT);

      const joycon = {
        left,
        right,
      };

      this.previousDownEvents = {
        left: null,
        right: null,
      };

      const handleData = ({ data, isRight = false }) => {
        const str = `${data[1]} ${data[2]} ${data[3]}`;
        const event = EVENTS[isRight ? "RIGHT" : "LEFT"][str];

        if (!event) {
          return;
        }

        if (event === "release") {
          if (!this.previousDownEvents[isRight ? "right" : "left"]) {
            return;
          }

          this.emit("change", {
            left: !isRight,
            right: isRight,
            event: this.previousDownEvents[isRight ? "right" : "left"],
            state: "up",
          });
          this.emit("up", {
            left: !isRight,
            right: isRight,
            event: this.previousDownEvents[isRight ? "right" : "left"],
          });
          this.previousDownEvents[isRight ? "right" : "left"] = null;
          return;
        }

        this.emit("change", {
          left: !isRight,
          right: isRight,
          event,
          state: "down",
        });
        this.emit("down", {
          left: !isRight,
          right: isRight,
          event,
        });
        this.previousDownEvents[isRight ? "right" : "left"] = event;
      };

      joycon.left.on("data", (data) => handleData({ data }));
      joycon.right.on("data", (data) => handleData({ data, isRight: true }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Couldn't connect Joycons`);
    }
  }
}

export default Joycons;
