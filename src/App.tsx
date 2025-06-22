import { NS } from "@ns";
import React from "/lib/react";
import { killRunningScripts } from "./utils/helpers";
import { toggleAutomation } from "./utils/servers";

export function App({ ns }: { ns: NS }): React.JSX.Element {
  const [automate, setAutomate] = React.useState(false);

  return (
    <div>
      <button onClick={() => ns.exec("/components/LoopHack/main.js", "home")}>
        Launch
      </button>
      <button onClick={() => ns.exec("/components/LoopHack/main.js", "home", 1, 'init')}>
        Init
      </button>
      <br></br>
      <button onClick={() => killRunningScripts(ns)}>
        Kill Scripts
      </button>
      <br></br>
      <button
        style={{ backgroundColor: automate ? 'green' : 'red' }}
        onClick={() => {
          toggleAutomation(ns);
          setAutomate(!automate);
        }}
      >
        Automate
      </button>
    </div>
  );
}
