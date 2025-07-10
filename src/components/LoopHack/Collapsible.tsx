import { NS } from "@ns";
import React from '/lib/react';
import { LoopHackConfig } from "/interfaces";
import { List } from "./List";

const styles = {
  serverList: {
    display: 'flex',
    'flex-direction': 'column',
  },
  type: {
    display: 'flex',
    'justify-content': 'center',
  },
}

export function Collapsible(
  { ns, label, config, servers }: 
  { ns: NS, label: string; config: LoopHackConfig, servers: string[] }
) {
  const [open, setOpen] = React.useState(false);
  const toggle = () => {
    setOpen(!open)
  }
  return (
    <div>
      <p onClick={toggle} style={styles.type} className="collapsible">{label}</p>
      {
        open &&
        (<div style={styles.serverList}>
          <List ns={ns} config={config} serverNames={servers} />
        </div>)
      }
    </div>

  )
}