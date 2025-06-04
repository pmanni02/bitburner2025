import { NS } from "@ns";
import { LoopHackConfig } from "../interfaces";
import { replaceScript, serverPrompt, addNewServer, upgradePurchasedServer, changeTargetServer, buyNewServer } from "/ui/loopHack";

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

export const LoopHackDashBoard = async function getHackUI(ns: NS, config: LoopHackConfig) {
  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>
        <div id="hack-div">
          {addButton("Add Hack", "addHack", () => replaceScript(ns, "/utils/grow.js", "/utils/hack.js"))}
          <details open>
            {/* <summary>Hack Servers: {[numHackThreads]}</summary> */}
            <summary>Hack Servers: </summary>
            {await makeList(ns, config.hackServers)}
          </details>
        </div>

        <div id="grow-div">
          {addButton("Add Grow", "addGrow", () => replaceScript(ns, "/utils/hack.js", "/utils/grow.js"))}
          <details open>
            {/* <summary>Grow Servers: {[numGrowThreads]}</summary> */}
            <summary>Grow Servers: </summary>
            {await makeList(ns, config.growServers)}
          </details>
        </div>

        <div id="weaken-div">
          {addButton("Add Weaken", "addWeaken", () => replaceScript(ns, "/utils/grow.js", "/utils/weaken.js"))}
          {addButton("Remove Weaken", "removeWeaken", () => replaceScript(ns, "/utils/weaken.js", "/utils/grow.js"))}
          <details open>
            {/* <summary>Weaken Servers: {[numWeakenThreads]}</summary> */}
            <summary>Weaken Servers: </summary>
            {await makeList(ns, config.weakenServers)}
          </details>
        </div>

        <br></br>

        {addButton("Buy Server", "buyServer", () => buyNewServer(ns))}
        {addButton("Upgrade Server", "upgradeServer", () => upgradePurchasedServer(ns))}

        <br></br>
        {addButton("Add Server", "addServer", () => addNewServer(ns))}
        {addButton("Change Target", "changeTarget", async () => await changeTargetServer(ns))}
      </body>
    </html>
  )
}

function addButton(buttonName: string, buttonId: string, onClickFn: () => void) {
  return (
    <button id={buttonId} onClick={onClickFn}>
      {buttonName}
    </button>
  );
}

async function makeList(ns: NS, array: string[]) {
  const listItems = array.map((item) => (
    <p key={item} onClick={() => serverPrompt(ns, item)}> {item}</p>
  ));
  return listItems;
}