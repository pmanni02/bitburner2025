import { NS } from "@ns";
import { LoopHackConfig } from "../../interfaces";
import { addNewServer, buyNewServer, changeTargetServer, replaceScript, upgradePurchasedServer } from "/utils/servers";
import { growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";
import { Button } from "./Button";
import { ServerDetails } from "./ServerDetails";

import React from '/lib/react'
import { main } from "./automate";
import { writeServerConfig } from "/utils/helpers";

export function LoopHackDashboard({ ns, config }: {
  ns: NS,
  config: LoopHackConfig
}) {
  const [currentConfig, setCurrentConfig] = React.useState<LoopHackConfig>(config);

  React.useEffect(() => {
    config.isAutomated = false; // on load set isAutomated off
    setCurrentConfig(config);
    // writeServerConfig(ns, config)
  },[])

  const toggleAutomate = (config: LoopHackConfig) => {
    config.isAutomated = config.isAutomated ? !config.isAutomated : true;
    setCurrentConfig(config);
    ns.tprint('automate togged to: ', config.isAutomated)

    let intervalId;
    if (config.isAutomated) {
      intervalId ??= setInterval(async () => {
        const updatedConfig = await main(ns, currentConfig);
        ns.tprint('automation running!!')
        setCurrentConfig(updatedConfig);
        writeServerConfig(ns, currentConfig); // write to file in case of error
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
        <div id="hack">
          <Button id='addHack' name='Add Hack' onClickFn={
            () => {
              const updatedConfig = replaceScript(ns, growScriptPath, hackScriptPath, config);
              setCurrentConfig(updatedConfig)
            }}
          />
          <ServerDetails ns={ns} config={config} serverNames={currentConfig.hackServers} summary="Hack Servers: " />
        </div>

        <div id="grow">
          <Button id='addGrow' name='Add Grow' onClickFn={
            () => {
              const updatedConfig = replaceScript(ns, hackScriptPath, growScriptPath, config);
              setCurrentConfig(updatedConfig)
            }
          }
          />
          <ServerDetails ns={ns} config={config} serverNames={currentConfig.growServers} summary="Grow Servers: " />
        </div>

        <div id="weaken">
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
          style={{ backgroundColor: currentConfig.isAutomated ? 'green' : 'red' }}
          name='Automate'
          onClickFn={() => toggleAutomate(currentConfig)}
        />
      </body>
    </html>
  )
}
