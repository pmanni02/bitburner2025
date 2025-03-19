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
  // starting at first element, iterate through input array
  //  if element i+1 is 0, determine if you can jump past
  //    if possible to jump past 0, skip 0,
  //    else, stop before the 0
  // const input = [7,8,4,5,10,0,6,5,0,2,10,5,7]; 
  // const input = [7,8,4,5,10,0,6,5,0,0,0,5,7];
  // const input = [7,8,4,5,10,0,6,5,0,0,0,0,0];
  const input = [1,3,4,0,1,5,0,6,0,0,2, 0, 7, 9, 3, 0, 0, 0, 0, 9, 3, 10, 0, 0, 4]
  //             0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24
  
  let steps = input[0];
  let i = 0;
  while(steps > 0 && i < input.length && i >= 0) {
    ns.tprint("i: ", i);
    ns.tprint("steps left: ", steps);
    steps--;
    
    await ns.sleep(1000);

    if(input[i+1] === 0) {
      steps = input[i] - 1;

      // finds next element after i that is not a zero
      // TODO: change to find largest number between zeros ie if you encounter a zero
      //  look at elements after that index up to the index of the next zero.
      //  we want the rightmost element with the largest value ideally
      const nextOpenIndex = input.findIndex((val, index)=> {
        return val !== 0 && index > i + 1
      });
      ns.tprint("nextOpenIndex: ", nextOpenIndex);

      if(nextOpenIndex !== i + 2) {
        i = nextOpenIndex;
        steps = input[i];
        ns.tprint("jumped")
      } else {
        steps = input[i];
        i++;
      }
    } else if(steps === 0) { // if there are no more steps, use current jump value
      steps = input[i];
      i++
    } else {
      i++;
    }
  }
  ns.tprint("ending i: ", i);

  if(i >= input.length - 1) {
    ns.tprint("1");
  } else {
    ns.tprint("0")
  }
}

// ATTEMPTS
// 1. [7,8,4,5,10,0,6,5,0,2,10,5,7] -> 1 - CORRECT
// 2. [1,3,4,0,1,5,0,6,0,0,2,0,7,9,3,0,0,0,0,9,3,10,0,0,4] -> 1 CORRECT