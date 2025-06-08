import { NS } from "@ns";
import { LoopHackConfig } from "/interfaces";
import { serverPrompt } from "/utils/servers";

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

type Props = {
  ns: NS,
  config: LoopHackConfig,
  serverNames: string[]
}

export function List({ ns, config, serverNames }: Props) {
  return (
    serverNames.map((serverName: string) => (
      <p key={serverName} onClick={() => serverPrompt(ns, serverName, config)}> {serverName}</p>
    ))
  )
}