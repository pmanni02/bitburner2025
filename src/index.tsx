import { NS } from "@ns";
import React, { ReactDOM } from '/lib/react'
import { App } from "./App";

export async function main(ns: NS) {
  const overviewHook0 = document.getElementById('overview-extra-hook-0');
  // const overviewHook1 = document.getElementById('overview-extra-hook-1');
  // const overviewHook2 = document.getElementById('overview-extra-hook-2');

  // ns.atExit(() => {
  //   if(overviewHook0) {
  //     overviewHook0.innerHTML = ''
  //   }

  //   if(overviewHook1) {
  //     overviewHook1.innerHTML = ''
  //   }

  //   if(overviewHook2) {
  //     overviewHook2.innerHTML = ''
  //   }
  // })

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
