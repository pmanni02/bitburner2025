import { NS } from "@ns";
import { readServerConfig } from "/utils/helpers";
import { LoopHackConfig } from "/interfaces";
import { getMonitorDetails } from "../Monitor/main";
import { moveScript } from "/utils/servers";
import { growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";

/*eslint no-constant-condition: */

// FIXME: 
//  - update MonitorDetails percent types to numbers
//  - move thresholds to constants file

export async function main(ns: NS): Promise<void> {
  ns.toast('Launching automated loop hack script!');

  while (ns.scriptRunning("/components/LoopHack/automate.js", "home")) {
    const config = readServerConfig(ns)[0];
    const { weakenServers, hackServers, growServers, targetServer }: LoopHackConfig = config;
    const { fundedPercent, hackedPercent } = getMonitorDetails(ns, targetServer);
    ns.tprint('monitoring ', targetServer);
    ns.tprint('hacked: ', Number.parseInt(hackedPercent));
    ns.tprint('funded: ', Number.parseInt(fundedPercent));

    ns.tprint(hackServers, growServers, weakenServers)

    // IF the hack percent is < 90 and there are any 'hack' servers and more than 1 grow server
    // THEN move (first from hack servers, then from grow servers) a server to weaken servers
    if (Number.parseInt(hackedPercent) < 90) {
      if (hackServers.length >= 1) {
        ns.tprint(`adding ${hackServers[0]} to weaken group`);
        // moveScript(ns, hackServers[0], hackScriptPath, weakenScriptPath, config);
      } else if (growServers.length >= 1) {
        ns.tprint(`adding ${growServers[0]} to weaken group`);
        // moveScript(ns, growServers[0], growScriptPath, weakenScriptPath, config);
      } else {
        ns.tprint('No available servers available for weaken');
      }
    } else if (Number.parseInt(fundedPercent) < 95) {
      if (hackServers.length >= 1) {
        ns.tprint(`adding ${hackServers[0]} to grow group`);
        // moveScript(ns, hackServers[0], hackScriptPath, growScriptPath, config);
      } else if (weakenServers.length > 1) {
        ns.tprint(`adding ${weakenServers[0]} to grow group`);
        // moveScript(ns, weakenServers[0], weakenScriptPath, growScriptPath, config);
      } else {
        ns.tprint('No available servers available for grow');
      }
    } else {
      if(hackServers.length === 0 && growServers.length >= 1) {
        ns.tprint(`adding ${growServers[0]} to hack group`);
        // moveScript(ns, growServers[0], growScriptPath, hackScriptPath, config);
      }
    }
    await ns.asleep(300000); // 5 mins
  }
}

