import fs from "fs";

import { checkVecoDir, log } from "../utils";
import { FOCUSFILE_PATH, IGNOREFILE_PATH } from "../constants";

function reformatPath(path: string) {
    let newPath = "";

    if (path === "." || path === "./") {
        newPath = `${path}`;
    } else {
        newPath = `${process.cwd()}/${path}`;
    }

    return newPath;
}

export function focus(args: string[]) {
    const isVecoDirectory: boolean = checkVecoDir();

    if (!isVecoDirectory) {
        log.error("no veco project found in this or any parent directories");
        console.log("\nYou must run the focus command inside a project.");
        console.log("'veco create project' to create a project.");

        return;
    }

    const focusfileContentString = fs.existsSync(FOCUSFILE_PATH) ? fs.readFileSync(FOCUSFILE_PATH).toString() : "";
    let focusfileContent = focusfileContentString.split("\n");

    let ignorefileContent: string[] = [];

    if (args.length === 0) {
        log.error("no command or file(s) provided");
        return console.log("Aborting...")
    }

    if (fs.existsSync(IGNOREFILE_PATH)) {
        ignorefileContent = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");
    }

    if (args[0] === "clean") {
        console.log("Removing all focused paths...")

        fs.writeFileSync(FOCUSFILE_PATH, "");

        return;
    } else if (args[0] === "list") {
        console.log("All focused paths: ")

        if (!focusfileContentString) return log.error("nothing to list");

        console.log(focusfileContentString);

        return;
    } else if (args[0] === "remove") {
        for (let pathToRemove of args.slice(1)) {
            pathToRemove = reformatPath(pathToRemove);

            if (!focusfileContent.includes(pathToRemove)) {
                log.warning(`${pathToRemove} is not focused, skipping...`)
                return;
            }

            console.log(`unfocusing ${pathToRemove}...`);

            focusfileContent = focusfileContent.filter((ffPath: string) => ffPath !== pathToRemove);

            fs.writeFileSync(FOCUSFILE_PATH, focusfileContent.join("\n"));
        }

        return;
    }

    for (let path of args) {
        if (!fs.existsSync(path)) return log.error(`${path} does not exist`);

        if (ignorefileContent) {
            if (ignorefileContent.includes(path)) {
                log.warning(`${path} is an ignored path, skipping...`)
                continue;
            }
        }

        path = reformatPath(path);

        if (focusfileContent.includes(path)) {
            log.warning(`${path} is already focused, skipping...`);
            continue;
        }

        fs.appendFileSync(FOCUSFILE_PATH, `${path}\n`);
    }
}
