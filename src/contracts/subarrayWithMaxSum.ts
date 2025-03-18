// Subarray with Maximum Sum
// You are attempting to solve a Coding Contract. 
// You have 10 tries remaining, after which the contract will self-destruct.

// Given the following integer array, find the contiguous subarray (containing at least one number) 
// which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the 
// subarray.
// INPUT 1: -7,6,-6,5,6,-4,6,-1,1,3,-1
// INPUT 2: -5,6,1,-10,-2,-5,-1,7,-10,6,-7,6,-1,9,4,-9,-5,9,-3
// INPUT 3: -7,-6,-8,0,2,-2,-7,-5,8,-5,-1,-3,0,0,-2,0,-8,6

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
// NOTES: found on zer0 server (contract-590622.cct)

import { NS } from "@ns";

/**
 * Input: integer array
 * Output: void (prints sum)
 * @param ns 
 */
export async function main(ns: NS, input: number[] | undefined) {
  let currentBestSubarray: number[] = [];
  let array: number[] | undefined;
  if (!input) {
    array = [-8, -8, -9, 0, 8, 0, 10, -7, 2, 7, -5, -2, -4, -3, -8, -2, 1, 10, 5, -3, -8, 10, -5, -5, -8, 8, 9, -8];
  }
  array = input;

  if (array) {
    // find the smallest number in the array -> the answer must include one element
    let indexOfSmallestNumber = 0;
    let smallestNumber = array[0];
    array.forEach((e, i) => {
      if (e < smallestNumber) {
        smallestNumber = e;
        indexOfSmallestNumber = i
      }
    })
    let bestSum = array[indexOfSmallestNumber];

    for (let i = 0; i < array.length; i++) {
      const subarray = array.slice(i);
      let curSum = subarray[0];
      let curSubArray: number[] = [];

      // check if first element in subarray is the best max subarray
      if (curSum > bestSum) {
        curSubArray = [curSum];
        bestSum = curSum;
      }
      for (let j = 1; j < subarray.length; j++) {
        if (curSum + subarray[j] > curSum) {
          curSubArray = subarray.slice(0, j + 1) // slice j index is exclusive
        }
        curSum += subarray[j];

        if (curSum >= bestSum) {
          bestSum = curSum;
          currentBestSubarray = curSubArray;
        }
      }
    }
    // ns.tprint("SUM: ", bestSum);
    // ns.tprint("SUBARRAY: ", currentBestSubarray)
    return { bestSum, currentBestSubarray };
  } else {
    ns.tprint("issue reading input")
  }
  return;
}

// ATTEMPTS:
// 1. Input: -7,6,-6,5,6,-4,6,-1,1,3,-1, answer: [6,-6,5,6,-4,6,-1,1,3] -> 16

// Input: -5,6,1,-10,-2,-5,-1,7,-10,6,-7,6,-1,9,4,-9,-5,9,-3,
// 1. Answer: [6,-1,9,4,-9,-5,9] -> 13 INCORRECT
// 2. Answer: [6,-1,9,4] -> 18 CORRECT

// Input: -7,-6,-8,0,2,-2,-7,-5,8,-5,-1,-3,0,0,-2,0,-8,6
// 1. Answer: [8] -> 8 CORRECT

// Input: -8,-8,-9,0,8,0,10,-7,2,7,-5,-2,-4,-3,-8,-2,1,10,5,-3,-8,10,-5,-5,-8,8,9,-8
// 1. Answer: 20 -> CORRECT