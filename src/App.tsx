import { NS } from "@ns";
import React from "/lib/react";
import { killRunningScripts } from "./utils/helpers";

export function App({ ns }: { ns: NS }) {
  return (
    <div>
      <button onClick={() => ns.exec("/components/LoopHack/main.js", "home")}>
        Launch Loop Hack
      </button>
      <br></br>
      <button onClick={() => killRunningScripts(ns)}>
        Kill Scripts
      </button>
    </div>
  );
}
