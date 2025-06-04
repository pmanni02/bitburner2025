import { NS } from "@ns";
import { BASIC_SCRIPT_RAM_SIZE, RAM_CHOICES, growScriptPath, weakenScriptPath, hackScriptPath } from "/constants";
import { getAlternativeTargetServers, getServersReadyToUseForHacking, killRunningScripts, nukeServer, writeServerConfig } from "./helpers";
import { LoopHackConfig } from "/interfaces";

export const buyNewServer = async (ns: NS, config: LoopHackConfig): Promise<LoopHackConfig> => {
  ns.toast("buying server...");

  // select new server size
  const serverSize = await ns.prompt("Please select the server size", {
    type: "select",
    choices: RAM_CHOICES
  });

  const ram = Number.parseInt(serverSize.toString()) ? Number.parseInt(serverSize.toString()) : 8;
  const purchasedServers = ns.getPurchasedServers();
  const canPurchase = ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram);

  // check if you have reached the purchased server limit and if you have enough funds to buy more
  if (purchasedServers.length < ns.getPurchasedServerLimit() && canPurchase) {
    const serverNum = purchasedServers.length ? purchasedServers.length : 0;
    const newServer = ns.purchaseServer('serv-' + ram + '-' + serverNum, ram);
    const numThreads = Math.floor(ram / BASIC_SCRIPT_RAM_SIZE);

    // default to copying/running grow script
    ns.scp(growScriptPath, newServer);
    ns.exec(growScriptPath, newServer, numThreads - 1, config.targetServer);
    // updateGlobalNumThreads(numThreads - 1, "/utils/grow.js")
    ns.tprint("deployed new server: " + newServer + " with grow script");

    config.growServers.unshift(newServer);
    writeServerConfig(ns, config)
  } else {
    ns.toast("at purchased server limit or not enough funds")
  }

  ns.tprint("bought server costing: " + ns.getPurchasedServerCost(ram))
  return config
}

export const addNewServer = (ns: NS, config: LoopHackConfig): LoopHackConfig | undefined => {
  ns.toast("adding server...");

  const potentialServersToHack = getServersReadyToUseForHacking(ns, true);
  const currentServers = [...config.growServers, ...config.hackServers, ...config.weakenServers];

  const toBeHacked = potentialServersToHack.filter((serv) => {
    return !currentServers.includes(serv.hostname)
  });

  if (!toBeHacked.length) {
    ns.tprint("NO MORE AVAILABLE SERVERS TO HACK!");
    return;
  }

  const newServer = toBeHacked.shift();
  if (newServer && newServer.hostname) {
    const numThreads = Math.floor(newServer?.maxRam / BASIC_SCRIPT_RAM_SIZE);
    nukeServer(ns, config.targetServer)

    // default to copying/running grow script
    ns.scp(growScriptPath, newServer.hostname);
    ns.exec(growScriptPath, newServer.hostname, numThreads - 1, config.targetServer);
    // updateGlobalNumThreads(numThreads, "/utils/grow.js")

    ns.tprint("deployed new server: " + newServer.hostname + " with grow script");
    config.growServers.unshift(newServer.hostname);
    writeServerConfig(ns, config);
  }

  return config
}

/**
 * Upgrade RAM of existing purchased server.
 * NOTE: currently kills any running scripts. Need to manually re-add server
 * to start a script
 * @param ns Netscript
 */
export const upgradePurchasedServer = async (ns: NS, config: LoopHackConfig): Promise<LoopHackConfig> => {
  const purchasedServers = ns.getPurchasedServers();
  const serverInput = await ns.prompt("Select server to upgrade", {
    type: "select",
    choices: purchasedServers
  });

  const currentRam = ns.getServer(serverInput.toString()).maxRam;
  const choices = RAM_CHOICES.filter((i) => Number.parseInt(i) > currentRam)
  const ramInput = await ns.prompt("Select RAM", {
    type: "select",
    choices: choices
  });
  const newRam = Number.parseInt(ramInput.toString()) ? Number.parseInt(ramInput.toString()) : 8;

  let newName = "";
  if (serverInput && ramInput && ns.upgradePurchasedServer(serverInput.toString(), newRam)) {
    const endIndex = serverInput.toString().lastIndexOf("-")
    newName = serverInput.toString().substring(0, 5) + newRam + serverInput.toString().slice(endIndex)
    ns.renamePurchasedServer(serverInput.toString(), newName)
    ns.toast("upgraded server " + serverInput.toString() + " with " + newRam);

    const isHackScript = config.hackServers.includes(serverInput.toString());
    const isWeakenScript = config.weakenServers.includes(serverInput.toString());
    const isGrowScript = config.growServers.includes(serverInput.toString());

    const getServerIndex = (servers: string[], serverToFind: string) => {
      return servers.findIndex((s) => s === serverToFind.toString())
    }

    if (isHackScript) {
      const index = getServerIndex(config.hackServers, serverInput.toString())
      config.hackServers.splice(index, 1);
      config.hackServers.push(newName);
    } else if (isWeakenScript) {
      const index = getServerIndex(config.weakenServers, serverInput.toString())
      config.weakenServers.splice(index, 1);
      config.weakenServers.push(newName);
    } else if (isGrowScript) {
      const index = getServerIndex(config.growServers, serverInput.toString())
      config.growServers.splice(index, 1);
      config.growServers.push(newName);
    }
    writeServerConfig(ns, config);
  } else {
    ns.toast("something went wrong with server upgrade");
  }

  return config

  // TODO: add more threads of whatever scripts is current running
}

