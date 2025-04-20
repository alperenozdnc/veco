import fs from "fs";

export function checkVecoDir(dirToCheck = process.cwd()) {
    let isInVecoDirectory = false;

    function checkDirRecursively(dir: string) {
        // halt if the root directory is reached
        if (!dir) return;

        // halt if directory is veco directory
        if (fs.readdirSync(dir).includes(".veco")) return isInVecoDirectory = true

        // go up a directory if the current directory isnt a veco directory
        const dirSplit = dir.split("/");
        dirSplit.pop();

        checkDirRecursively(dirSplit.join("/"));
    }

    checkDirRecursively(dirToCheck);

    return isInVecoDirectory;
}
