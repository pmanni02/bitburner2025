import { NS } from "@ns";
import { LoopHackConfig } from "../../interfaces";
import { addNewServer, buyNewServer, changeTargetServer, replaceScript, serverPrompt, upgradePurchasedServer } from "/utils/servers";
import { growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

type Props = {
  ns: NS,
  config: LoopHackConfig
}

export function LoopHackDashboard({ ns, config }: Props) {
  const [currentConfig, setCurrentConfig] = React.useState<LoopHackConfig>(config)

  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>
        <div id="hack-div">
          <button id="addHack" onClick={() => {
            const updatedConfig = replaceScript(ns, growScriptPath, hackScriptPath, config);
            setCurrentConfig(updatedConfig)
          }}>
            Add Hack
          </button>
          <details open>
            <summary>Hack Servers: </summary>
            {makeList(ns, config.hackServers, currentConfig)}
          </details>
        </div>

        <div id="grow-div">
          <button id="addGrow" onClick={() => {
            const updatedConfig = replaceScript(ns, hackScriptPath, growScriptPath, config);
            setCurrentConfig(updatedConfig)
          }}>
            Add Grow
          </button>
          <details open>
            <summary>Grow Servers: </summary>
            {makeList(ns, config.growServers, currentConfig)}
          </details>
        </div>

        <div id="weaken-div">
          <button id="addWeaken" onClick={() => {
            const updatedConfig = replaceScript(ns, growScriptPath, weakenScriptPath, config);
            setCurrentConfig(updatedConfig)
          }}>
            Add Weaken
          </button>

          <button id="removeWeaken" onClick={() => {
            const updatedConfig = replaceScript(ns, weakenScriptPath, growScriptPath, config);
            setCurrentConfig(updatedConfig)
          }}>
            Remove Weaken
          </button>

          <details open>
            <summary>Weaken Servers: </summary>
            {makeList(ns, config.weakenServers, currentConfig)}
          </details>
        </div>

        <br></br>

        <button id="buyServer" onClick={async () => {
          const updatedConfig = await buyNewServer(ns, currentConfig)
          setCurrentConfig(updatedConfig)
        }}>
          Buy Server
        </button>

        <button id="upgradeServer" onClick={async () => {
          const updatedConfig = await upgradePurchasedServer(ns, currentConfig)
          setCurrentConfig(updatedConfig)
        }}>
          Upgrade Server
        </button>

        <br></br>
        <button id="addServer" onClick={async () => {
          const updatedConfig = await addNewServer(ns, currentConfig)
          if (updatedConfig) {
            setCurrentConfig(updatedConfig)
          }
        }}>
          Add Server
        </button>

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