import { NS } from "@ns";
import { LoopHackConfig } from "/interfaces";
import { List } from "./List";

const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

type Props = {
  ns: NS,
  summary: string,
  serverNames: string[],
  config: LoopHackConfig
}

export function ServerDetails({ ns, summary, config, serverNames }: Props) {
  return (
    <details open>
      <summary>{summary}</summary>
      <List ns={ns} config={config} serverNames={serverNames} />
    </details>
  )
}