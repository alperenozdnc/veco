import fs from "fs";

import { Difference } from "../interfaces";
import { padLeft, parseBytes } from ".";

export function printDiff(diff: Difference) {
    const { file, newFile, operation } = diff;

    let isMODoperation = false;
    let deltaChar = 0;
    const output = [];

    if (operation === "MOD" && newFile) {
        deltaChar = newFile.content.length - file.content.length;

        isMODoperation = true;
        output.push(`MOD -> '${file.name}' (${deltaChar > 0 ? "+" : ""}${deltaChar} chars)`)
    } else if (diff.operation === "INIT") {
        output.push(`${operation} -> '${file.name}' (${parseBytes(fs.statSync(file.path).size)})`)
    } else {
        output.push(`${operation} -> '${file.name}'`)
    }

    padLeft(output);
}
