import { NS } from "@ns";
import { MonitorDetails } from "/interfaces";
import { MonitorDashboard } from "./MonitorDashboard";
import React from '/lib/react';


/*eslint no-constant-condition: */
export async function main(ns: NS, targetServer: string | undefined) {
  ns.disableLog("ALL");

  // get serv from either inline argument or fn parameter
  const servArg = ns.args[0];
  let serv = "";
  if (servArg || targetServer) {
    serv = targetServer ? targetServer : servArg.toString();
  } else {
    ns.tprint("provide server name argument");
    return
  }

  ns.ui.openTail();
  ns.ui.resizeTail(380, 130);
  ns.ui.moveTail(1200, 0)
  ns.ui.setTailTitle(serv + " monitor");
  ns.ui.setTailFontSize(10)

  while (true) {
    const monitorDetails = getMonitorDetails(ns, serv)
    ns.clearLog();

    ns.printRaw(
      <MonitorDashboard monitorDetails={monitorDetails} />
    )
    await ns.asleep(1000);
  }
}

export function getMonitorDetails(ns: NS, server: string): MonitorDetails {
  const {
    moneyAvailable,
    moneyMax,
    hackDifficulty,
    minDifficulty,
    organizationName,
    serverGrowth
  } = ns.getServer(server);

  // time in seconds
  const hackTime = ns.formatNumber(ns.getHackTime(server) / 1000, 2);
  const growTime = ns.formatNumber(ns.getGrowTime(server) / 1000, 2);
  const weakenTime = ns.formatNumber(ns.getWeakenTime(server) / 1000, 2);

  const availableFunds = moneyAvailable ? ns.formatNumber(moneyAvailable, 2) : '';
  const fundedPercent = moneyAvailable && moneyMax ? ns.formatPercent((moneyAvailable / moneyMax)) : '';
  const hackedPercent = minDifficulty && hackDifficulty ? ns.formatPercent((minDifficulty / hackDifficulty)) : '';
  const hackLevel = hackDifficulty ? ns.formatNumber(hackDifficulty, 2) : '';
  const rateOfChange = getRateOfChange(ns, server);
  const growthEmoji = getRateOfChangeEmoji(rateOfChange)

  return {
    organizationName,
    availableFunds,
    fundedPercent,
    hackedPercent,
    hackLevel,
    growthEmoji,
    serverGrowth,
    hackTime,
    growTime,
    weakenTime
  }
}

function getRateOfChange(ns: NS, serverName: string) {
  let lastServerAmount = 1;
  const currentAmount = ns.getServer(serverName).moneyAvailable;

  let rateOfChange = 0
  if (currentAmount) {
    rateOfChange = lastServerAmount - currentAmount;
    lastServerAmount = currentAmount;
  }

  return rateOfChange;
}

function getRateOfChangeEmoji(rateOfChange: number) {
  if (rateOfChange === 0) {
    return 8594 // →
  } else if (rateOfChange > 0) {
    return 8600 // ↘
  } else if (rateOfChange < 0) {
    return 8599 // ↗
  }
  return 8596 //↔
}
