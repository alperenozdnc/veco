import fs from "fs";

import { createFileTree } from "../commands/create/createFileTree";

import { dirname as getDirectoryName, basename as getFilename } from "path";

import { VECO_DIR, IGNOREFILE_PATH } from "../constants";

function readAllIgnorePaths(ignores: string[]) {
    let parsedIgnores = [];

    for (const ignore of ignores) {
        let dirname = getDirectoryName(ignore);

        if (dirname === ".") {
            dirname = VECO_DIR;
        } else {
            dirname = `${VECO_DIR}/${dirname}`;
        }

        let parsedPath = `${dirname}/${getFilename(ignore)}`;

        if (!fs.existsSync(parsedPath)) continue;

        if (fs.statSync(parsedPath).isDirectory()) {
            parsedIgnores.push(...(createFileTree(parsedPath, false, true) as string[]));
            continue;
        }

        parsedIgnores.push(parsedPath);
    }

    return parsedIgnores;
}

export function parseIgnores() {
    let ignoredFiles: string[] = fs.existsSync(IGNOREFILE_PATH) ? fs.readFileSync(IGNOREFILE_PATH).toString().split("\n") : [];
    ignoredFiles.splice(ignoredFiles.length - 1, 1);
    ignoredFiles = readAllIgnorePaths(ignoredFiles);

    return ignoredFiles;
}

