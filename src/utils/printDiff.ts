import fs from "fs";

import { Difference } from "../interfaces";
import { padLeft, parseBytes } from ".";

export function printDiff(diff: Difference) {
    let isMODoperation = false;
    let deltaChar = 0;
    const output = [];

    if (diff.operation === "MOD") {
        deltaChar = diff.newFile!.content.length - diff.file.content.length;

        isMODoperation = true;
        output.push(`MOD -> '${diff.file.name}' (${deltaChar > 0 ? "+" : ""}${deltaChar} chars)`)
    } else if (diff.operation === "INIT") {
        output.push(`${diff.operation} -> '${diff.file.name}' (${parseBytes(fs.statSync(diff.file.path).size)})`)
    } else {
        output.push(`${diff.operation} -> '${diff.file.name}'`)
    }

    padLeft(output);
}
