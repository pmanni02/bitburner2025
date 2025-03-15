// Total Ways to Sum
// You are attempting to solve a Coding Contract. 
// You have 10 tries remaining, after which the contract will self-destruct.

// It is possible write four as a sum in exactly four different ways:

//     3 + 1
//     2 + 2
//     2 + 1 + 1
//     1 + 1 + 1 + 1

// How many different distinct ways can the number 46 be written as a 
// sum of at least two positive integers?
// If your solution is an empty string, you must leave the text box empty. 
// Do not use "", '', or ``.
import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // 5

  // 4 + 1
  // 3 + 2
  // 3 + 1 + 1
  // 2 + 1 + 1 + 1
  // 1 + 1 + 1 + 1 + 1
  
  // [1,1,1,1,1]
  // [2,  1,1,1]
  // [2,    2,1]
  // [2,      3]
  // [3,    1,1]
  // [3,      2]
  // [4,1]

  const num = 4
  const initialArray = new Array(num).fill(1);
  ns.tprint(initialArray);

  const i = 0;
  const newArray = sumIntegersInArray(initialArray, i)
  ns.tprint("newArray ", newArray)
}

function sumIntegersInArray(arr: number[], startIndex: number) {
  let newArray: number[] = []
  if(startIndex < arr.length) {
    newArray = [...arr.slice(0, startIndex), arr[startIndex] + arr[startIndex+1], ...arr.slice(startIndex+2)]
  }
  return newArray
}
