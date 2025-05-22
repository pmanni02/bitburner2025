// Spiralize Matrix
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after
//  which the contract will self-destruct.

// Given the following array of arrays of numbers representing a 2D matrix, 
//  return the elements of the matrix as an array in spiral order:
//     [
//         [37, 4,19,49,42,36,18,21,28]
//         [26, 1,15,16, 7,30,38, 4, 5]
//     ]

// Here is an example of what spiral order should be:

//     [
//         [1, 2, 3]
//         [4, 5, 6]
//         [7, 8, 9]
//     ]
// Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]

// Note that the matrix will not always be square:

//     [
//         [1,  2,  3,  4]
//         [5,  6,  7,  8]
//         [9, 10, 11, 12]
//     ]
// Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

import { NS } from "@ns";

// start = [0][0]
// keep track of directions
// i = row, j = col
// N, E, S, W
// +i,+j,-i,-j

// iterate until input[i][j] == undefined, then change directions
// when you get to a new position, record in result array and replace
// array element with -1
// if a -1 is encountered when iterating, change directions
// if changing directions still leads to a -1, END

const DIRECTIONS = ["N", "E", "S", "W"];
let cur = 1;
const results: number[] = [];

export async function main(ns: NS): Promise<void> {
  let input =
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]

  let i = 0;
  let j = 0;

  while (input[i] && input[i][j] !== -1) {
    ns.tprint("value: ", input[i][j]);
    input = updateMatrix(input, i, j);
    ns.tprint(input);

    ({ i, j } = next(ns, input, i, j));
    ns.tprint("i: ", i);
    ns.tprint("j: ", j);

    await ns.sleep(1000);
  }
  ns.tprint(results)
}

const updateDirection = (cur: number) => { return cur < DIRECTIONS.length - 1 ? cur + 1 : 0 };

const updateMatrix = (matrix: number[][], i: number, j: number) => {
  results.push(matrix[i][j]);
  matrix[i][j] = -1;
  return matrix;
}

const next = (ns: NS, input: number[][], i: number, j: number) => {
  const initalI = i;
  const initalJ = j;

  if (DIRECTIONS[cur] === "N") {
    i--;
  } else if (DIRECTIONS[cur] === "E") {
    j++;
  } else if (DIRECTIONS[cur] === "S") {
    i++;
  } else if (DIRECTIONS[cur] === "W") {
    j--;
  }

  if (input[i] && input[i][j]) {
    if (input[i][j] === -1) {
      cur = updateDirection(cur);
      ns.tprint("cur: ", DIRECTIONS[cur]);
      // return {i: initalI, j: initalJ}
      ({ i, j } = next(ns, input, initalI, initalJ));
      ns.tprint("new i: ", i);
      ns.tprint("new j: ", j);
    }
  } else if ((input[i] && !input[i][j]) || !input[i]) {
    cur = updateDirection(cur);
    ns.tprint("cur: ", DIRECTIONS[cur]);
    ({ i, j } = next(ns, input, initalI, initalJ));
  }
  return { i, j };
}
