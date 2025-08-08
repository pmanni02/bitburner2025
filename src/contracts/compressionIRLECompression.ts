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
  const input = 'yyyyyllxCCCCCCCCCyyyyyyyyRR3QQQQQQQQQQQQffffffbTTcccggppEEEnPUkkWWeeOqqWWWWWWWWWW2';

  let compressedFinal = ''
  const inputArray = input.split('');
  while (inputArray.length > 0) {
    const charChunkIndex = inputArray.findIndex((char, i) => {
      return inputArray[i + 1] != char
    });

    let compressedVal;
    if (charChunkIndex < 9) {
      compressedVal = `${charChunkIndex + 1}${inputArray[0]}`;
      inputArray.splice(0, charChunkIndex + 1);
    } else {
      compressedVal = `9${inputArray[0]}`;
      inputArray.splice(0, 9);
    }
    compressedFinal = compressedFinal.concat(compressedVal);

    ns.tprint('compressedFinal: ', compressedFinal);
  }
}

// ATTEMPTS: 
// 1. wWW4wwGGGGGGGGGGGGeeeeeeeeeee1111111uWW3OOMM667733TuuuuuuuuuuuuuBBaaAAommffhhhhhhhQQMc -> 
//  1w2W142w9G3G9e2e711u2W132O2M2627231T9u4u2B2a2A1o2m2f7h2Q1M1c
// 2. yyyyyllxCCCCCCCCCyyyyyyyyRR3QQQQQQQQQQQQffffffbTTcccggppEEEnPUkkWWeeOqqWWWWWWWWWW2 ->
//  5y2l1x9C8y2R139Q3Q6f1b2T3c2g2p3E1n1P1U2k2W2e1O2q9W1W12 -> correct