import { NS } from "@ns";
import React from '/lib/react';
import { LoopHackConfig } from "../../interfaces";
import { addNewServer, buyNewServer, changeTargetServer, replaceScript, upgradePurchasedServer } from "/utils/servers";
import { growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";
import { Button } from "./Button";
import { main as runAutomateScript } from "./automate";
import { readServerConfig, writeServerConfig } from "/utils/helpers";
import { Collapsible } from "./Collapsible";

// FIXME: move styles to external file or inline
const styles = {
  body: {
    display: 'flex',
    'flex-direction': 'column',
  },
  groups: {
    display: 'flex',
  },
  box: {
    display: 'flex',
    'flex-direction': 'column',
    border: '1px solid white',
    padding: '2px',
    width: '130px'
  },
  type: {
    display: 'flex',
    'justify-content': 'center',
  },
  buttonGroup: {
    display: 'flex',
    'justify-content': 'center',
  },
  serverList: {
    display: 'flex',
    'flex-direction': 'column',
  },
  utilButtonGroup: {
    display: 'flex',
    'flex-wrap': 'wrap'
  }
}

export function LoopHackV2({ ns, config }: {
  ns: NS,
  config: LoopHackConfig
}) {
  const [currentConfig, setCurrentConfig] = React.useState<LoopHackConfig>(config);
  const [automate, setAutomate] = React.useState<boolean>(config.isAutomated ? config.isAutomated : false);

  function updateConfig() {
    const updatedConfig = readServerConfig(ns)[0];
    setCurrentConfig(updatedConfig);
  }

  React.useEffect(() => {
    const interval = setInterval(updateConfig, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleAutomate = () => {
    const updatedAutomate = !automate;
    config.isAutomated = updatedAutomate;
    writeServerConfig(ns, config);
    setAutomate(updatedAutomate);

    let intervalId;
    if (updatedAutomate) {
      intervalId ??= setInterval(async () => {
        const updatedConfig = await runAutomateScript(ns, currentConfig);
        setCurrentConfig(updatedConfig);
      }, 100000);
    } else {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>

        <div style={styles.groups}>
          <div style={styles.box}>
            <div style={styles.buttonGroup}>
              <button onClick={() => {
                const updatedConfig = replaceScript(ns, growScriptPath, hackScriptPath, config);
                setCurrentConfig(updatedConfig)
              }}>+</button>
            </div>
            <Collapsible ns={ns} config={currentConfig} label="HACK" servers={currentConfig.hackServers} />
          </div>

          <div style={styles.box}>
            <div style={styles.buttonGroup}>
              <button onClick={
                () => {
                  const updatedConfig = replaceScript(ns, hackScriptPath, growScriptPath, config);
                  setCurrentConfig(updatedConfig)
                }
              }>+
              </button>
            </div>
            <Collapsible ns={ns} config={currentConfig} label="GROW" servers={currentConfig.growServers} />
          </div>

          <div style={styles.box}>
            <div style={styles.buttonGroup}>
              <button id='addWeaken' onClick={
                () => {
                  const updatedConfig = replaceScript(ns, growScriptPath, weakenScriptPath, config);
                  setCurrentConfig(updatedConfig)
                }
              }>+</button>
              <button id='removeWeaken' onClick={
                () => {
                  const updatedConfig = replaceScript(ns, weakenScriptPath, growScriptPath, config);
                  setCurrentConfig(updatedConfig)
                }
              }>-</button>
            </div>
            <Collapsible ns={ns} config={currentConfig} label="WEAKEN" servers={currentConfig.weakenServers} />
          </div>
        </div>

        <br></br>

        <div style={styles.utilButtonGroup}>
          <button id='buyServer' onClick={
            async () => {
              const updatedConfig = await buyNewServer(ns, currentConfig)
              setCurrentConfig(updatedConfig)
            }
          }>Buy Server</button>

          <button id='upgradeServer' onClick={
            async () => {
              const updatedConfig = await upgradePurchasedServer(ns, currentConfig)
              setCurrentConfig(updatedConfig)
            }
          }>Upgrade Server</button>

          <br></br>

          <button id='addServer' onClick={
            async () => {
              const updatedConfig = await addNewServer(ns, currentConfig)
              if (updatedConfig) {
                setCurrentConfig(updatedConfig)
              }
            }
          }>Add Server</button>

          <button id='changeTarget' onClick={
            async () => {
              const updatedConfig = await changeTargetServer(ns, currentConfig)
              if (updatedConfig) {
                setCurrentConfig(updatedConfig)
              }
            }
          }>Change Target</button>

          <button id='automate' style={{ backgroundColor: automate ? 'green' : 'red' }} onClick={
            () => toggleAutomate()
          }>Automate</button>
        </div>

      </body>
    </html>
  )
}
