import { NS } from "@ns";
import { nukeServer, readServerConfig, writeServerConfig } from "../utils/helpers";
import { LoopHackConfig } from "../interfaces";
import { BASIC_SCRIPT_RAM_SIZE } from "../constants";
import { LoopHackDashBoard } from "/components/loopHackDashboard";

/*eslint no-constant-condition: */

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

// let numHackThreads = 0;
// let numWeakenThreads = 0;
// let numGrowThreads = 0;
let TARGET_SERVER = '';

/**
 * Main fn - deploys initial scripts and opens UI
 * @param ns - Netscript
 */
export async function main(ns: NS): Promise<void> {
  const args = ns.args;
  const existingConfig: LoopHackConfig = readServerConfig(ns)[0]

  // INITIAL hack config with no augmentations
  let config: LoopHackConfig;
  if (!existingConfig && args && args[0] === "init") {
    config = {
      "growServers": ["n00dles", "sigma-cosmetics"],
      "hackServers": [],
      "weakenServers": ["joesguns"],
      "targetServer": "foodnstuff"
    }
    TARGET_SERVER = config.targetServer
    writeServerConfig(ns, config);
  } else {
    config = existingConfig;
    TARGET_SERVER = existingConfig.targetServer
  }
  ns.disableLog("ALL");

  // Run available executables against target server from home server
  nukeServer(ns, TARGET_SERVER)

  await deployInitialScript(ns, "/utils/hack.js", config.hackServers);
  await deployInitialScript(ns, "/utils/grow.js", config.growServers);
  await deployInitialScript(ns, "/utils/weaken.js", config.weakenServers);

  // OPEN UI FOR MONITORING TARGET SERVER
  if (!ns.getRunningScript("/ui/monitorUI.js", "home")) {
    ns.exec("/ui/monitorUI.js", "home", undefined, TARGET_SERVER);
  }

  // OPEN UI TO LIST SEVERS & MANUALLY BALANCE SCRIPTS
  await openHackUI(ns, config);
}

async function openHackUI(ns: NS, config:LoopHackConfig) {
  ns.ui.openTail();
  ns.ui.resizeTail(360, 355);
  while (ns.scriptRunning("/ui/loopHack.js", "home")) {
    ns.clearLog();
    ns.printRaw(
      <LoopHackDashBoard ns={ns} config={config} />
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
async function deployInitialScript(ns: NS, script: string, initialServers: string[]): Promise<void> {
  ns.disableLog("ALL");
  for (let i = 0; i < initialServers.length; i++) {
    const curServ = initialServers[i];
    const { maxRam, ramUsed } = ns.getServer(curServ);
    const numThreads = Math.floor((maxRam - ramUsed) / BASIC_SCRIPT_RAM_SIZE);

    nukeServer(ns, curServ)
    ns.scp(script, curServ);
    ns.exec(script, curServ, numThreads - 1, TARGET_SERVER); // (uses one less thread just to be safe)

    // updateGlobalNumThreads(numThreads, script)
    await ns.sleep(Math.random() * 500);
  }
}
