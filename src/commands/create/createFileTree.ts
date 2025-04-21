import fs from "fs";

import { IGNOREFILE_PATH } from "../../constants";
import { File } from "../../interfaces";

export function createFileTree(root: string, isRef: boolean = false, isFilenameTree = false): (string | File)[] {
    const directoryContents = fs.readdirSync(root);
    const tree = [];

    for (const filename of directoryContents) {
        const path = `${root}/${filename}`;

        if (!fs.existsSync(path)) continue;

        if (fs.statSync(path).isDirectory()) {
            if (filename === ".veco") continue;

            // TODO: recursively read ignore paths that are directories
            if (fs.existsSync(IGNOREFILE_PATH)) {
                const ignores = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");

                if (ignores.includes(path)) continue;
            }

            tree.push(...createFileTree(path, isRef, isFilenameTree));

            continue;
        }

        if (isFilenameTree) {
            tree.push(path);
        } else {
            tree.push({
                name: filename,
                path: isRef ? path.split(".veco/ref/").join("") : path,
                content: fs.readFileSync(path).toString()
            })
        }

    }

    return tree;
}
