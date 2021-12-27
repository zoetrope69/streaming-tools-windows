import Launchpad from "./launchpad.js";
import Joycons from "./joycons.js";

const launchpad = new Launchpad();
const joycons = new Joycons();

launchpad.on("down", (data) => console.log("launchpad down", data));
joycons.on("down", (data) => console.log("joycon down", data));
