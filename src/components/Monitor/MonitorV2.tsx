import { MonitorDetails } from "/interfaces";
import React from '/lib/react';

export function MonitorV2({ monitorDetails }: {
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
        <h3>{organizationName} (🌱{serverGrowth} {String.fromCodePoint(growthEmoji)})</h3>
        <p>💰 {availableFunds}, {fundedPercent}</p>
        <p>🧑‍💻 {hackLevel}, {hackedPercent}</p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column"
        }}>
          <span>💻: {hackTime} secs</span>
          <span>📈: {growTime} secs</span>
          <span>📉: {weakenTime} secs</span>
        </div>

      </body>
    </div>
  );
}