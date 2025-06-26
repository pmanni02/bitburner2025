import { MonitorDetails } from "/interfaces";
import React from '/lib/react'

export function MonitorDashboard({ monitorDetails }: {
  monitorDetails: MonitorDetails
}) {
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
