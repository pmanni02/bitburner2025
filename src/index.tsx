import { NS } from "@ns";
import React, { ReactDOM } from '/lib/react'
import { App } from "./App";

export async function main(ns: NS) {
  const overviewHook0 = document.getElementById('overview-extra-hook-0')

  ReactDOM.render(
    <React.StrictMode>
      <App ns={ns} />
    </React.StrictMode>,
    overviewHook0
  );

  while (ns.scriptRunning("/index.js", "home")) {
    await ns.asleep(1000)
  }
}
