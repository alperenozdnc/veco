import fs from "fs";

import { Difference } from "../interfaces";
import { parseBytes } from ".";

export function printDiff(diff: Difference) {
    let isMODoperation = false;
    let deltaChar = 0;

    if (diff.operation === "MOD") {
        deltaChar = diff.newFile!.content.length - diff.file.content.length;

        isMODoperation = true;
        console.log(`  MOD -> '${diff.file.name}' (${deltaChar > 0 ? "+" : ""}${deltaChar} chars)`)
    } else if (diff.operation === "INIT") {
        console.log(`  ${diff.operation} -> '${diff.file.name}' (${parseBytes(fs.statSync(diff.file.path).size)}) `)
    } else {
        console.log(`  ${diff.operation} -> '${diff.file.name}'`)
    }
}
