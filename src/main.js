import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import express from "express";

import getIpAddress from "./get-ip-address.js";
import Launchpad from "./launchpad.js";
import Joycons from "./joycons.js";
import ComputerMouseKeyboard from "./computer-mouse-keyboard.js";

const { MAIN_SERVER_URL, PORT, WINDOWS_SECRET } = process.env;

if (!MAIN_SERVER_URL || !PORT || !WINDOWS_SECRET) {
  throw new Error("Missing environment variabes.");
}

const ipAddress = getIpAddress();
const host = `http://${ipAddress}:${PORT}`;

function pingMainServer() {
  console.log("Pinging main server..."); // eslint-disable-line no-console
  sendDataToMainServer("computer", { host });
}
pingMainServer();
setInterval(pingMainServer, 10000); // then ping every 10 secs

const app = express();

app.use(express.json());

const launchpad = new Launchpad();
const joycons = new Joycons();
const computer = new ComputerMouseKeyboard({ app });

launchpad.on("change", (data) => sendDataToMainServer("launchpad", data));
joycons.on("change", (data) => sendDataToMainServer("joycons", data));
computer.mouse.on("change", (data) =>
  sendDataToMainServer("computer/mouse", data)
);

async function sendDataToMainServer(eventType, data) {
  console.log(`[${eventType}] ${JSON.stringify(data)}`); // eslint-disable-line no-console
  try {
    await fetch(`${MAIN_SERVER_URL}/windows/${eventType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        secret: WINDOWS_SECRET,
      }),
    });
  } catch (e) {
    console.error(e.message); // eslint-disable-line no-console
  }
}

app.get("/", async (_request, response) => {
  response.send("Hello World");
});

app.listen(PORT, () => {
  console.info(`Listening on ${host}`); // eslint-disable-line no-console
});
