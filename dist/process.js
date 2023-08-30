import readline from 'readline';
import fs from 'fs';
import { createGunzip } from 'zlib';
const filename = process.argv[2];
function getReadline(filename) {
    const stream = fs.createReadStream(filename);
    return readline.createInterface({
        input: filename.match(/.b?gz$/) ? stream.pipe(createGunzip()) : stream,
    });
}
const cigarRegex = new RegExp(/([MIDNSHPX=])/);
export function parseCigar(cigar = '') {
    return cigar.split(cigarRegex).slice(0, -1);
}
export function flipCigar(cigar) {
    const arr = [];
    for (let i = cigar.length - 2; i >= 0; i -= 2) {
        arr.push(cigar[i]);
        const op = cigar[i + 1];
        if (op === 'D') {
            arr.push('I');
        }
        else if (op === 'I') {
            arr.push('D');
        }
        else {
            arr.push(op);
        }
    }
    return arr;
}
export function swapIndelCigar(cigar) {
    return cigar.replaceAll('D', 'K').replaceAll('I', 'D').replaceAll('K', 'I');
}
const rl1 = getReadline(filename);
for await (const line of rl1) {
    console.log(`q${line}`);
}
rl1.close();
const rl2 = getReadline(filename);
for await (const line of rl2) {
    const [c1, l1, s1, e1, strand, c2, l2, s2, e2, ...rest] = line.split('\t');
    const cigarIdx = rest.findIndex(f => f.startsWith('cg:Z'));
    let CIGAR = rest[cigarIdx];
    if (CIGAR) {
        if (strand === '-') {
            CIGAR = flipCigar(parseCigar(CIGAR.slice(5))).join('');
        }
        else {
            CIGAR = swapIndelCigar(CIGAR.slice(5));
        }
        rest[cigarIdx] = `cg:Z:${CIGAR}`;
    }
    console.log([`t${c2}`, l2, s2, e2, strand, c1, l1, s1, e1, ...rest].join('\t'));
}
rl2.close();
//# sourceMappingURL=process.js.map