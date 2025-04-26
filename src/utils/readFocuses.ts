import fs from "fs";

import { FOCUSFILE_PATH, VECO_DIR } from "../constants";
import { createFileTree } from "../commands/create/createFileTree";
import { log } from ".";

export function readFocuses(basePath = VECO_DIR): string[] | null {
    if (!fs.existsSync(FOCUSFILE_PATH)) {
        log.error("focusfile doesn't exist");
        return null;
    }

    let focusesFileContent = fs.readFileSync(FOCUSFILE_PATH).toString().split("\n");
    let focuses = [];

    for (let i = 0; i < focusesFileContent.length; i++) {
        let path = focusesFileContent[i];

        if (!path) continue;

        if (basePath !== VECO_DIR) {
            path = path.replace(VECO_DIR, basePath);
        }

        if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
            focuses.push(...(createFileTree(path, false, true) as string[]));
            continue;
        }

        focuses.push(path);
    }

    return focuses;
}
