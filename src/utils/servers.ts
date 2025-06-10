import { NS } from "@ns";
import { RAM_CHOICES, growScriptPath, weakenScriptPath, hackScriptPath } from "/constants";
import { copyAndExecScript, getAlternativeTargetServers, getServersReadyToUseForHacking, killRunningScripts, writeServerConfig } from "./helpers";
import { LoopHackConfig } from "/interfaces";

export const buyNewServer = async (ns: NS, config: LoopHackConfig): Promise<LoopHackConfig> => {
  ns.toast("buying server...");

  // select new server size
  const serverSize = await ns.prompt("Please select the server size", {
    type: "select",
    choices: RAM_CHOICES
  }).then((input) => input.toString());

  const ram = Number.parseInt(serverSize) ? Number.parseInt(serverSize) : 8;
  const purchasedServers = ns.getPurchasedServers();
  const canPurchase = ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram);

  // check if you have reached the purchased server limit and if you have enough funds to buy more
  if (purchasedServers.length < ns.getPurchasedServerLimit() && canPurchase) {
    const serverNum = purchasedServers.length ? purchasedServers.length : 0;
    const newServer = ns.purchaseServer('serv-' + ram + '-' + serverNum, ram);

    // default to copying/running grow script
    copyAndExecScript(ns, newServer, config.targetServer, growScriptPath)

    ns.tprint("deployed new server: " + newServer + " with grow script");

    config.growServers.unshift(newServer);
    writeServerConfig(ns, config);
  } else {
    ns.toast("at purchased server limit or not enough funds");
  }

  ns.tprint("bought server costing: " + ns.getPurchasedServerCost(ram));
  return config;
}

export const addNewServer = (ns: NS, config: LoopHackConfig): LoopHackConfig | undefined => {
  const potentialServersToHack = getServersReadyToUseForHacking(ns, true);
  const currentServers = [...config.growServers, ...config.hackServers, ...config.weakenServers];

  const toBeHacked = potentialServersToHack.filter((serv) => {
    return !currentServers.includes(serv.hostname);
  });

  if (!toBeHacked.length) {
    ns.tprint("NO MORE AVAILABLE SERVERS TO HACK!");
    return;
  }

  const newServer = toBeHacked.shift();
  if (newServer && newServer.hostname) {
    // default to copying/running grow script
    copyAndExecScript(ns, newServer.hostname, config.targetServer, growScriptPath)

    ns.tprint("deployed new server: " + newServer.hostname + " with grow script");
    config.growServers.unshift(newServer.hostname);
    writeServerConfig(ns, config);
  }

  return config;
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
  }).then((input) => input.toString());

  const currentRam = ns.getServer(serverInput).maxRam;
  const choices = RAM_CHOICES.filter((i) => Number.parseInt(i) > currentRam)
  const ramInput = await ns.prompt("Select RAM", {
    type: "select",
    choices: choices
  }).then((input) => input.toString());
  const newRam = Number.parseInt(ramInput) ? Number.parseInt(ramInput) : 8;

  let newName = "";
  if (serverInput && ramInput && ns.upgradePurchasedServer(serverInput, newRam)) {
    const endIndex = serverInput.lastIndexOf("-");
    newName = serverInput.substring(0, 5) + newRam + serverInput.slice(endIndex)
    ns.renamePurchasedServer(serverInput, newName);
    ns.toast("upgraded server " + serverInput + " with " + newRam);

    const isHackScript = config.hackServers.includes(serverInput);
    const isWeakenScript = config.weakenServers.includes(serverInput);
    const isGrowScript = config.growServers.includes(serverInput);

    const getServerIndex = (servers: string[], serverToFind: string) => {
      return servers.findIndex((s) => s === serverToFind.toString())
    }

    if (isHackScript) {
      const index = getServerIndex(config.hackServers, serverInput)
      config.hackServers.splice(index, 1);
      config.hackServers.push(newName);
    } else if (isWeakenScript) {
      const index = getServerIndex(config.weakenServers, serverInput)
      config.weakenServers.splice(index, 1);
      config.weakenServers.push(newName);
    } else if (isGrowScript) {
      const index = getServerIndex(config.growServers, serverInput)
      config.growServers.splice(index, 1);
      config.growServers.push(newName);
    }
    writeServerConfig(ns, config);
  } else {
    ns.toast("something went wrong with server upgrade");
  }

  return config;
}

