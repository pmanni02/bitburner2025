// Encryption II: Vigenère Cipher
// Vigenère cipher is a type of polyalphabetic substitution. It uses the Vigenère square to encrypt and decrypt plaintext with a keyword.

//   Vigenère square:
//          A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
//        +----------------------------------------------------
//      A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
//      B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
//      C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
//      D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
//      E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
//                 ...
//      Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
//      Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y

// For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword. For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:
//    Plaintext: DASHBOARD
//    Keyword:   LINUXLINU
// So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.

// You are given an array with two elements:
//   ["CLOUDDEBUGTRASHLOGICFRAME", "TERMINAL"]
// The first element is the plaintext, the second element is the keyword.

// Return the ciphertext as uppercase string.

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.

import { NS } from "@ns";

const alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export async function main(ns: NS): Promise<void> {
  const plaintext = 'MODEMMOUSEEMAILARRAYLOGIN';
  const keyword = 'MONITOR'

  // create function to return character given row and column (as numbers, ie: 0 through 26) => get cipher letter
  // iterate through plaintext and keyword characters and get cipher letter

  let keywordIndex = 0;
  const cipherText = []
  for (let i = 0; i < plaintext.length; i++) {
    if (keywordIndex >= keyword.length) {
      keywordIndex = 0;
    }

    const row = plaintext[i];
    const col = keyword[keywordIndex];

    const cipherChar = getCipherLetter(row, col)
    cipherText.push(cipherChar)
    keywordIndex++;
  }
  ns.tprint(`ciperText: ${cipherText.join('')}`)
}

function getCipherLetter(row: string, col: string) {
  const rowIndex = alphabet.indexOf(row);
  let rotated = alphabet;
  if (rowIndex > 0) {
    rotated = alphabet.slice(rowIndex).concat(alphabet.slice(0, rowIndex));
  }

  const index = alphabet.indexOf(col)
  const cipherChar = rotated[index];
  return cipherChar
}

// ATTEMPTS:
// 1. ["CLOUDDEBUGTRASHLOGICFRAME", "TERMINAL"] -> VPFGLQEMNKKDIFHWHKZONEAXX (correct)
// 2. ["MODEMMOUSEEMAILARRAYLOGIN", "MONITOR"] -> YCQMFAFGGRMFOZXOEZTMCAUVV (correct)
