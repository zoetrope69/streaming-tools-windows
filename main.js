import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";

import Launchpad from "./launchpad.js";
import Joycons from "./joycons.js";

const { WSL_PORT } = process.env;

const launchpad = new Launchpad();
const joycons = new Joycons();

launchpad.on("change", (data) => sendDataToMainServer("launchpad", data));
joycons.on("change", (data) => sendDataToMainServer("joycons", data));

async function sendDataToMainServer(eventType, data) {
  try {
    const response = await fetch(
      `http://localhost:${WSL_PORT}/windows/${eventType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      }
    );
    const json = await response.json();
    console.log("json", json);
  } catch (e) {
    console.error(e);
  }
}
