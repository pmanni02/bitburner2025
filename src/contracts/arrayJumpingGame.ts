// Array Jumping Game
// You are attempting to solve a Coding Contract. You have 1 try remaining, after which the 
// contract will self-destruct.

// You are given the following array of integers:

// 7,8,4,5,10,0,6,5,0,2,10,5,7

// Each element in the array represents your MAXIMUM jump length at that position. 
// This means that if you are at position i and your maximum jump length is n, you can jump 
// to any position from i to i+n.

// Assuming you are initially positioned at the start of the array, determine whether you 
// are able to reach the last index.

// Your answer should be submitted as 1 or 0, representing true and false respectively.

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // 7,8,4,5,10,0,6,5,0,2,10,5,7 -> length = 13
  // can you reach the last index?
  // avoid 0
  // iterate while looking at element ahead

  // starting at first element, iterate through input array
  //  if element i+1 is 0, determine if you can jump past
  //    if possible to jump past 0, skip 0,
  //    else, stop before the 0
  const input = [7,8,4,5,10,0,6,5,0,2,10,5,7];
  
  let steps = input[0];
  let i = 0;
  while(steps > 0 && i < input.length) {
    ns.tprint("i: ", i);
    ns.tprint("steps left: ", steps);
    steps--;
    
    await ns.sleep(1000);

    if(input[i+1] === 0) {
      steps = input[i];
      i++;
    }
    i++
  }
  ns.tprint("ending i: ", i)
}
