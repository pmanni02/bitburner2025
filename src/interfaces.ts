/**Current hack setup for a single target */ 
export interface LoopHackConfig {
  targetServer: string,
  hackServers: string[],
  weakenServers: string[],
  growServers: string[],
  isAutomated?: boolean
}

/**Represents all the files for a single server */
export interface ServerFile {
  hostname: string,
  files: string[],
}

export interface MonitorDetails {
  organizationName: string,
  availableFunds: string,
  fundedPercent: string,
  hackedPercent: string,
  hackLevel: string,
  growthEmoji: number,
  serverGrowth: number | undefined,
  hackTime: string,
  growTime: string,
  weakenTime: string
}