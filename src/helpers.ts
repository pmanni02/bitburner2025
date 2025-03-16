import { NS, Server } from "@ns";
import { LoopHackConfig, ServerFile } from "./interfaces/global";

/**
 * @param ns @param {AutocompleteData} data
 */
export function autocomplete() {
  return ["scan", "read", "canHack", "killScripts", "listFiles", "printCodingContracts"]
}

export async function main(ns: NS): Promise<void> {
  const args = ns.args;
  const arg = args.length > 0 ? args[0] : "";

  if (arg === "scan") {
    scan(ns);
  } else if (arg === "read") {
    importServerList(ns);
  } else if (arg === "canHack") {
    getServersReadyToUseForHacking(ns);
  } else if (arg === "killScripts") {
    killRunningScripts(ns, true);
  } else if (arg === "listFiles") {
    listServerFiles(ns);
  } else if (arg === "printCodingContracts") {
    await printCodingContracts(ns);
  } 
}

function scan(ns: NS): void {
  const toVist: string[] = ["home"];
  const visted: Server[] = [];
  while (toVist.length > 0) {
    const visting = toVist.pop();
    const serverInfo = ns.getServer(visting);
    visted.push({
      ...serverInfo
    });

    const nextToVist = ns.scan(visting);
    for (let j = 0; j < nextToVist.length; j++) {
      const serverIncluded = visted.find((e) => e.hostname === nextToVist[j])

      if (!serverIncluded) {
        toVist.push(nextToVist[j]);
      }
    }
  }

  exportToFile(ns, visted, "serverList.json");
}

/**
 * Export server details to new file or overwrite existing data
 * @param ns Netscript
 * @param data {Server[] | ServerFile[]}
 * @param filename Filename of exported data
 */
function exportToFile(ns: NS, data: Server[] | ServerFile[], filename: string): void {
  const serverArrayString = "[" + data.map((s) => JSON.stringify(s)).toString() + "]";
  ns.write(filename, serverArrayString, "w");
}

/**
 * Import JSON string from file and translate to JSON
 * @param ns Netscript
 * @returns {Server[]} Array of Server objects
 */
export function importServerList(ns: NS): Server[] | null {
  const serverArrayString = ns.read("serverList.json");
  return serverArrayString ? JSON.parse(serverArrayString) : null;
}

export function getServersReadyToUseForHacking(ns: NS, isFresh?: boolean): Server[] {
  if (isFresh) { scan(ns) }
  const list = importServerList(ns);
  const currentHackLevel = ns.getHackingLevel();
  const portHackLevel = getPortHackLevel(ns);
  // ns.tprint("portHackLevel: "+ portHackLevel)

  let canHack: Server[] = [];

  if (list) {
    canHack = list.filter((server) => {
      if (server.requiredHackingSkill && server.numOpenPortsRequired) {
        return (currentHackLevel >= server.requiredHackingSkill &&
          server.numOpenPortsRequired <= portHackLevel &&
          server.maxRam >= 16) || server.purchasedByPlayer && server.hostname !== "home";
      }
      return;
    })
  }

  // ns.tprint(canHack);
  return canHack;
}

function killRunningScripts(ns: NS, isFresh?: boolean): Server[] {
  if (isFresh) { scan(ns); }
  const list = importServerList(ns);

  let hasScriptsRunning: Server[] = [];
  const scripts = ["/basicFns/grow.js", "/basicFns/weaken.js", "/basicFns/hack.js"];
  if (list) {
    hasScriptsRunning = list.filter((server) => {
      const hasAScriptRunning = scripts.filter((s) => ns.scriptRunning(s, server.hostname))
      return server.hostname && hasAScriptRunning.length > 0
    });
  }

  for (const i in hasScriptsRunning) {
    ns.tprint("killing scripts on " + hasScriptsRunning[i].hostname)
    ns.killall(hasScriptsRunning[i].hostname);
  }

  return hasScriptsRunning;
}

function getPortHackLevel(ns: NS) {
  const hackFiles = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  return hackFiles.filter((file) => ns.fileExists(file, "home")).length;
}

function listServerFiles(ns: NS, isFresh?: boolean) {
  if (isFresh) { scan(ns); }
  const list = importServerList(ns);

  const serverFilesList: ServerFile[] = [];
  if (list) {
    list.forEach((server) => {
      serverFilesList.push({
        hostname: server.hostname,
        files: ns.ls(server.hostname),
      });
    });
  }

  exportToFile(ns, serverFilesList, "serverFiles.json");
}

async function printCodingContracts(ns: NS) {
  listServerFiles(ns, true);
  const serverFilesString = ns.read("serverFiles.json");
  const serverFiles = serverFilesString ? JSON.parse(serverFilesString) : undefined;

  const contractNameFilter = await ns.prompt("Which contract?", {
    "type": "text",
  })

  if (serverFiles) {
    serverFiles.forEach((server: ServerFile) => {
      const codingContracts = server.files.filter((file) => {
        return file.includes('contract-')
      });
      if (codingContracts.length > 0) { ns.tprint(server.hostname) }
      codingContracts.forEach((contract) => {
        const codingContractDetails = ns.codingcontract.getContract(contract, server.hostname);
        if(contractNameFilter && codingContractDetails.type === contractNameFilter) {
          ns.tprint(" -", codingContractDetails.type);
        }
        if(!contractNameFilter) {
          ns.tprint(" -", codingContractDetails.type)
        }
      });
    });
  }
}

export function readServerConfig(ns: NS): LoopHackConfig[] {
  const data = ns.read("loopHackConfig.json");
  return data ? JSON.parse(data) : []
}

export function saveCurrentServers(ns: NS, config: LoopHackConfig) {
  ns.toast("Saving current servers...");
  ns.write("loopHackConfig.json", "["+JSON.stringify(config)+"]", "w");
}
