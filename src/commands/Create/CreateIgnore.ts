import fs from "fs";
import { LogError } from "../../utils";

export function CreateIgnore(filesToIgnore: string[]) {
    // ensures ignore file exists
    if (!fs.existsSync(".vecoig")) {
        console.log("Creating ignore file...");
        fs.writeFileSync(".vecoig", "");
    }

    // creates ignores
    const ignoreFileContent: string[] = fs.readFileSync(".vecoig").toString().split("\n");

    for (const file of filesToIgnore) {
        if (!fs.existsSync(file)) return LogError(`File ${file} doesn't exist!`);

        if (ignoreFileContent.includes(file)) return LogError(`File ${file} is already ignored.`);

        fs.appendFileSync(".vecoig", `${file}\n`);
        console.log(`File ${file} is now being ignored.`);
    }

    // throws error if no file provided
    if (!filesToIgnore.length) {
        LogError("no file name provided\n");
        console.log(`use 'veco create ignore {file_name}' to add an ignore`);
    }

    console.log("use 'veco delete ignore {file_name}' to remove any unused ignores.");
}
