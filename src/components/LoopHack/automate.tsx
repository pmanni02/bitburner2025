import { NS } from "@ns";
import { LoopHackConfig } from "/interfaces";
import { getMonitorDetails } from "../Monitor/main";
import { moveScript } from "/utils/servers";
import { FUNDED_PERCENT_THRESHOLD, growScriptPath, HACK_PERCENT_THRESHOLD, hackScriptPath, weakenScriptPath } from "/constants";

/*eslint no-constant-condition: */

// FIXME: 
//  - update MonitorDetails percent types to numbers

// TODO: 
//  - update logic to move largest resource eg: if there are 2 hack servers
//  - first move the larger server instead of picking a random server
//  - break down logic into smaller functions

export async function main(ns: NS, config: LoopHackConfig): Promise<LoopHackConfig> {
  // ns.toast('Launching automated loop hack script!');

  const { weakenServers, hackServers, growServers, targetServer }: LoopHackConfig = config;
  const { fundedPercent, hackedPercent } = getMonitorDetails(ns, targetServer);
  // ns.tprint('monitoring ', targetServer);
  // ns.tprint('hacked: ', Number.parseInt(hackedPercent));
  // ns.tprint('funded: ', Number.parseInt(fundedPercent));

  ns.tprint(hackServers, growServers, weakenServers)

  // IF the hack percent is < 90 and there are any 'hack' servers and more than 1 grow server
  // THEN move (first from hack servers, then from grow servers) a server to weaken servers
  if (Number.parseInt(hackedPercent) < HACK_PERCENT_THRESHOLD) {
    if (hackServers.length >= 1) {
      ns.tprint(`adding ${hackServers[0]} to weaken group`);
      config = moveScript(ns, hackServers[0], hackScriptPath, weakenScriptPath, config);
    } else if (growServers.length >= 1) {
      ns.tprint(`adding ${growServers[0]} to weaken group`);
      config = moveScript(ns, growServers[0], growScriptPath, weakenScriptPath, config);
    } else {
      ns.tprint('No available servers available for weaken');
    }
  } else if (Number.parseInt(fundedPercent) < FUNDED_PERCENT_THRESHOLD) {
    if (hackServers.length >= 1) {
      ns.tprint(`adding ${hackServers[0]} to grow group`);
      config = moveScript(ns, hackServers[0], hackScriptPath, growScriptPath, config);
    } else if (weakenServers.length > 1) {
      ns.tprint(`adding ${weakenServers[0]} to grow group`);
      config = moveScript(ns, weakenServers[0], weakenScriptPath, growScriptPath, config);
    } else {
      ns.tprint('No available servers available for grow');
    }
  } else {
    if (hackServers.length === 0 && growServers.length >= 1) {
      ns.tprint(`adding ${growServers[0]} to hack group`);
      config = moveScript(ns, growServers[0], growScriptPath, hackScriptPath, config);
    }
  }
  return config;
}
