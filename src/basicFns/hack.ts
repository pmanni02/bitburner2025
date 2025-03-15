/*eslint no-constant-condition: */
import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const server = ns.args[0].toString();
  while(true) {
    await ns.hack(server);
  }
}