export const changeTargetServer = async (ns: NS, config: LoopHackConfig): Promise<LoopHackConfig> => {
  const availableTargets = getAlternativeTargetServers(ns)
  const availableTargetNames = availableTargets.map((target) => target.hostname)
  
  const newTargetServer = await ns.prompt("Select new target server", {
    type: "select",
    choices: availableTargetNames
  });
  ns.tprint('new target server: ', newTargetServer)

  if (newTargetServer) {
    const runningLoopHackUI = ns.getRunningScript('/ui/loopHack.js')
    ns.tprint('runningLoopHackUI', runningLoopHackUI)

    // save updated config w/ new target
    config.targetServer = newTargetServer.toString();
    writeServerConfig(ns, config);

    // kill existing runing scripts
    killRunningScripts(ns)

    // kill script running ui for old target
    if (runningLoopHackUI) {
      ns.kill(runningLoopHackUI.pid)
      ns.ui.closeTail(runningLoopHackUI.pid)
    }
    ns.exec('/ui/loopHack.js', 'home')
  } else {
    ns.tprint('Please select new target server')
  }
  return config
}

// TODO: need ability to update global thread count
export const serverPrompt = async (ns: NS, server: string, config: LoopHackConfig): Promise<LoopHackConfig> => {
  const choice = await ns.prompt("Select a server option", { type: "select", choices: ["stop scripts"] });

  if (choice.toString() === "stop scripts") {
    ns.tprint("killing scripts on " + server)
    ns.killall(server);

    if (config.growServers.includes(server)) {
      config.growServers.splice(config.growServers.indexOf(server), 1);
    } else if (config.hackServers.includes(server)) {
      config.hackServers.splice(config.hackServers.indexOf(server), 1);
    } else if (config.weakenServers.includes(server)) {
      config.weakenServers.splice(config.weakenServers.indexOf(server), 1);
    }
    writeServerConfig(ns, config);
  }
  return config
}

export const replaceScript = (ns: NS, scriptToKill: string, scriptToStart: string, config: LoopHackConfig): LoopHackConfig => {
  // const config: LoopHackConfig = readServerConfig(ns)[0];

  let serverName;
  if (scriptToKill === growScriptPath) {
    serverName = config.growServers.pop();
  } else if (scriptToKill === hackScriptPath) {
    if (config.hackServers.length) {
      serverName = config.hackServers.pop()
    } else {
      serverName = config.weakenServers.pop()
    }
  } else if (scriptToKill === weakenScriptPath) {
    serverName = config.weakenServers.pop()
  }
  writeServerConfig(ns, config)

  ns.toast("redeploying from " + scriptToKill + " to " + scriptToStart);
  if (serverName) {
    if (ns.killall(serverName)) {
      ns.rm(scriptToKill, serverName);
    }
    const { maxRam, ramUsed } = ns.getServer(serverName);
    const numThreads = Math.floor((maxRam - ramUsed) / BASIC_SCRIPT_RAM_SIZE);

    ns.scp(scriptToStart, serverName);
    ns.exec(scriptToStart, serverName, numThreads, config.targetServer);
    // updateGlobalNumThreads(-numThreads, scriptToKill)

    if (scriptToStart === hackScriptPath) {
      config.hackServers.unshift(serverName)
    } else if (scriptToStart === growScriptPath) {
      config.growServers.unshift(serverName)
    } else if (scriptToStart === weakenScriptPath) {
      config.weakenServers.unshift(serverName)
    }
    writeServerConfig(ns, config);
    // updateGlobalNumThreads(numThreads, scriptToStart)
  }
  return config
}
