import fs from "fs";

// this function assumes there is a veco directory to run
export function GetVecoDirectory(dirToSearch = process.cwd()) {
    let vecoDirectory: string = "";

    function checkDirRecursively(dir: string) {
        // halt if the root directory is reached
        if (!dir) return;

        // halt if the veco directory is found
        if (fs.readdirSync(dir).includes(".veco")) {
            return vecoDirectory = dir;
        }

        // go up a directory if the current directory isnt a veco directory
        const dirSplit = dir.split("/");
        dirSplit.pop();

        checkDirRecursively(dirSplit.join("/"));
    }

    checkDirRecursively(dirToSearch);

    return vecoDirectory;
}
