import fs from "fs";
import { dirname as getDirectoryName } from "path";

import { Difference, File } from "../../interfaces";
import { VECO_DIR } from "../../constants";

import { createFileTree } from "./createFileTree";
import { parseIgnores } from "../../utils";

function mkdirRecursive(path: string) {
    let dirname = getDirectoryName(path);

    if (!fs.existsSync(dirname)) {
        mkdirRecursive(dirname);
    }

    fs.mkdirSync(path);
}

export function updateRefTree(refPath: string, differences: Difference[]) {
    let refTree = createFileTree(refPath, true) as unknown as File[];
    const ignores = parseIgnores();

    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        const { operation, file, newFile } = diff;

        if (ignores.includes(file.path)) continue;

        switch (operation) {
            case "MOD":
                let j: number = 0;

                let modifiedFile = refTree.find((fileB, k) => {
                    if (file.path === fileB.path) {
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

        if (ignores.includes(path)) continue;

        if (dirname && !fs.existsSync(`${refPath}/${dirname}`)) {
            mkdirRecursive(`${refPath}/${dirname}`);
        }

        fs.writeFileSync(`${refPath}/${newPath}`, content);
    }

    return refTree;
}
