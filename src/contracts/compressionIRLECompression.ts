// Compression I: RLE Compression
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

// Run-length encoding (RLE) is a data compression technique which encodes data as 
// a series of runs of a repeated single character. 
// Runs are encoded as a length, followed by the character itself. 
// Lengths are encoded as a single ASCII digit; runs of 10 characters or more are 
// encoded by splitting them into multiple runs.

// You are given the following input string:
//     wWW4wwGGGGGGGGGGGGeeeeeeeeeee1111111uWW3OOMM667733TuuuuuuuuuuuuuBBaaAAommffhhhhhhhQQMc
// Encode it using run-length encoding with the minimum possible output length.

// Examples:

//     aaaaabccc            ->  5a1b3c
//     aAaAaA               ->  1a1A1a1A1a1A
//     111112333            ->  511233
//     zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)


// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
  // split input string into array
  // create separate groups by character (case sensitive)
  //   grab up to 10 of the same character -> compress and add to final string
  // return final compressed string
  const input = 'aAaAaA';
  // eg:
  // aaaaabccc
  // starting with index 0, find index where final 'a' occurs -> 4
  // the diff + 1 between start and end is 5 -> 5a
  // bccc
  // starting with index 0, find index where final 'b' occurs -> 0
  // the diff + 1 between start and end is 1 -> 1b
  // ccc
  // starting with index 0, find index where final 'c' occurs -> 2
  // the diff + 1 between start and end is 3 -> 3c
  let compressedFinal = ''
  const inputArray = input.split('');
  while (inputArray.length > 0) {
    ns.tprint('input array: ', inputArray);
    const charChunkIndex = inputArray.findIndex((char, i) => {
      return inputArray[i + 1] != char
    });
    ns.tprint('charChunkIndex: ', charChunkIndex);

    let compressedVal;
    if (charChunkIndex < 9) {
      compressedVal = `${charChunkIndex + 1}${inputArray[0]}`;
      ns.tprint('compressedVal: ', compressedVal);
      compressedFinal = compressedFinal.concat(compressedVal);
      inputArray.splice(0, charChunkIndex + 1);
    } else {
      compressedVal = `9${inputArray[0]}`;
      ns.tprint('compressedVal: ', compressedVal);
      compressedFinal = compressedFinal.concat(compressedVal)
      inputArray.splice(0, 9);
    }
    // ns.tprint('compressedVal: ', compressedVal);
    // compressedFinal = compressedFinal.concat(compressedVal)


    ns.tprint('compressedFinal: ', compressedFinal);
  }
}