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
    const tree = createFileTree(basePath, true) as File[];
    const ignores = parseIgnores();

    const TRASH_DIR = `${VECO_DIR}/.veco/.trash`;
    if (!fs.existsSync(TRASH_DIR)) {
        fs.mkdirSync(TRASH_DIR, { recursive: true });
    }

    let updatedTree = [...tree];

    for (const diff of differences) {
        const { operation, file, newFile } = diff;

        if (ignores.includes(file.path)) continue;

        switch (operation) {
            case "MOD":
                {
                    const index = updatedTree.findIndex(refFile => refFile.path === file.path);
                    if (index !== -1 && newFile) {
                        updatedTree[index].content = newFile.content;
                    }
                }
                continue;
            case "DEL":
                {
                    const fullPath = file.path;
                    if (fs.existsSync(fullPath)) {
                        const relativeTrashPath = fullPath.replace(`${VECO_DIR}/`, "");
                        const trashPath = `${TRASH_DIR}/${relativeTrashPath}`;
                        const trashDirname = getDirectoryName(trashPath);

                        if (!fs.existsSync(trashDirname)) {
                            mkdirRecursive(trashDirname);
                        }

                        fs.renameSync(fullPath, trashPath);
                    }
                    updatedTree = updatedTree.filter(refFile => refFile.path !== file.path);
                }
                continue;
            case "INIT":
                updatedTree.push(file);
                continue;
        }
    }

    if (isRef) {
        fs.rmSync(basePath, { recursive: true, force: true });
        fs.mkdirSync(basePath);
    }

    for (const file of updatedTree) {
        const { path, content } = file;
        const newPath = path.replace(`${VECO_DIR}`, "").substring(1);
        const dirname = getDirectoryName(path).replace(`${VECO_DIR}`, "").substring(1);

        if (ignores.includes(path)) continue;

        if (dirname && !fs.existsSync(`${basePath}/${dirname}`)) {
            mkdirRecursive(`${basePath}/${dirname}`);
        }

        fs.writeFileSync(`${basePath}/${newPath}`, content);
    }

    return updatedTree;
}

