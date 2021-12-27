import { EventEmitter } from "events";

import { getDeviceByName } from "./midi.js";

const GRID_SIZE = 8;
const CIRCLE_PAD_POSITIONS = "ABCDEFGH12345678";
const TOP_CIRCLE_BUTTON_VALUE = 176;
const NOT_TOP_CIRCLE_BUTTON_VALUE = 144;
const PRESSED_DOWN_VALUE = 127;

const COLORS = {
  red: 3,
  green: 48,
  orange: 18,
  yellow: 49,
  blank: 0,
};

const topCircleButtons = {
  104: "1",
  105: "2",
  106: "3",
  107: "4",
  108: "5",
  109: "6",
  110: "7",
  111: "8",
};

const rightCircleButtons = {
  8: "A",
  24: "B",
  40: "C",
  56: "D",
  72: "E",
  88: "F",
  104: "G",
  120: "H",
};

// converts pad number into x, y grid position
function mapNumberToGridPosition(number) {
  const x = number % 8;
  const y = Math.floor(number / 8) / 2;
  const gridPosition = { x, y };

  return gridPosition;
}

// coverts x, y grid position into pad number
function mapGridPositionToNumber(gridPosition) {
  const number = gridPosition.y * 2 * 8 + gridPosition.x;

  return number;
}

function mapMidiDataToMessage(midiData) {
  const number = midiData[1];
  const isPressedDown = midiData[2] === PRESSED_DOWN_VALUE;
  const value = isPressedDown ? "down" : "up";

  const hasTopCircleButtonBeenPressed = midiData[0] === TOP_CIRCLE_BUTTON_VALUE;

  if (hasTopCircleButtonBeenPressed) {
    return {
      circle: true,
      position: topCircleButtons[number],
      value,
    };
  }

  if (rightCircleButtons.hasOwnProperty(number)) {
    return {
      circle: true,
      position: rightCircleButtons[number],
      value,
    };
  }

  return {
    grid: true,
    position: mapNumberToGridPosition(number),
    value,
  };
}

function mapMessageToMidiData(message) {
  const color = COLORS[message.value];

  if (typeof color === "undefined") {
    return console.error(message.value, "is not a valid colour");
  }

  const isGridPosition = message.grid;
  if (isGridPosition) {
    return [
      NOT_TOP_CIRCLE_BUTTON_VALUE,
      mapGridPositionToNumber(message.position),
      color,
    ];
  }

  const rightCircleButtonPosition = getKeyByValue(
    rightCircleButtons,
    message.position
  );
  if (rightCircleButtonPosition) {
    return [
      NOT_TOP_CIRCLE_BUTTON_VALUE,
      parseInt(rightCircleButtonPosition, 10),
      color,
    ];
  }

  const topCircleButtonPosition = getKeyByValue(
    topCircleButtons,
    message.position
  );
  if (topCircleButtonPosition) {
    return [
      TOP_CIRCLE_BUTTON_VALUE,
      parseInt(topCircleButtonPosition, 10),
      color,
    ];
  }
}

class Launchpad extends EventEmitter {
  constructor() {
    super();

    const { input, output } = getDeviceByName("Launchpad Mini");

    this.input = input;
    this.output = output;

    this.handleMessages();
  }

  handleMessages() {
    this.input.on("message", (_deltaTime, midiData) => {
      const message = mapMidiDataToMessage(midiData);

      this.emit("change", message);

      const eventName = message.value === "up" ? "up" : "down";
      delete message.value;
      this.emit(eventName, message);
    });
  }

  fill(value) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const position = { x, y };
        this.setPad({ position, value });
      }
    }

    for (let i = 0; i < CIRCLE_PAD_POSITIONS.length; i++) {
      const position = CIRCLE_PAD_POSITIONS[i];
      this.setPad({ position, value });
    }
  }

  setPad(data) {
    if (!data.position || !data.value) {
      return;
    }

    if (
      typeof data.position.x !== "undefined" &&
      typeof data.position.y !== "undefined"
    ) {
      data.grid = true;
    }

    if (CIRCLE_PAD_POSITIONS.includes(data.position)) {
      data.circle = true;
    }

    if (!(data.grid || data.circle)) {
      return;
    }

    this.output.send(mapMessageToMidiData(data));
  }
}

export default Launchpad;
