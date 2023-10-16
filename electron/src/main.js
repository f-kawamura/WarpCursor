const {
  screen,
  dialog,
  Tray,
  Menu,
  app,
  BrowserWindow,
  globalShortcut,
} = require("electron");
const path = require("path");
const isDev = require('electron-is-dev');
const { execFile } = require('child_process');

let jPressTime = null;
let currentDisplayIndex = 0 

app.on("window-all-closed", (e) => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  if (app.dock) {
    app.dock.hide();
  }  

  globalShortcut.register("CommandOrControl+Shift+J", () => {
    if(!jPressTime) {
      jPressTime = Date.now();

      setTimeout(() => {
        jPressTime = null
      }, 500);

      return
    }

    const currentTime = Date.now();

    if (currentTime - jPressTime < 500) {
      const displayIndex = (currentDisplayIndex + 1) % 3;
      currentDisplayIndex = displayIndex

      const displays = screen.getAllDisplays();

      const {
        x: displayX,
        y: displayY,
        width: displayWidth,
        height: displayHeight,
      } = displays[displayIndex].bounds;

      const { x, y } = getWindowPositions(
        displayX,
        displayY,
        displayWidth,
        displayHeight
      );

      moveMouse(x, y)
      flashCurrentCursor(x, y)
    } 

    jPressTime = null
  });
});

const getWindowPositions = (
  positionX,
  positionY,
  displayWidth,
  displayHeight
) => {
  return {
    x: positionX + displayWidth / 2,
    y: positionY + displayHeight / 2,
  };
};


const pathToGoBinary = isDev ? path.join(`${__dirname}/../../build/cmd`, 'mouseMover') : path.join(process.resourcesPath, 'mouseMover');

const moveMouse = (x, y) => {
  execFile(pathToGoBinary, [x, y], (error, stdout, stderr) => {});
}


const flashCurrentCursor = (x, y) => {
  closeAllWindows()
  const warpWindow = new BrowserWindow({
    x: x-150,
    y: y-150,
    width: 300,
    height: 300,
    frame: false,
    opacity: 0.5,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  warpWindow.loadURL('data:text/html,' + encodeURIComponent(`
    <html>
    <head>
        <style>
            body {
                margin: 0;
                overflow: hidden;
                background-color: transparent;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .circle {
                width: 300px;
                height: 300px;
                border-radius: 50%; 
                border: 0;
                background: linear-gradient(to bottom right, #5267F2, #924CEA);
            }
        </style>
    </head>
    <body>
        <div class="circle"></div>
    </body>
    </html>
    `));

  setTimeout(() => {
    closeAllWindows()
  }, 600);

}

const closeAllWindows = () => {
  BrowserWindow.getAllWindows().forEach((window) => window.close());
};