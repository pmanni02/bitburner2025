/*eslint no-constant-condition: */

import { NS } from "@ns";
// accessing global window or document in bitburner costs 25GB each normally. 
// this saves RAM for early UI convenience, sorry devs pls don't fix.
const myWindow = eval("window") as Window & typeof globalThis;
const myDocument = eval("document") as Document & typeof globalThis;

//  bitburner devs included React and ReactDOM in global window object!
const React = myWindow.React;
const ReactDOM = myWindow.ReactDOM;

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.ui.openTail();
  ns.ui.resizeTail(400, 100)
  while(true) {
    ns.printRaw(
      <div>
        <h1>Hello World!</h1>
      </div>
    )
  }
}

// SOURCES:
// 1. https://github.com/oddiz/bitburner-react-ui-example/blob/master/src/ui-example/ui.tsx
// 2. https://www.reddit.com/r/Bitburner/comments/1c5h09x/tips_and_templates_for_ui_dom_documents_to_make/