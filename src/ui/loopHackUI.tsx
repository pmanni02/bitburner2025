import { NS } from "@ns";
import { getServersReadyToUseForHacking, readServerConfig, writeServerConfig } from "../helpers";
import { LoopHackConfig } from "../interfaces";
import { BASIC_SCRIPT_RAM_SIZE, RAM_CHOICES } from "../constants";

/*eslint no-constant-condition: */

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

let numHackThreads = 0;
let numWeakenThreads = 0;
let numGrowThreads = 0;
let TARGET_SERVER = '';

/**
 * Main fn - deploys initial scripts and opens UI
 * @param ns - Netscript
 */
export async function main(ns: NS): Promise<void> {
  // const args = ns.args;
  const config: LoopHackConfig = readServerConfig(ns)[0]
  TARGET_SERVER = config.targetServer

  // INITIAL hack config with no augmentations
  // if (config !== undefined && args && args[0] === "init") {
  //   config.growServers = ["n00dles", "sigma-cosmetics"];
  //   config.hackServers = [];
  //   config.weakenServers = ["joesguns"];
  //   TARGET_SERVER = "foodnstuff"
  //   writeServerConfig(ns, config);
  // }

  ns.disableLog("ALL");

  // Run available "hack" scripts from home server
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(TARGET_SERVER);
  } 
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(TARGET_SERVER);
  } 
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(TARGET_SERVER);
  }
  ns.nuke(TARGET_SERVER);

  await deployInitialScript(ns, "/utils/hack.js", config.hackServers);
  await deployInitialScript(ns, "/utils/grow.js", config.growServers);
  await deployInitialScript(ns, "/utils/weaken.js", config.weakenServers);

  // OPEN UI FOR MONITORING TARGET SERVE
  if (!ns.getRunningScript("/ui/monitorUI.js", "home")) {
    ns.exec("/ui/monitorUI.js", "home", undefined, TARGET_SERVER); 
  }

  // OPEN UI TO LIST SEVERS & MANUALLY BALANCE SCRIPTS
  await openHackUI(ns);
}

async function openHackUI(ns: NS) {
  ns.ui.openTail();
  ns.ui.resizeTail(360, 355);
  while (ns.scriptRunning("/ui/loopHackUI.js", "home")) {
    ns.clearLog();
    const config: LoopHackConfig = readServerConfig(ns)[0];
    ns.printRaw(await getHackUI(ns, config));
    await ns.asleep(5000);
  }
}

async function getHackUI(ns: NS, config: LoopHackConfig) {
  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>
        <div id="hack-div">
          {addButton("Add Hack", "addHack", () => replaceScript(ns, "/utils/grow.js", "/utils/hack.js"))}
          <details open>
            <summary>Hack Servers: {[numHackThreads]}</summary>
            {await makeList(ns, config.hackServers)}
          </details>
        </div>

        <div id="grow-div">
          {addButton("Add Grow", "addGrow", () => replaceScript(ns, "/utils/hack.js", "/utils/grow.js"))}
          <details open>
            <summary>Grow Servers: {[numGrowThreads]}</summary>
            {await makeList(ns, config.growServers)}
          </details>
        </div>

        <div id="weaken-div">
          {addButton("Add Weaken", "addWeaken", () => replaceScript(ns, "/utils/grow.js", "/utils/weaken.js"))}
          {addButton("Remove Weaken", "removeWeaken", () => replaceScript(ns, "/utils/weaken.js", "/utils/grow.js"))}
          <details open>
            <summary>Weaken Servers: {[numWeakenThreads]}</summary>
            {await makeList(ns, config.weakenServers)}
          </details>
        </div>

        <br></br>

        {addButton("Buy Server", "buyServer", () => buyNewServer(ns))}
        {addButton("Upgrade Server", "upgradeServer", () => upgradePurchasedServer(ns))}

        <br></br>
        {addButton("Add Server", "addServer", () => addNewServer(ns))}
        {addButton("Change Target", "changeTarget", () => changeTargetServer(ns))}
      </body>
    </html>
  )
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

    if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(curServ);
    }

    ns.nuke(curServ);
    ns.scp(script, curServ);
    ns.exec(script, curServ, numThreads - 1, TARGET_SERVER); // (uses one less thread just to be safe)

    updateGlobalNumThreads(numThreads, script)
    await ns.sleep(Math.random() * 500);
  }
}

