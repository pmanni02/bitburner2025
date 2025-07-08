import { NS } from "@ns";
import React from '/lib/react';
import { LoopHackConfig } from "../../interfaces";
import { addNewServer, buyNewServer, changeTargetServer, replaceScript, upgradePurchasedServer } from "/utils/servers";
import { growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";
import { Button } from "./Button";
import { ServerDetails } from "./ServerDetails";
import { main as runAutomateScript } from "./automate";
import { writeServerConfig } from "/utils/helpers";
import { List } from "./List";

export function LoopHackV2({ ns, config }: {
  ns: NS,
  config: LoopHackConfig
}) {
  const [currentConfig, setCurrentConfig] = React.useState<LoopHackConfig>(config);
  const [automate, setAutomate] = React.useState<boolean>(config.isAutomated ? config.isAutomated : false);

  const toggleAutomate = () => {
    const updatedAutomate = !automate;
    config.isAutomated = updatedAutomate;
    ns.tprint('config.isAutomated: ', config.isAutomated)
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
        {/* <div id="hack">
          <Button id='addHack' name='Add Hack' onClickFn={
            () => {
              const updatedConfig = replaceScript(ns, growScriptPath, hackScriptPath, config);
              setCurrentConfig(updatedConfig)
            }}
          />
          <ServerDetails ns={ns} config={config} serverNames={currentConfig.hackServers} summary="Hack Servers: " />
        </div> */}

        <div className="growModal" >
          <div id="addRemoveButtons">
            <button id='add'>+</button>

            <button id='remove'>-</button>
          </div>
          <p id="growHover">GROW</p>
          <p id="hide"><List ns={ns} config={config} serverNames={currentConfig.growServers} /></p>
          {/* <ServerDetails ns={ns} config={config} serverNames={currentConfig.growServers} summary="Grow" /> */}

          {/* <Button id='addGrow' name='Add Grow' onClickFn={
            () => {
              const updatedConfig = replaceScript(ns, hackScriptPath, growScriptPath, config);
              setCurrentConfig(updatedConfig)
            }
          }
          />
          <ServerDetails ns={ns} config={config} serverNames={currentConfig.growServers} summary="Grow Servers: " /> */}
        </div>

        {/* <div id="weaken">
          <Button id='addWeaken' name='Add Weaken' onClickFn={
            () => {
              const updatedConfig = replaceScript(ns, growScriptPath, weakenScriptPath, config);
              setCurrentConfig(updatedConfig)
            }
          } />
          <Button id='removeWeaken' name='Remove Weaken' onClickFn={
            () => {
              const updatedConfig = replaceScript(ns, weakenScriptPath, growScriptPath, config);
              setCurrentConfig(updatedConfig)
            }
          } />
          <ServerDetails ns={ns} config={config} serverNames={currentConfig.weakenServers} summary="Weaken Servers: " />
        </div>

        <br></br>

        <Button id='buyServer' name='Buy Server' onClickFn={
          async () => {
            const updatedConfig = await buyNewServer(ns, currentConfig)
            setCurrentConfig(updatedConfig)
          }
        } />
        <Button id='upgradeServer' name='Upgrade Server' onClickFn={
          async () => {
            const updatedConfig = await upgradePurchasedServer(ns, currentConfig)
            setCurrentConfig(updatedConfig)
          }
        } />

        <br></br>
        <Button id='addServer' name='Add Server' onClickFn={
          async () => {
            const updatedConfig = await addNewServer(ns, currentConfig)
            if (updatedConfig) {
              setCurrentConfig(updatedConfig)
            }
          }
        } />

        <Button id='changeTarget' name='Change Target' onClickFn={
          async () => {
            const updatedConfig = await changeTargetServer(ns, currentConfig)
            if (updatedConfig) {
              setCurrentConfig(updatedConfig)
            }
          }
        } />

        <Button
          id='automate'
          style={{ backgroundColor: automate ? 'green' : 'red' }}
          name='Automate'
          onClickFn={() => toggleAutomate()}
        /> */}
      </body>
    </html>
  )
}
