import { NS } from "@ns";
import { LoopHackConfig } from "../../interfaces";
import { addNewServer, buyNewServer, changeTargetServer, replaceScript, upgradePurchasedServer } from "/utils/servers";
import { growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";
import { Button } from "./Button";
import { ServerDetails } from "./ServerDetails";

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
      </body>
    </html>
  )
}
