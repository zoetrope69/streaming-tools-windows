import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";

import Launchpad from "./launchpad.js";
import Joycons from "./joycons.js";

const { NGROK_URL } = process.env;

if (!NGROK_URL) {
  throw new Error("Missing environment variabes.");
}

const launchpad = new Launchpad();
const joycons = new Joycons();

launchpad.on("change", (data) => sendDataToMainServer("launchpad", data));
joycons.on("change", (data) => sendDataToMainServer("joycons", data));

async function sendDataToMainServer(eventType, data) {
  console.log(eventType, data);
  try {
    const response = await fetch(`${NGROK_URL}/windows/${eventType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });
    const json = await response.json();
    console.log("json", json);
  } catch (e) {
    console.error(e);
  }
}
