import { NS } from "@ns";
import { LoopHackConfig } from "../interfaces";
import { readServerConfig, writeServerConfig } from "../helpers";
import { BASIC_SCRIPT_RAM_SIZE } from "../constants";
import { addNewServer, buyNewServer, changeTargetServer, serverPrompt, upgradePurchasedServer } from "/utils/servers";

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
          {addButton("Add Hack", "addHack", () => replaceScript(ns, "/utils/grow.js", "/utils/hack.js", config.targetServer))}
          <details open>
            {/* <summary>Hack Servers: {[numHackThreads]}</summary> */}
            <summary>Hack Servers: </summary>
            {await makeList(ns, config.hackServers)}
          </details>
        </div>

        <div id="grow-div">
          {addButton("Add Grow", "addGrow", () => replaceScript(ns, "/utils/hack.js", "/utils/grow.js", config.targetServer))}
          <details open>
            {/* <summary>Grow Servers: {[numGrowThreads]}</summary> */}
            <summary>Grow Servers: </summary>
            {await makeList(ns, config.growServers)}
          </details>
        </div>

        <div id="weaken-div">
          {addButton("Add Weaken", "addWeaken", () => replaceScript(ns, "/utils/grow.js", "/utils/weaken.js", config.targetServer))}
          {addButton("Remove Weaken", "removeWeaken", () => replaceScript(ns, "/utils/weaken.js", "/utils/grow.js", config.targetServer))}
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

export const replaceScript = (ns: NS, scriptToKill: string, scriptToStart: string, targetServer: string) => {
  const config: LoopHackConfig = readServerConfig(ns)[0];

  let serverName;
  if (scriptToKill === "/utils/grow.js") {
    serverName = config.growServers.pop();
  } else if (scriptToKill === "/utils/hack.js") {
    if (config.hackServers.length) {
      serverName = config.hackServers.pop()
    } else {
      serverName = config.weakenServers.pop()
    }
  } else if (scriptToKill === "/utils/weaken.js") {
    serverName = config.weakenServers.pop()
  }
  writeServerConfig(ns, config)

  ns.toast("redeploying from " + scriptToKill + " to " + scriptToStart);
  if (serverName) {
    if (ns.killall(serverName)) {
      ns.rm(scriptToKill, serverName);
    }
    const { maxRam, ramUsed } = ns.getServer(serverName);
    const numThreads = Math.floor((maxRam - ramUsed) / BASIC_SCRIPT_RAM_SIZE);

    ns.scp(scriptToStart, serverName);
    ns.exec(scriptToStart, serverName, numThreads, targetServer);
    // updateGlobalNumThreads(-numThreads, scriptToKill)

    const config: LoopHackConfig = readServerConfig(ns)[0];

    if (scriptToStart === "/utils/hack.js") {
      config.hackServers.unshift(serverName)
    } else if (scriptToStart === "/utils/grow.js") {
      config.growServers.unshift(serverName)
    } else if (scriptToStart === "/utils/weaken.js") {
      config.weakenServers.unshift(serverName)
    }
    writeServerConfig(ns, config);
    // updateGlobalNumThreads(numThreads, scriptToStart)
  }
}