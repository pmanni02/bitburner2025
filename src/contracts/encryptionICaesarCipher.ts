// Encryption I: Caesar Cipher
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

// Caesar cipher is one of the simplest encryption technique. It is a type of substitution cipher 
// in which each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. 
//  For example, with a left shift of 3, D would be replaced by A, E would become B, and A would become X 
//  (because of rotation).

// You are given an array with two elements:
//   ["POPUP DEBUG TRASH CLOUD TABLE", 14]
// The first element is the plaintext, the second element is the left shift value.

// Return the ciphertext as uppercase string. Spaces remains the same.

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

import { NS } from "@ns";

const alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export async function main(ns: NS): Promise<void> {
  // create mapping between letters and numbers
  // iterate through string, for each char find the corresponding new char and replace in the original string
  //  based on the left shift value
  const original = 'SHELL INBOX FRAME PASTE MODEM';
  const leftShift = 18;
  ns.tprint(original.split(''))

  const cipher = original.split('').map((char) => {
    if(char === " ") {
      return " "
    }
    return getRotation(ns, char, leftShift)
  })
  ns.tprint(cipher)
  ns.tprint(cipher.join(''))
}

function getRotation(ns:NS, letter: string, leftShift: number) {
  const newIndex = alphabet.indexOf(letter) - leftShift;
  const newLetterIndex = newIndex < 0 ? alphabet.length + newIndex : newIndex;
  return alphabet[newLetterIndex];
}

// ATTEMPTS:
// 1. [POPUP DEBUG TRASH CLOUD TABLE, 14] -> BABGB PQNGS FDMET OXAGP FMNXQ -> CORRECT
// 2. [MEDIA MOUSE TABLE INBOX PASTE, 3] -> JBAFX JLRPB QXYIB FKYLU MXPQB -> CORRECT
// 3. [CACHE FLASH CLOUD QUEUE TABLE, 5] -> XVXCZ AGVNC XGJPY LPZPZ OVWGZ -> CORRECT
// 4. [SHELL INBOX FRAME PASTE MODEM, 18] -> APMTT QVJWF NZIUM XIABM UWLMU -> CORRECT
