// Subarray with Maximum Sum
// You are attempting to solve a Coding Contract. 
// You have 10 tries remaining, after which the contract will self-destruct.

// Given the following integer array, find the contiguous subarray (containing at least one number) 
// which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the 
// subarray.
// -7,6,-6,5,6,-4,6,-1,1,3,-1

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
// NOTES: found on zer0 server (contract-590622.cct)

import { NS } from "@ns";

/**
 * Input: integer array
 * Output: integer
 * @param ns 
 */
export async function main(ns: NS): Promise<void> {
  let bestSum = 0;
  let currentBestSubarray: number[] = [];
  const array = [-7, 6, -6, 5, 6, -4, 6, -1, 1, 3, -1];
  // -7
  // -7,6
  // -7,6,-6
  // -7,6,-6, 5

  for (let i = 0; i < array.length; i++) {
    const subarray = array.slice(i);
    let curSum = subarray[0];
    let curSubArray: number[] = [];
    for (let j = 1; j < subarray.length; j++) {
      if (curSum + subarray[j] > curSum) {
        curSubArray = subarray.slice(0, j + 1) // slice j index is exclusive
      }
      curSum += subarray[j];
    }
    if (curSum > bestSum) {
      bestSum = curSum;
      currentBestSubarray = curSubArray;
    }
  }

  ns.tprint(currentBestSubarray);

  const sum = currentBestSubarray.reduce((acc, val) => acc + val);
  ns.tprint("SUM: ", sum)
}

// ATTEMPTS:
// 1. [6,-6,5,6,-4,6,-1,1,3] -> 16