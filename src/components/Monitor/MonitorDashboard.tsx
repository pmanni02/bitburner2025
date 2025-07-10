import { NS } from "@ns";
import { getMonitorDetails } from "./main";
import { MonitorDetails } from "/interfaces";
import React from '/lib/react'

export function MonitorDashboard({ ns, monitorDetails }: {
  ns: NS,
  monitorDetails: MonitorDetails
}) {
  const [details, setDetails] = React.useState(monitorDetails);

  const {
    organizationName,
    serverName,
    availableFunds,
    fundedPercent,
    hackLevel,
    hackedPercent,
    growthEmoji,
    hackTime,
    growTime,
    weakenTime,
    serverGrowth
  } = details;

  function updateConfig() {
    const updatedDetails = getMonitorDetails(ns, serverName)
    setDetails(updatedDetails);
  }
  
  React.useEffect(() => {
    const interval = setInterval(updateConfig, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <meta charSet="utf-8"></meta>
      <body>
        <p>{organizationName} (🌱{serverGrowth} {String.fromCodePoint(growthEmoji)})</p>

        <p>  💰 {availableFunds}, {fundedPercent} | 🧑‍💻 {hackLevel}, {hackedPercent}</p>
        <p>  💻: {hackTime} secs | 📈: {growTime} secs | 📉: {weakenTime} secs</p>
      </body>
    </div>
  );
}
