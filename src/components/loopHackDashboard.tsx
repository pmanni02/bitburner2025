import { NS } from "@ns";
import { LoopHackConfig } from "../interfaces";
import { readServerConfig, writeServerConfig } from "../utils/helpers";
import { BASIC_SCRIPT_RAM_SIZE } from "../constants";
import { addNewServer, buyNewServer, changeTargetServer, serverPrompt, upgradePurchasedServer } from "/utils/servers";

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

type Props = {
  ns: NS,
  config: LoopHackConfig
}

// export function LoopHackDashBoard(ns: NS, config: LoopHackConfig){
export function LoopHackDashBoard({ ns, config }: Props) {
  const [currentConfig, setCurrentConfig] = React.useState<LoopHackConfig>(config)

  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>
        <div id="hack-div">
          {/* {addButton("Add Hack", "addHack", () => replaceScript(ns, "/utils/grow.js", "/utils/hack.js", config.targetServer))} */}
          <button id="addHack" onClick={() => {
            const updatedConfig = replaceScript(ns, "/utils/grow.js", "/utils/hack.js", config.targetServer);
            setCurrentConfig(updatedConfig)
          }}>
            Add Hack
          </button>
          <details open>
            {/* <summary>Hack Servers: {[numHackThreads]}</summary> */}
            <summary>Hack Servers: </summary>
            {makeList(ns, config.hackServers, currentConfig)}
          </details>
        </div>

        <div id="grow-div">
          {/* {addButton("Add Grow", "addGrow", () => replaceScript(ns, "/utils/hack.js", "/utils/grow.js", config.targetServer))} */}
          <button id="addGrow" onClick={() => {
            const updatedConfig = replaceScript(ns, "/utils/hack.js", "/utils/grow.js", config.targetServer);
            setCurrentConfig(updatedConfig)
          }}>
            Add Grow
          </button>
          <details open>
            {/* <summary>Grow Servers: {[numGrowThreads]}</summary> */}
            <summary>Grow Servers: </summary>
            {makeList(ns, config.growServers, currentConfig)}
          </details>
        </div>

        <div id="weaken-div">
          {/* {addButton("Add Weaken", "addWeaken", () => replaceScript(ns, "/utils/grow.js", "/utils/weaken.js", config.targetServer))} */}
          <button id="addWeaken" onClick={() => {
            const updatedConfig = replaceScript(ns, "/utils/grow.js", "/utils/weaken.js", config.targetServer);
            setCurrentConfig(updatedConfig)
          }}>
            Add Weaken
          </button>

          {/* {addButton("Remove Weaken", "removeWeaken", () => replaceScript(ns, "/utils/weaken.js", "/utils/grow.js", config.targetServer))} */}
          <button id="removeWeaken" onClick={() => {
            const updatedConfig = replaceScript(ns, "/utils/weaken.js", "/utils/grow.js", config.targetServer);
            setCurrentConfig(updatedConfig)
          }}>
            Remove Weaken
          </button>

          <details open>
            {/* <summary>Weaken Servers: {[numWeakenThreads]}</summary> */}
            <summary>Weaken Servers: </summary>
            {makeList(ns, config.weakenServers, currentConfig)}
          </details>
        </div>

        <br></br>

        {/* {addButton("Buy Server", "buyServer", () => buyNewServer(ns))} */}
        <button id="buyServer" onClick={async () => {
          const updatedConfig = await buyNewServer(ns, currentConfig)
          setCurrentConfig(updatedConfig)
        }}>
          Buy Server
        </button>


        {/* {addButton("Upgrade Server", "upgradeServer", () => upgradePurchasedServer(ns))} */}
        <button id="upgradeServer" onClick={async () => {
          const updatedConfig = await upgradePurchasedServer(ns, currentConfig)
          setCurrentConfig(updatedConfig)
        }}>
          Upgrade Server
        </button>

        <br></br>
        {/* {addButton("Add Server", "addServer", () => addNewServer(ns))} */}
        <button id="addServer" onClick={async () => {
          const updatedConfig = await addNewServer(ns, currentConfig)
          if (updatedConfig) {
            setCurrentConfig(updatedConfig)
          }
        }}>
          Add Server
        </button>


        {/* {addButton("Change Target", "changeTarget", async () => await changeTargetServer(ns))} */}
        <button id="changeTarget" onClick={async () => {
          const updatedConfig = await changeTargetServer(ns, currentConfig)
          if (updatedConfig) {
            setCurrentConfig(updatedConfig)
          }
        }}>
          Change Target
        </button>
      </body>
    </html>
  )
}

function makeList(ns: NS, array: string[], config: LoopHackConfig) {
  const listItems = array.map((item) => (
    <p key={item} onClick={() => serverPrompt(ns, item, config)}> {item}</p>
  ));
  return listItems;
}

export const replaceScript = (ns: NS, scriptToKill: string, scriptToStart: string, targetServer: string): LoopHackConfig => {
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
  return config
}