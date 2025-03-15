import { NS } from "@ns";
import { getServersReadyToUseForHacking, readServerConfig } from "../helpers";
import { LoopHackConfig } from "../interfaces/global";

/*eslint no-constant-condition: */

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

const RAM_CHOICES = ["8", "16", "32", "64", "128"];

const targetServer = "silver-helix";
let initialHackServers: string[] = [];
let initialGrowServers: string[] = ["n00dles", "foodnstuff", "sigma-cosmetics", "hong-fang-tea"];
let initialWeakenServers: string[] = ["joesguns", "harakiri-sushi"];

let numHackThreads = 0;
let numWeakenThreads = 0;
let numGrowThreads = 0;

const scriptRAMSize = 1.7; // each script (grow, weaken, hack) is 1.7GB RAM

/**
 * Main fn - deploys initial scripts and opens UI
 * @param ns - Netscript
 */
export async function main(ns: NS): Promise<void> {
  const args = ns.args;
  ns.tprint("args: "+ args)
  if (args && args[0] === "fromConfig") {
    const data = readServerConfig(ns);
    ns.tprint(data)
    initialGrowServers = data["growServers"];
    initialHackServers = data["hackServers"];
    initialWeakenServers = data["weakenServers"];
  }

  ns.disableLog("ALL"); 

  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(targetServer);
  }
  ns.nuke(targetServer);

  await deployInitialScript(ns, "/basicFns/hack.js", initialHackServers);
  await deployInitialScript(ns, "/basicFns/grow.js", initialGrowServers);
  await deployInitialScript(ns, "/basicFns/weaken.js", initialWeakenServers);

  // OPEN UI FOR MONITORING TARGET SERVE
  if (!ns.getRunningScript("/ui/monitorUI.js", "home")) {
    ns.exec("/ui/monitorUI.js", "home", undefined, targetServer);
  }

  // OPEN UI TO LIST SEVERS & MANUALLY BALANCE SCRIPTS
  await openHackUI(ns)
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
    const numThreads = Math.floor((maxRam - ramUsed) / scriptRAMSize);

    if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(curServ);
    }
    ns.nuke(curServ);
    ns.scp(script, curServ);
    ns.exec(script, curServ, numThreads, targetServer);
    updateGlobalNumThreads(numThreads, script)
    // ns.print("deployed " + script + " " + curServ)
    await ns.sleep(Math.random() * 1000)
  }
}

function replaceScript(ns: NS, serverName: string | undefined, scriptToKill: string, scriptToStart: string) {
  ns.toast("redeploying from " + scriptToKill + " to " + scriptToStart);
  if (serverName) {
    if (ns.killall(serverName)) {
      ns.rm(scriptToKill, serverName);
    }
    const { maxRam, ramUsed } = ns.getServer(serverName);
    // ns.print("maxRam: ", maxRam, " ramUsed: ", ramUsed);
    const numThreads = Math.floor((maxRam - ramUsed) / scriptRAMSize);

    ns.scp(scriptToStart, serverName)
    ns.exec(scriptToStart, serverName, numThreads, targetServer)
    // ns.print("redeployed from " + scriptToKill + " to " + scriptToStart)

    updateGlobalNumThreads(-numThreads, scriptToKill)

    if (scriptToStart === "/basicFns/hack.js") {
      initialHackServers.unshift(serverName);
    } else if (scriptToStart === "/basicFns/grow.js") {
      initialGrowServers.unshift(serverName);
    } else if (scriptToStart === "/basicFns/weaken.js") {
      initialWeakenServers.unshift(serverName);
    }
    updateGlobalNumThreads(numThreads, scriptToStart)
  }
}

async function openHackUI(ns: NS) {
  ns.ui.openTail();
  ns.ui.resizeTail(360, 355);
  while (ns.scriptRunning("/ui/loopHackUI.js", "home")) {
    ns.clearLog();
    ns.printRaw(getHTML(ns, initialHackServers, initialGrowServers, initialWeakenServers));
    await ns.asleep(1000);
  }
}

