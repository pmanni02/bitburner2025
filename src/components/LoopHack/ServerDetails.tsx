import { NS } from "@ns";
import { LoopHackConfig } from "/interfaces";
import { List } from "./List";
import React from '/lib/react'

export function ServerDetails({ ns, summary, config, serverNames }: {
  ns: NS,
  summary: string,
  serverNames: string[],
  config: LoopHackConfig
}) {
  return (
    <details open>
      <summary>{summary}</summary>
      <List ns={ns} config={config} serverNames={serverNames} />
    </details>
  )
}