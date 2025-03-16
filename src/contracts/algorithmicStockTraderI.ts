// Algorithmic Stock Trader I
// You are attempting to solve a Coding Contract. You have 5 tries remaining, 
// after which the contract will self-destruct.

// You are given the following array of stock prices (which are numbers) where the i-th 
// element represents the stock price on day i:

// 107,192,179,172,73,172,94,117,158,171,166,45

// Determine the maximum possible profit you can earn using at most one transaction 
// (i.e. you can only buy and sell the stock once). If no profit can be made then the answer should be 0. 
// Note that you have to buy the stock before you can sell it.

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // ie: 1,2,3,4,5,2,1
  //     1 -> 5
  //    buy on day 1, sell on day 5 -> profit is 4

  const input = [
    107, 192, 179, 172, 73, 172, 94, 117, 158, 171, 166, 45
  ];

  let profit = 0;
  for (let i = 0; i < input.length; i++) {
    const subarray = input.slice(i);

    let smallestPrice = subarray[0];
    let maxPrice = subarray[0];

    let indexOfMax = 0;
    subarray.forEach((price, i) => {
      if (price > maxPrice) {
        maxPrice = price;
        indexOfMax = i;
      }
    })

    const subarrayToFindSmallest = input.slice(0, indexOfMax + 1);
    subarrayToFindSmallest.forEach((price) => {
      if (price < smallestPrice) {
        smallestPrice = price;
      }
    });

    if(maxPrice - smallestPrice > profit) {
      profit = maxPrice - smallestPrice;
    }
  }

  ns.tprint("MAX PROFIT: ", profit)
}

// ATTEMPTS
// 1. 107,192,179,172,73,172,94,117,158,171,166,45 -> 1646
// 2. 97,120,61,4,31,32,128,15,157,165,103,160,34,
//    76,65,85,119,176,112,193,62,66,179,40,181,189,
//    100,152,70,181,114                           -> 3267 INCORRECT
//                                                 -> 189 CORRECT!
//                                                    (manually -> found largest number, then found smallest number to the left)
// 3. 107,192,179,172,73,172,94,117,158,171,166,45 -> 85 INCORRECT
//                                                 -> 99 CORRECT
