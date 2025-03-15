import { NS } from "@ns";
import { getServersReadyToUseForHacking, readServerConfig } from "../helpers";
import { LoopHackConfig } from "../interfaces/global";
import { BASIC_SCRIPT_RAM_SIZE, RAM_CHOICES, TARGET_SERVER } from "/globals";

/*eslint no-constant-condition: */

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

let numHackThreads = 0;
let numWeakenThreads = 0;
let numGrowThreads = 0;

/**
 * Main fn - deploys initial scripts and opens UI
 * @param ns - Netscript
 */
export async function main(ns: NS): Promise<void> {
  const args = ns.args;
  ns.tprint("args: " + args)
  const config: LoopHackConfig = readServerConfig(ns);
  if (args && args[0] === "init") {
    config.growServers = ["n00dles", "foodnstuff", "sigma-cosmetics", "hong-fang-tea"];
    config.hackServers = [];
    config.weakenServers = ["joesguns", "harakiri-sushi"];
    saveCurrentServers(ns, config);
  }

  ns.disableLog("ALL");

  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(TARGET_SERVER);
  }
  ns.nuke(TARGET_SERVER);

  await deployInitialScript(ns, "/basicFns/hack.js", config.hackServers);
  await deployInitialScript(ns, "/basicFns/grow.js", config.growServers);
  await deployInitialScript(ns, "/basicFns/weaken.js", config.weakenServers);

  // OPEN UI FOR MONITORING TARGET SERVE
  if (!ns.getRunningScript("/ui/monitorUI.js", "home")) {
    ns.exec("/ui/monitorUI.js", "home", undefined, TARGET_SERVER);
  }

  // OPEN UI TO LIST SEVERS & MANUALLY BALANCE SCRIPTS
  await openHackUI(ns);
}

