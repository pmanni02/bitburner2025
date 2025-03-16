// Total Ways to Sum
// You are attempting to solve a Coding Contract. 
// You have 10 tries remaining, after which the contract will self-destruct.

// It is possible write four as a sum in exactly four different ways:

//     3 + 1
//     2 + 2
//     2 + 1 + 1
//     1 + 1 + 1 + 1

// 5
// 4 + 1
// 3 + 2
// 3 + 1 + 1
// 2 + 2 + 1
// 2 + 1 + 1 + 1
// 1 + 1 + 1 + 1 + 1

// How many different distinct ways can the number 46 be written as a 
// sum of at least two positive integers?
// If your solution is an empty string, you must leave the text box empty. 
// Do not use "", '', or ``.
import { NS } from "@ns";

// FIXME: seems to work but is horribly slow the larger the input
//  need to refactor before it is usable
export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL")
  // [1,1,1,1,1] 1
  // [2,  1,1,1] 2
  // [2,    2,1] 3

  // [2,  1,1,1] dup
  // [3,    1,1] 4
  // [4,      1] 5

  // [2,    2,1] dup
  // [4,      1] dup

  // [2,    2,1] dup
  // [2,      3] 6

  const num = 46;
  const initialArray = new Array(num).fill(1);

  const finalResults: number[][] = [];
  const tempResults: number[][] = [];
  tempResults.push(initialArray);

  while (tempResults.length > 0) {
    const currentArray = tempResults.shift();
    if (currentArray && currentArray.length > 1) {
      for (let i = 0; i < currentArray.length - 1; i++) {
        const newArray = sumIntegersInArray(currentArray, i);
        // ns.tprint("newArray: ", newArray);

        const sorted = newArray.sort((a, b) => a - b);

        // if the new array is NOT already in finalResults or tempResults, 
        // add to tempResults to eventually merge
        if (
          sorted.length > 1 && 
          !finalResults.find((res) => JSON.stringify(res) === JSON.stringify(sorted)) &&
          !tempResults.find((res) => JSON.stringify(res) === JSON.stringify(sorted))
        ) {
          tempResults.push(sorted);
        }
      }
      if (!finalResults.find((res) => JSON.stringify(res) === JSON.stringify(currentArray))) {
        const sorted = currentArray.sort((a, b) => a - b);
        ns.print("sorted: ", sorted);
        finalResults.push(sorted);
      }
    }
    await ns.sleep(10);
  }

  ns.tprint("final: ", finalResults)
  ns.tprint("num: ", finalResults.length)
}

function sumIntegersInArray(arr: number[] | undefined, startIndex: number): number[] {
  let newArray: number[] = [];
  if (arr && startIndex < arr.length) {
    newArray = [...arr.slice(0, startIndex), arr[startIndex] + arr[startIndex + 1], ...arr.slice(startIndex + 2)];
  }
  return newArray;
}

// ATTEMPTS
//  1. 46 -> didnt finish running