export const changeTargetServer = async (ns: NS, config: LoopHackConfig): Promise<LoopHackConfig> => {
  const availableTargets = getAlternativeTargetServers(ns)
  const availableTargetNames = availableTargets.map((target) => target.hostname)

  const newTargetServer = await ns.prompt("Select new target server", {
    type: "select",
    choices: availableTargetNames
  }).then((input) => input.toString());
  ns.tprint('new target server: ', newTargetServer);

  if (newTargetServer) {
    const runningLoopHackUI = ns.getRunningScript('/components/LoopHack/main.js')
    ns.tprint('runningLoopHackUI', runningLoopHackUI);

    // save updated config w/ new target
    config.targetServer = newTargetServer;
    writeServerConfig(ns, config);

    // kill existing runing scripts
    killRunningScripts(ns)

    // kill script running ui for old target
    if (runningLoopHackUI) {
      ns.kill(runningLoopHackUI.pid)
      ns.ui.closeTail(runningLoopHackUI.pid)
    }
    ns.exec('/components/LoopHack/main.js', 'home')
  } else {
    ns.tprint('Please select new target server')
  }
  return config;
}

export const serverPrompt = async (ns: NS, server: string, config: LoopHackConfig): Promise<LoopHackConfig> => {
  const choice = await ns.prompt("Select a server option", { type: "select", choices: ["stop scripts", "move to"] }).then((input) => input.toString());
  const { growServers, weakenServers, hackServers } = config

  switch (choice) {
    case "stop scripts":
      ns.tprint("killing scripts on " + server);
      ns.killall(server);

      if (growServers.includes(server)) {
        growServers.splice(growServers.indexOf(server), 1);
      } else if (hackServers.includes(server)) {
        hackServers.splice(hackServers.indexOf(server), 1);
      } else if (weakenServers.includes(server)) {
        weakenServers.splice(weakenServers.indexOf(server), 1);
      }
      writeServerConfig(ns, config);
      break;
    case "move to": {
      const newScript = await ns.prompt("Select script", { type: "select", choices: ["hack", "weaken", "grow"] }).then((input) => input.toString())
      ns.tprint(`replacing current script on ${server} with ${newScript}`);
      const currentHackScriptPath = getScriptGroupType(ns, server, config);

      //FIXME: remove if statement, replace with no-non-null-assertion elint
      if (currentHackScriptPath) {
        let updatedConfig = config
        if (newScript === "hack") {
          updatedConfig = replaceScript(ns, currentHackScriptPath, hackScriptPath, config);
        } else if(newScript === "grow") {
          updatedConfig = replaceScript(ns, currentHackScriptPath, growScriptPath, config);
        } else if(newScript === "weaken") {
          updatedConfig = replaceScript(ns, currentHackScriptPath, weakenScriptPath, config);
        }
        writeServerConfig(ns, updatedConfig);
      }
    }
      break;
    default:
      break;
  }
  return config;
}

export const replaceScript = (ns: NS, scriptToKill: string, scriptToStart: string, config: LoopHackConfig): LoopHackConfig => {
  let serverName;
  if (scriptToKill === growScriptPath) {
    serverName = config.growServers.pop();
  } else if (scriptToKill === hackScriptPath) {
    if (config.hackServers.length) {
      serverName = config.hackServers.pop();
    } else {
      serverName = config.weakenServers.pop();
    }
  } else if (scriptToKill === weakenScriptPath) {
    serverName = config.weakenServers.pop();
  }
  writeServerConfig(ns, config);

  ns.tprint("redeploying from " + scriptToKill + " to " + scriptToStart);
  if (serverName) {
    if (ns.killall(serverName)) {
      ns.rm(scriptToKill, serverName);
    }

    copyAndExecScript(ns, serverName, config.targetServer, scriptToStart, true)

    if (scriptToStart === hackScriptPath) {
      config.hackServers.unshift(serverName);
    } else if (scriptToStart === growScriptPath) {
      config.growServers.unshift(serverName);
    } else if (scriptToStart === weakenScriptPath) {
      config.weakenServers.unshift(serverName);
    }
    writeServerConfig(ns, config);
  }
  return config;
}

function getScriptGroupType(ns: NS, serverName: string, config: LoopHackConfig) {
  const { hackServers, growServers, weakenServers } = config;

  const isHackScript = hackServers.includes(serverName);
  const isWeakenScript = weakenServers.includes(serverName);
  const isGrowScript = growServers.includes(serverName);

  if (isHackScript) {
    return hackScriptPath;
  } else if (isGrowScript) {
    return growScriptPath;
  } else if (isWeakenScript) {
    return weakenScriptPath;
  }
  ns.toast('something went wrong..')
  return
}