function getHTML(ns: NS, hackServers: string[], growServers: string[], weakenServers: string[]) {
  return (
    <html>
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body>
        <div id="hack-div">
          <h3>Hack Servers: {[numHackThreads]}</h3>
          {addButton("Add Hack", "addHack", () => replaceScript(ns, initialGrowServers.pop(), "/basicFns/grow.js", "/basicFns/hack.js"))}
          {makeList(hackServers)}
        </div>

        <div id="grow-div">
          <h3>Grow Servers: {[numGrowThreads]}</h3>
          {addButton("Add Grow", "addGrow", () => replaceScript(ns, initialHackServers.length ? initialHackServers.pop() : initialWeakenServers.pop(), "/basicFns/hack.js", "/basicFns/grow.js"))}
          {makeList(growServers)}
        </div>

        <div id="weaken-div">
          <h3>Weaken Servers: {[numWeakenThreads]}</h3>
          {addButton("Add Weaken", "addWeaken", () => replaceScript(ns, initialGrowServers.pop(), "/basicFns/grow.js", "/basicFns/weaken.js"))}
          {addButton("Remove Weaken", "removeWeaken", () => replaceScript(ns, initialWeakenServers.pop(), "/basicFns/weaken.js", "/basicFns/grow.js"))}
          {makeList(weakenServers)}
        </div>

        <br></br>

        {addButton("Buy Server", "buyServer", () => buyNewServer(ns))}
        {addButton("Upgrade Server", "upgradeServer", () => upgradePurchasedServer(ns))}

        <br></br>
        {addButton("Add Server", "addServer", () => addNewServer(ns))}
        {addButton("Save Servers", "saveServers", () => saveCurrentServers(ns))}
      </body>
    </html>
  )
}

async function buyNewServer(ns: NS) {
  ns.toast("buying server...");

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
    const numThreads = Math.floor(ram / scriptRAMSize);

    ns.scp("/basicFns/grow.js", newServer);
    ns.exec("/basicFns/grow.js", newServer, numThreads, targetServer);
    updateGlobalNumThreads(numThreads, "/basicFns/grow.js")
    ns.tprint("deployed new server: " + newServer + " with grow script");
    initialGrowServers.unshift(newServer);
  } else {
    ns.toast("at purchased server limit or not enough funds")
  }
  ns.toast("bought server costing: " + ns.getPurchasedServerCost(ram))
}

function addNewServer(ns: NS) {
  ns.toast("adding server...")

  const potentialServersToHack = getServersReadyToUseForHacking(ns, true);
  // ns.tprint(potentialServersToHack)
  const currentServers = [...initialGrowServers, ...initialHackServers, ...initialWeakenServers];

  const toBeHacked = potentialServersToHack.filter((serv) => {
    return !currentServers.includes(serv.hostname)
  });

  // ns.tprint("candidates: ", toBeHacked);
  if (!toBeHacked.length) {
    ns.tprint("NO MORE AVAILABLE SERVERS TO HACK!");
    return;
  }

  const newServer = toBeHacked.shift();
  if (newServer && newServer.hostname) {
    const numThreads = Math.floor(newServer?.maxRam / scriptRAMSize);

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
    ns.exec("/basicFns/grow.js", newServer.hostname, numThreads, targetServer);
    updateGlobalNumThreads(numThreads, "/basicFns/grow.js")
    ns.tprint("deployed new server: " + newServer.hostname + " with grow script");
    initialGrowServers.unshift(newServer.hostname);
  }
}

function saveCurrentServers(ns: NS) {
  ns.toast("Saving current servers...");

  const loopHackConfig: LoopHackConfig = {
    targetServer,
    hackServers: initialHackServers,
    weakenServers: initialWeakenServers,
    growServers: initialGrowServers
  }

  ns.write("loopHackConfig.json", JSON.stringify(loopHackConfig), "w");
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

    // refresh server lists
    // find script type
    const isHackScript = initialHackServers.includes(serverInput.toString());
    const isWeakenScript = initialWeakenServers.includes(serverInput.toString());
    const isGrowScript = initialGrowServers.includes(serverInput.toString());

    if (isHackScript) {
      const index = initialHackServers.findIndex((s) => s === serverInput.toString());
      initialHackServers.splice(index, 1);
      initialHackServers.push(newName);
    } else if(isWeakenScript) {
      const index = initialWeakenServers.findIndex((s) => s === serverInput.toString());
      initialWeakenServers.splice(index, 1);
      initialWeakenServers.push(newName);
    } else if(isGrowScript) {
      const index = initialGrowServers.findIndex((s) => s === serverInput.toString());
      initialGrowServers.splice(index, 1);
      initialGrowServers.push(newName);
    }

    saveCurrentServers(ns);
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