function replaceScript(ns: NS, scriptToKill: string, scriptToStart: string) {
  const config: LoopHackConfig = readServerConfig(ns)[0];

  let serverName;
  if (scriptToKill === "/utils/grow.js") {
    serverName = config.growServers.pop();
  } else if (scriptToKill === "/utils/hack.js") {
    if (config.hackServers.length) {
      serverName = config.hackServers.pop()
    } else {
      serverName = config.weakenServers.pop()
    }
  } else if (scriptToKill === "/utils/weaken.js") {
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
    ns.exec(scriptToStart, serverName, numThreads, TARGET_SERVER);
    updateGlobalNumThreads(-numThreads, scriptToKill)

    const config: LoopHackConfig = readServerConfig(ns)[0];

    if (scriptToStart === "/utils/hack.js") {
      config.hackServers.unshift(serverName)
    } else if (scriptToStart === "/utils/grow.js") {
      config.growServers.unshift(serverName)
    } else if (scriptToStart === "/utils/weaken.js") {
      config.weakenServers.unshift(serverName)
    }
    writeServerConfig(ns, config);
    updateGlobalNumThreads(numThreads, scriptToStart)
  }
}

async function buyNewServer(ns: NS) {
  ns.toast("buying server...");
  const config: LoopHackConfig = readServerConfig(ns)[0];

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
    ns.scp("/utils/grow.js", newServer);
    ns.exec("/utils/grow.js", newServer, numThreads - 1, TARGET_SERVER);
    updateGlobalNumThreads(numThreads - 1, "/utils/grow.js")
    ns.tprint("deployed new server: " + newServer + " with grow script");

    config.growServers.unshift(newServer);
    writeServerConfig(ns, config)
  } else {
    ns.toast("at purchased server limit or not enough funds")
  }
  ns.tprint("bought server costing: " + ns.getPurchasedServerCost(ram))
}

function addNewServer(ns: NS) {
  ns.toast("adding server...");
  const config: LoopHackConfig = readServerConfig(ns)[0];

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

    if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(newServer.hostname);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
      ns.ftpcrack(newServer.hostname);
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
      ns.relaysmtp(newServer.hostname);
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
      ns.httpworm(newServer.hostname);
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
      ns.sqlinject(newServer.hostname);
    }
    ns.nuke(newServer.hostname);

    // default to copying/running grow script
    ns.scp("/utils/grow.js", newServer.hostname);
    ns.exec("/utils/grow.js", newServer.hostname, numThreads - 1, TARGET_SERVER);
    updateGlobalNumThreads(numThreads, "/utils/grow.js")

    ns.tprint("deployed new server: " + newServer.hostname + " with grow script");
    config.growServers.unshift(newServer.hostname);
    writeServerConfig(ns, config);
  }
}

/**
 * Upgrade RAM of existing purchased server.
 * NOTE: currently kills any running scripts. Need to manually re-add server
 * to start a script
 * TODO: automatically run existing script to remove manual step
 * @param ns Netscript
 */
async function upgradePurchasedServer(ns: NS) {
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

    const config: LoopHackConfig = readServerConfig(ns)[0];

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

  // TODO: add more threads of whatever scripts is current running
}

function changeTargetServer(ns: NS) {
  ns.clearLog()
  // save current config
  // kill all scripts running
  // kill loopHackUI and monitorUI on home server
  // update target server global variable
  // rerun loopHackUI
}

//------------------------------------------------------------------------------------
function addButton(buttonName: string, buttonId: string, onClickFn: () => void) {
  return (
    <button id={buttonId} onClick={onClickFn}>
      {buttonName}
    </button>
  );
}

async function makeList(ns: NS, array: string[]) {
  const listItems = array.map((item) => (
    <p key={item} onClick={() => serverPrompt(ns, item)}> {item}</p>
  ));
  return listItems;
}

// TODO: need ability to update global thread count
async function serverPrompt(ns: NS, server: string) {
  const config = readServerConfig(ns)[0];
  const choice = await ns.prompt("Select a server option", { type: "select", choices: ["stop scripts"] });

  if(choice.toString() === "stop scripts") {
    ns.tprint("killing scripts on " + server)
    ns.killall(server);

    if(config.growServers.includes(server)) {
      config.growServers.splice(config.growServers.indexOf(server), 1);
    } else if(config.hackServers.includes(server)) {
      config.hackServers.splice(config.hackServers.indexOf(server), 1); 
    } else if(config.weakenServers.includes(server)) {
      config.weakenServers.splice(config.weakenServers.indexOf(server), 1); 
    }
    writeServerConfig(ns, config);
  }
}

function updateGlobalNumThreads(numThreads: number, scriptName: string): void {
  if (scriptName === "/utils/hack.js") {
    numHackThreads += numThreads;
  } else if (scriptName === "/utils/weaken.js") {
    numWeakenThreads += numThreads;
  } else if (scriptName === "/utils/grow.js") {
    numGrowThreads += numThreads;
  }
}

