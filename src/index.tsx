import { NS } from "@ns";
import React, { ReactDOM } from '/lib/react'
import { App } from "./App";

export async function main(ns: NS) {
  const overviewHook0 = document.getElementById('overview-extra-hook-0');
  // const overviewHook1 = document.getElementById('overview-extra-hook-1');
  // const overviewHook2 = document.getElementById('overview-extra-hook-2');

  ReactDOM.render(
    <React.StrictMode>
      <App ns={ns} />
    </React.StrictMode>,
    overviewHook0
  );

  if (overviewHook0) {
    ns.atExit(() => {
      ReactDOM.unmountComponentAtNode(overviewHook0);
    });
  }

  return new Promise(() => { ns.tprint('') });
}
