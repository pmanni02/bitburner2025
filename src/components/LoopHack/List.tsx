import { NS } from "@ns";
import { LoopHackConfig } from "/interfaces";
import { serverPrompt } from "/utils/servers";
import React from '/lib/react';

export function List({ ns, config, serverNames }: {
  ns: NS;
  config: LoopHackConfig;
  serverNames: string[];
}): React.JSX.Element[] {
  return (
    serverNames.map((serverName: string) => (
      <p key={serverName} onClick={() => serverPrompt(ns, serverName, config)}> {serverName}</p>
    ))
  )
}