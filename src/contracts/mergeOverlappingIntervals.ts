// Merge Overlapping Intervals
// You are attempting to solve a Coding Contract. You have 15 tries remaining, after which the contract will self-destruct.

// Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.

// [[4,7],[1,7],[21,30],[9,19],[1,11],[6,9],[17,18],[18,26],[19,21],[10,15],[22,28],[12,20],[4,8],[15,22],[1,9],[9,16]]

// Example:

// [[1, 3], [8, 10], [2, 6], [10, 16]]

// would merge into [[1, 6], [8, 16]].

// The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // [[1, 3], [8, 10], [2, 6], [10, 16]]
  // [[1, 3], [2, 6], [8, 10], [10, 16]]

  const input = [[19,27],[9,17],[13,20],[4,6],[21,31],[6,13],[22,29],[6,8],[2,10],[3,6],[9,13],[25,31],[19,29],[21,29],[1,11],[25,32],[11,12],[3,10],[2,6],[23,33]]
  ns.tprint('input: ', input);

  const sorted = input.sort((a, b) => a[0] - b[0]);
  ns.tprint('sorted: ', sorted);

  // push the first interval
  // iterate through each interval
  //  if the last element of the last interval is >= the first element of the current interval
  //   update the last element of the last merged interval to the MAX of (the last element of the current interval OR the last element of the last interval)
  //  else,
  //   push the current interval

  const mergedIntervals = [];
  mergedIntervals.push(sorted[0])
  for (let i = 1; i < sorted.length; i++) {
    if (mergedIntervals[mergedIntervals.length - 1][1] >= sorted[i][0]) {
      mergedIntervals[mergedIntervals.length - 1][1] = Math.max(mergedIntervals[mergedIntervals.length - 1][1], sorted[i][1])
    } else {
      mergedIntervals.push(sorted[i])
    }
  }
  ns.tprint('mergedIntervals: ', mergedIntervals)
}

// ATTEMPTS:
// 1. [[4,7],[1,7],[21,30],[9,19],[1,11],[6,9],[17,18],[18,26],[19,21],[10,15],[22,28],[12,20],[4,8],[15,22],[1,9],[9,16]] ->
//   [[1,30]]
// 2. [[19,27],[9,17],[13,20],[4,6],[21,31],[6,13],[22,29],[6,8],[2,10],[3,6],[9,13],[25,31],[19,29],[21,29],[1,11],[25,32],[11,12],[3,10],[2,6],[23,33]] ->
//  [[1,33]] -> correct
