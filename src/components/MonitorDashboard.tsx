import { MonitorDetails } from "/interfaces";
const myWindow = eval("window") as Window & typeof globalThis;
const React = myWindow.React;

type Props = {
  monitorDetails: MonitorDetails
}

export function MonitorDashboard({ monitorDetails }: Props) {
  const {
    organizationName,
    availableFunds,
    fundedPercent,
    hackLevel,
    hackedPercent,
    growthEmoji,
    hackTime,
    growTime,
    weakenTime,
    serverGrowth
  } = monitorDetails;

  return (
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