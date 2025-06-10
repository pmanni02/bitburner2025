import { NS, Server } from "@ns";
import { LoopHackConfig, ServerFile } from "../interfaces";
import { BASIC_SCRIPT_RAM_SIZE, growScriptPath, hackScriptPath, weakenScriptPath } from "/constants";

/**
 * @param ns @param {AutocompleteData} data
 */
export function autocomplete() {
  return ["scanServers", "readServerList", "canHack", "killScripts", "listFiles", "printCodingContracts"]
}

export async function main(ns: NS): Promise<void> {
  const args = ns.args;
  const arg = args.length > 0 ? args[0] : "";

  if (arg === "scanServers") {
    scanServers(ns);
  } else if (arg === "readServerList") {
    importServerList(ns);
  }
  // else if (arg === "canHack") {
  //   getServersReadyToUseForHacking(ns);
  // } 
  else if (arg === "killScripts") {
    killRunningScripts(ns);
  } else if (arg === "listFiles") {
    listServerFiles(ns);
  } else if (arg === "printCodingContracts") {
    await printCodingContracts(ns);
  }
}

/**
 * Export either server details OR server file details to new file or overwrite existing data
 * @param ns Netscript
 * @param data {Server[] | ServerFile[]}
 * @param filename Filename of exported data
 */
function exportToFile(ns: NS, data: Server[] | ServerFile[], filename: string): void {
  const serverArrayString = "[" + data.map((s) => JSON.stringify(s)).toString() + "]";
  ns.write(filename, serverArrayString, "w");
}

/**
 * Get list of server info. Save to serverList.json
 * @param ns Netscript
 */
function scanServers(ns: NS): void {
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
 * Gets list of files on all available servers. 
 * Exports to serverFiles.json
 * @param ns Netscript
 */
function listServerFiles(ns: NS) {
  scanServers(ns);
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


/**
 * Reads serverList.json and parses to JSON
 * @param ns Netscript
 * @returns Array of Server objects
 */
export function importServerList(ns: NS): Server[] | null {
  const serverArrayString = ns.read("serverList.json");
  return serverArrayString ? JSON.parse(serverArrayString) : null;
}

/**
 * Get number of executables available
 * @param ns 
 * @returns Number of .exe files on home computer
 */
function getPortHackLevel(ns: NS) {
  const hackFiles = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  return hackFiles.filter((file) => ns.fileExists(file, "home")).length;
}

/**
 * Gets list of Server objects where:
 * - max ram >= 16 GB
 * - current hack level > required hack level
 * - the server is NOT the home server
 * @param ns Netscript
 * @param scanFirst Boolean - get available servers first
 * @returns Array of Servers
 */
export function getServersReadyToUseForHacking(ns: NS, scanFirst?: boolean): Server[] {
  if (scanFirst) { scanServers(ns) }
  const list = importServerList(ns);
  const currentHackLevel = ns.getHackingLevel();
  const portHackLevel = getPortHackLevel(ns);

  let canHack: Server[] = [];

  if (list) {
    canHack = list.filter((server) => {
      if (server.requiredHackingSkill && server.numOpenPortsRequired) {
        return (currentHackLevel >= server.requiredHackingSkill &&
          server.numOpenPortsRequired <= portHackLevel &&
          server.maxRam >= 16 && server.hostname !== "home")
          || server.purchasedByPlayer && server.hostname !== "home";
      }
      return;
    })
  }

  return canHack;
}

export function getAlternativeTargetServers(ns: NS): Server[] {
  scanServers(ns)
  const list = importServerList(ns);
  const currentHackLevel = ns.getHackingLevel();
  const portHackLevel = getPortHackLevel(ns);

  let canHack: Server[] = [];

  if (list) {
    canHack = list.filter((server) => {
      if (server.requiredHackingSkill && server.numOpenPortsRequired) {
        return (
          currentHackLevel >= server.requiredHackingSkill &&
          server.numOpenPortsRequired <= portHackLevel &&
          !server.purchasedByPlayer
        )
      }
      return;
    })
  }

  return canHack;
}

/**
 * Opens all available ports and "nukes" server
 * @param ns Netscript
 * @param hostname hostname of server
 */
export function nukeServer(ns: NS, hostname: string) {
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(hostname);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(hostname);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(hostname);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.httpworm(hostname);
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(hostname);
  }
  ns.nuke(hostname);
}

/**
 * Kills all grow/weaken/hack scripts on available servers
 * @param ns Netscript
 * @returns List of servers that had scripts running
 */
export function killRunningScripts(ns: NS): Server[] {
  ns.disableLog("ALL");
  ns.toast('killing scripts for...')

  scanServers(ns);
  const list = importServerList(ns);

  let hasScriptsRunning: Server[] = [];
  const scripts = [
    growScriptPath,
    weakenScriptPath,
    hackScriptPath
  ];
  if (list) {
    hasScriptsRunning = list.filter((server) => {
      const hasAScriptRunning = scripts.filter((s) => ns.scriptRunning(s, server.hostname))
      return server.hostname && hasAScriptRunning.length > 0
    });
  }

  for (const i in hasScriptsRunning) {
    // ns.tprint("killing scripts on " + hasScriptsRunning[i].hostname) 
    ns.killall(hasScriptsRunning[i].hostname);
  }

  return hasScriptsRunning;
}

/**
 * Print list of available coding contracts
 * @param ns 
 */
async function printCodingContracts(ns: NS) {
  listServerFiles(ns);
  const serverFilesString = ns.read("serverFiles.json");
  const serverFiles = serverFilesString ? JSON.parse(serverFilesString) : undefined;

  // Optional filter for specific contract
  const contractNameFilter = await ns.prompt("Which contract?", {
    "type": "text",
  }).then((input) => input.toString())

  if (serverFiles) {
    serverFiles.forEach((server: ServerFile) => {
      const codingContracts = server.files.filter((file) => {
        return file.includes('contract-')
      });
      if (codingContracts.length > 0) { ns.tprint(server.hostname) }
      codingContracts.forEach((contract) => {
        const codingContractDetails = ns.codingcontract.getContract(contract, server.hostname);
        if (contractNameFilter && codingContractDetails.type === contractNameFilter) {
          ns.tprint(" -", codingContractDetails.type);
        }
        if (!contractNameFilter) {
          ns.tprint(" -", codingContractDetails.type)
        }
      });
    });
  }
}

/**
 * readServerList from loopHackConfig.json
 * @param ns 
 * @returns LoopHackConfig
 */
export function readServerConfig(ns: NS): LoopHackConfig[] {
  const data = ns.read("loopHackConfig.json");
  return data ? JSON.parse(data) : []
}

/**
 * Overwrites loopHackConfig.json file with updated config
 * @param ns Netscript
 * @param config LoopHackConfig
 */
export function writeServerConfig(ns: NS, config: LoopHackConfig) {
  ns.toast("Saving current servers...");
  ns.write("loopHackConfig.json", "[" + JSON.stringify(config) + "]", "w");
}

export function getNumThreads(ns: NS, serverName: string): number {
  const { maxRam, ramUsed } = ns.getServer(serverName);
  return Math.floor((maxRam - ramUsed) / BASIC_SCRIPT_RAM_SIZE);
}

export function copyAndExecScript(ns: NS, serverName: string, targetServerName: string, scriptName: string, skipNukeServer?: boolean) {
  const numThreads = getNumThreads(ns, serverName)
  if (!skipNukeServer) {
    nukeServer(ns, targetServerName);
  }


  ns.scp(scriptName, serverName);
  ns.exec(scriptName, serverName, numThreads - 1, targetServerName); // numThreads - 1 just to be safe
}