/**Current hack setup for a single target */ 
export interface LoopHackConfig {
  targetServer: string,
  hackServers: string[],
  weakenServers: string[],
  growServers: string[],
}

/**Represents all the files for a single server */
export interface ServerFile {
  hostname: string,
  files: string[],
}