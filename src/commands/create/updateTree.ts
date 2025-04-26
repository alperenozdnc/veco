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

export function updateTree(basePath: string, differences: Difference[], isRef = true) {
    let tree = createFileTree(basePath, true) as unknown as File[];
    const ignores = parseIgnores();

    for (let i = 0; i < differences.length; i++) {
        const diff = differences[i];
        const { operation, file, newFile } = diff;

        if (ignores.includes(file.path)) continue;

        switch (operation) {
            case "MOD":
                let j: number = 0;

                let modifiedFile = tree.find((fileB, k) => {
                    if (file.path === fileB.path) {
                        j = k;
                        return true;
                    }

                    return false;
                });

                if (!modifiedFile || !newFile) continue;

                modifiedFile.content = newFile.content;
                tree[j] = modifiedFile;

                continue;
            case "DEL":
                tree = tree.filter((refFile) => refFile.path !== file.path);

                continue;
            case "INIT":
                tree.push(file);
        }
    }

    if (isRef) {
        fs.rmSync(basePath, { recursive: true, force: true });
        fs.mkdirSync(basePath);
    }

    // write every file out to target 
    for (const file of tree) {
        const { path, content } = file;
        let newPath = path.replace(`${VECO_DIR}`, "").substring(1);
        let dirname = getDirectoryName(path).replace(`${VECO_DIR}`, "").substring(1);

        if (ignores.includes(path)) continue;

        if (dirname && !fs.existsSync(`${basePath}/${dirname}`)) {
            mkdirRecursive(`${basePath}/${dirname}`);
        }

        fs.writeFileSync(`${basePath}/${newPath}`, content);
    }

    return tree;
}
