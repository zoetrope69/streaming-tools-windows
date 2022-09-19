import { EventEmitter } from "events";

import robot from "robotjs";

class ComputerMouseKeyboard extends EventEmitter {
  constructor({ app }) {
    super();

    this.screenSize = robot.getScreenSize();

    // this.mouse.emitInfo();
    this.keyboard.listenForShortcut({ app });
  }

  get mouse() {
    const eventEmitter = new EventEmitter();

    return Object.assign(eventEmitter, {
      emitInfo: () => {
        setInterval(() => {
          const mouse = robot.getMousePos();
          const isWithinScreen = mouse.x <= this.screenSize.width;
          const isTop = mouse.y <= this.screenSize.height / 2;
          const isLeft = mouse.x <= this.screenSize.width / 2;
          const isBottom = !isTop;
          const isRight = !isLeft;

          const data = {
            isWithinScreen,
            isTop,
            isBottom,
            isRight,
            isLeft,
            screenSize: this.screenSize,
            mouse,
          };

          eventEmitter.emit("change", data);
        }, 1000);
      },
    });
  }

  get keyboard() {
    return {
      listenForShortcut: ({ app }) => {
        const { WINDOWS_SECRET } = process.env;

        app.post(`/keyboard/shortcut`, async (request, response) => {
          const { data, secret } = request.body;

          if (WINDOWS_SECRET !== secret) {
            response.status(500).json({ error: "Something went wrong" });
            return;
          }

          this.keyboard.shortcut(data);

          response.json({ success: true });
        });
      },

      shortcut: ({ key, modifiers, toggleDelayMs }) => {
        if (!key) {
          return;
        }

        if (toggleDelayMs) {
          // https://robotjs.io/docs/syntax#keytogglekey-down-modifier
          robot.keyToggle(key, "down", modifiers || []);

          setTimeout(() => {
            robot.keyToggle(key, "up", modifiers || []);
          }, toggleDelayMs);
          return;
        }

        // https://robotjs.io/docs/syntax#keys
        return robot.keyTap(key, modifiers || []);
      },
    };
  }
}

export default ComputerMouseKeyboard;
