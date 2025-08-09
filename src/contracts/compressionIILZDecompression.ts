// Compression II: LZ Decompression
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

// Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. 
// In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, 
// followed by the chunk data, which is either:

// 1. Exactly L characters, which are to be copied directly into the uncompressed data.
// 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: 
// each of the L output characters is a copy of the character X places before it in the uncompressed data.

// For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. 
// The two chunk types alternate, starting with type 1, and the final chunk may be of either type.

// You are given the following LZ-encoded string:
//     5yHByw554H1X2722a1818RcXyBVQx619CbxQRgza708fza74706571T
// Decode it and output the original string.

// Example: decoding '5aaabb450723abb' chunk-by-chunk

//     5aaabb           ->  aaabb
//     5aaabb45         ->  aaabbaaab
//     5aaabb450        ->  aaabbaaab
//     5aaabb45072      ->  aaabbaaababababa
//     5aaabb450723abb  ->  aaabbaaababababaabb

// If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.