import { NS } from "@ns";
import { copyAndExecScript, nukeServer, readServerConfig, writeServerConfig } from "../../utils/helpers";
import { LoopHackConfig } from "../../interfaces";
import { growScriptPath, weakenScriptPath, hackScriptPath } from "../../constants";
import { LoopHackDashboard } from "./LoopHackDashboard";
import React from '/lib/react';

/*eslint no-constant-condition: */

/**
 * Main fn - deploys initial scripts and opens UI
 * @param ns - Netscript
 */
export async function main(ns: NS): Promise<void> {
  ns.toast('Launching loop hack script!')
  const args = ns.args;
  const existingConfig: LoopHackConfig = readServerConfig(ns)[0];

  // INITIAL hack config with no augmentations
  let config: LoopHackConfig;
  if (args && args[0] === "init") {
    config = {
      growServers: ["n00dles", "sigma-cosmetics"],
      hackServers: [],
      weakenServers: ["joesguns"],
      targetServer: "foodnstuff"
    }
    writeServerConfig(ns, config);
  } else {
    config = existingConfig;
  }
  config.isAutomated = false; // turn off automation on load
  ns.disableLog("ALL");

  // Run available executables against target server from home server
  nukeServer(ns, config.targetServer)

  const { hackServers, growServers, weakenServers, targetServer } = config;

  await deployInitialScript(ns, hackScriptPath, hackServers, targetServer);
  await deployInitialScript(ns, growScriptPath, growServers, targetServer);
  await deployInitialScript(ns, weakenScriptPath, weakenServers, targetServer);

  // OPEN UI FOR MONITORING TARGET SERVER
  if (!ns.getRunningScript("/components/Monitor/main.js", "home")) {
    ns.exec("/components/Monitor/main.js", "home", undefined, targetServer);
  }

  // OPEN UI TO LIST SEVERS & MANUALLY BALANCE SCRIPTS 
  await openHackUI(ns, config);
}

async function openHackUI(ns: NS, config: LoopHackConfig) {
  ns.ui.openTail();
  ns.ui.resizeTail(360, 355);

  while (ns.scriptRunning("/components/LoopHack/main.js", "home")) {
    ns.clearLog();
    ns.printRaw(
      <div>
        <LoopHackDashboard ns={ns} config={config} />
        {/* <LoopHackV2 ns={ns} config={config} /> */}
      </div>
    );
    await ns.asleep(3000);
  }
}

/**
 * Deploys/runs provided script on a list of servers
 * @param ns Netscript
 * @param script grow/hack/weaken scripts
 * @param initialServers array of servers that will run the provided script
 */
async function deployInitialScript(ns: NS, script: string, initialServers: string[], targetServer: string): Promise<void> {
  ns.disableLog("ALL");
  for (let i = 0; i < initialServers.length; i++) {
    const curServ = initialServers[i];
    copyAndExecScript(ns, curServ, targetServer, script)

    await ns.sleep(Math.random() * 500);
  }
}
