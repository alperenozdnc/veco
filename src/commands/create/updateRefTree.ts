import fs from "fs";
import { dirname as getDirectoryName, basename as getFilename } from "path";

import { Difference, File } from "../../interfaces";
import { IGNOREFILE_PATH, VECO_DIR } from "../../constants";

import { createFileTree } from "./createFileTree";

function mkdirRecursive(path: string) {
    let dirname = getDirectoryName(path);

    if (!fs.existsSync(dirname)) {
        mkdirRecursive(dirname);
    }

    fs.mkdirSync(path);
}

function parseIgnores(ignores: string[]) {
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

export function updateRefTree(refPath: string, differences: Difference[]) {
    let refTree = createFileTree(refPath, true) as unknown as File[];
    let ignoredFiles: string[] = fs.existsSync(IGNOREFILE_PATH) ? fs.readFileSync(IGNOREFILE_PATH).toString().split("\n") : [];

    // removes newline at file end
    ignoredFiles.splice(ignoredFiles.length - 1, 1);

    // turn every ignore file to its absolute path
    // recursively read directory ignores
    ignoredFiles = parseIgnores(ignoredFiles);

    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        const { operation, file, newFile } = diff;

        if (ignoredFiles.includes(file.path)) continue;

        switch (operation) {
            case "MOD":
                let j: number = 0;

                let modifiedFile = refTree.find((fileB, k) => {
                    if (file.name === fileB.name) {
                        j = k;
                        return true;
                    }

                    return false;
                });

                if (!modifiedFile || !newFile) continue;

                modifiedFile.content = newFile.content;
                refTree[j] = modifiedFile;

                continue;
            case "DEL":
                refTree.splice(i, 1);
                continue;
            case "INIT":
                refTree.push(file);
        }
    }

    fs.rmSync(refPath, { recursive: true, force: true });
    fs.mkdirSync(refPath);

    // write every file out to ref
    for (const file of refTree) {
        const { path, content } = file;
        let newPath = path.replace(`${VECO_DIR}`, "").substring(1);
        let dirname = getDirectoryName(path).replace(`${VECO_DIR}`, "").substring(1);

        if (ignoredFiles.includes(path)) continue;

        if (dirname && !fs.existsSync(`${refPath}/${dirname}`)) {
            mkdirRecursive(`${refPath}/${dirname}`);
        }

        fs.writeFileSync(`${refPath}/${newPath}`, content);
    }

    return refTree;
}
