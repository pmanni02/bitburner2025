import { NS } from "@ns";

// accessing global window or document in bitburner costs 25GB each normally. 
// this saves RAM for early UI convenience, sorry devs pls don't fix.
const myWindow = eval("window") as Window & typeof globalThis;
// const myDocument = eval("document") as Document & typeof globalThis;

//  bitburner devs included React and ReactDOM in global window object!
const React = myWindow.React;
// const ReactDOM = myWindow.ReactDOM;

let RATE_OF_CHANGE = 0;
let LAST_SERVER_AMOUNT = 1;

/*eslint no-constant-condition: */
export async function main(ns: NS, targetServer: string | undefined) {
  ns.disableLog("ALL");
  const servArg = ns.args[0];
  let serv = "";

  if (servArg || targetServer) {
    serv = targetServer ? targetServer : servArg.toString();
  } else {
    ns.tprint("provide server name argument");
  }

  ns.ui.openTail();
  ns.ui.resizeTail(380, 130);
  ns.ui.setTailTitle(serv + " monitor");
  ns.ui.setTailFontSize(10)

  while (true) {
    const {
      moneyAvailable,
      moneyMax,
      hackDifficulty,
      minDifficulty,
      organizationName, serverGrowth
    } = ns.getServer(serv);

    // time in seconds
    const hackTime = ns.formatNumber(ns.getHackTime(serv) / 1000, 2);
    const growTime = ns.formatNumber(ns.getGrowTime(serv) / 1000, 2);
    const weakenTime = ns.formatNumber(ns.getWeakenTime(serv) / 1000, 2);

    ns.clearLog();

    if (moneyAvailable && minDifficulty && hackDifficulty && moneyMax) {
      const availableFunds = ns.formatNumber(moneyAvailable, 2);
      const fundedPercent = ns.formatPercent((moneyAvailable / moneyMax));
      const hackedPercent = ns.formatPercent((minDifficulty / hackDifficulty));
      const hackLevel = ns.formatNumber(hackDifficulty, 2);
      const growthEmoji = getRateOfChange(ns, serv);

      ns.printRaw(
        <html>
          <head>
            <meta charSet="utf-8"></meta>
          </head>

          <body>
            <p>{organizationName} (🌱{serverGrowth} {String.fromCodePoint(growthEmoji)})</p> 
            
            <p>  💰 {availableFunds}, {fundedPercent} | 🧑‍💻 {hackLevel}, {hackedPercent}</p>
            <p>  💻: {hackTime} secs | 📈: {growTime} secs | 📉: {weakenTime} secs</p>
          </body>
        </html>
      );
    }

    await ns.asleep(1000);
  }
}

function getRateOfChange(ns: NS, serverName: string) {
  const currentAmount = ns.getServer(serverName).moneyAvailable;

  if(currentAmount) {
    RATE_OF_CHANGE = LAST_SERVER_AMOUNT - currentAmount;
    LAST_SERVER_AMOUNT = currentAmount;
  }
  
  if(RATE_OF_CHANGE === 0) {
    return 8594 // →
  } else if(RATE_OF_CHANGE > 0) {
    return 8600 // ↘
  } else if(RATE_OF_CHANGE < 0) {
    return 8599 // ↗
  }
  return 8596 //↔
}