/**
 * Deploy initial script
 * @param ns - Netscript
 * @param script - script to deploy
 * @param initialServers - list of servers to deploy script to
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
    ns.exec(script, curServ, numThreads, TARGET_SERVER);
    updateGlobalNumThreads(numThreads, script)
    await ns.sleep(Math.random() * 500);
  }
}

function replaceScript(ns: NS, scriptToKill: string, scriptToStart: string) {
  const config: LoopHackConfig = readServerConfig(ns);

  let serverName;
  if (scriptToKill === "/basicFns/grow.js") {
    serverName = config.growServers.pop();
  } else if (scriptToKill === "/basicFns/hack.js") {
    if (config.hackServers.length) {
      serverName = config.hackServers.pop()
    } else {
      serverName = config.weakenServers.pop()
    }
  } else if (scriptToKill === "/basicFns/weaken.js") {
    serverName = config.weakenServers.pop()
  }
  saveCurrentServers(ns, config)

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

    const config: LoopHackConfig = readServerConfig(ns);

    if (scriptToStart === "/basicFns/hack.js") {
      config["hackServers"].unshift(serverName);
    } else if (scriptToStart === "/basicFns/grow.js") {
      config["growServers"].unshift(serverName);
    } else if (scriptToStart === "/basicFns/weaken.js") {
      config["weakenServers"].unshift(serverName);
    }
    saveCurrentServers(ns, config);
    updateGlobalNumThreads(numThreads, scriptToStart)
  }
}

async function openHackUI(ns: NS) {
  ns.ui.openTail();
  ns.ui.resizeTail(360, 355);
  while (ns.scriptRunning("/ui/loopHackUI.js", "home")) {
    ns.clearLog();
    const config: LoopHackConfig = readServerConfig(ns);
    ns.printRaw(getHTML(ns, config));
    await ns.asleep(500);
  }
}

function getHTML(ns: NS, config: LoopHackConfig) {
  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>
        <div id="hack-div">
          <h3>Hack Servers: {[numHackThreads]}</h3>
          {addButton("Add Hack", "addHack", () => replaceScript(ns, "/basicFns/grow.js", "/basicFns/hack.js"))}
          {makeList(config.hackServers)}
        </div>

        <div id="grow-div">
          <h3>Grow Servers: {[numGrowThreads]}</h3>
          {addButton("Add Grow", "addGrow", () => replaceScript(ns, "/basicFns/hack.js", "/basicFns/grow.js"))}
          {makeList(config.growServers)}
        </div>

        <div id="weaken-div">
          <h3>Weaken Servers: {[numWeakenThreads]}</h3>
          {addButton("Add Weaken", "addWeaken", () => replaceScript(ns, "/basicFns/grow.js", "/basicFns/weaken.js"))}
          {addButton("Remove Weaken", "removeWeaken", () => replaceScript(ns, "/basicFns/weaken.js", "/basicFns/grow.js"))}
          {makeList(config.weakenServers)}
        </div>

        <br></br>

        {addButton("Buy Server", "buyServer", () => buyNewServer(ns))}
        {addButton("Upgrade Server", "upgradeServer", () => upgradePurchasedServer(ns))}

        <br></br>
        {addButton("Add Server", "addServer", () => addNewServer(ns))}
        {addButton("Save Servers", "saveServers", () => saveCurrentServers(ns, config))}
      </body>
    </html>
  )
}

async function buyNewServer(ns: NS) {
  ns.toast("buying server...");
  const config: LoopHackConfig = readServerConfig(ns);

  const serverSize = await ns.prompt("Please select the server size", {
    type: "select",
    choices: RAM_CHOICES
  });

  const ram = Number.parseInt(serverSize.toString()) ? Number.parseInt(serverSize.toString()) : 8;
  const purchasedServers = ns.getPurchasedServers();
  const canPurchase = ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram);
  if (purchasedServers.length < ns.getPurchasedServerLimit() && canPurchase) {
    const serverNum = purchasedServers.length ? purchasedServers.length : 0;
    const newServer = ns.purchaseServer('serv-' + ram + '-' + serverNum, ram);
    const numThreads = Math.floor(ram / BASIC_SCRIPT_RAM_SIZE);

    ns.scp("/basicFns/grow.js", newServer);
    ns.exec("/basicFns/grow.js", newServer, numThreads - 1, TARGET_SERVER);
    updateGlobalNumThreads(numThreads - 1, "/basicFns/grow.js")
    ns.tprint("deployed new server: " + newServer + " with grow script");

    config.growServers.unshift(newServer);
    saveCurrentServers(ns, config)
  } else {
    ns.toast("at purchased server limit or not enough funds")
  }
  ns.tprint("bought server costing: " + ns.getPurchasedServerCost(ram))
}

function addNewServer(ns: NS) {
  ns.toast("adding server...");
  const config: LoopHackConfig = readServerConfig(ns);

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

    ns.scp("/basicFns/grow.js", newServer.hostname);
    ns.exec("/basicFns/grow.js", newServer.hostname, numThreads - 1, TARGET_SERVER);
    updateGlobalNumThreads(numThreads, "/basicFns/grow.js")

    ns.tprint("deployed new server: " + newServer.hostname + " with grow script");
    config.growServers.unshift(newServer.hostname);
    saveCurrentServers(ns, config);
  }
}

function saveCurrentServers(ns: NS, config: LoopHackConfig) {
  ns.toast("Saving current servers...");
  ns.write("loopHackConfig.json", JSON.stringify(config), "w");
}

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

    const config: LoopHackConfig = readServerConfig(ns);

    const isHackScript = config.hackServers.includes(serverInput.toString());
    const isWeakenScript = config.weakenServers.includes(serverInput.toString());
    const isGrowScript = config.growServers.includes(serverInput.toString());

    if (isHackScript) {
      const index = config.hackServers.findIndex((s) => s === serverInput.toString());
      config.hackServers.splice(index, 1);
      config.hackServers.push(newName);
    } else if (isWeakenScript) {
      const index = config.weakenServers.findIndex((s) => s === serverInput.toString());
      config.weakenServers.splice(index, 1);
      config.weakenServers.push(newName);
    } else if (isGrowScript) {
      const index = config.growServers.findIndex((s) => s === serverInput.toString());
      config.growServers.splice(index, 1);
      config.growServers.push(newName);
    }
    saveCurrentServers(ns, config);
  } else {
    ns.toast("something went wrong with server upgrade");
  }

  // TODO: add more threads of whatever scripts is current running
}

function addButton(buttonName: string, buttonId: string, onClickFn: () => void) {
  return (
    <button id={buttonId} onClick={onClickFn}>
      {buttonName}
    </button>
  );
}

function makeList(array: string[]) {
  const listItems = array.map((item) => (
    <p key={item}> {item}</p>
  ));
  return listItems;
}

function updateGlobalNumThreads(numThreads: number, scriptName: string): void {
  if (scriptName === "/basicFns/hack.js") {
    numHackThreads += numThreads;
  } else if (scriptName === "/basicFns/weaken.js") {
    numWeakenThreads += numThreads;
  } else if (scriptName === "/basicFns/grow.js") {
    numGrowThreads += numThreads;
  }
}

