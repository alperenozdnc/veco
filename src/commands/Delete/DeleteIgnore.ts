import fs from "fs";

import { GetVecoDirectory, LogError } from "../../utils";

export function DeleteIgnore(args: string[]) {
    if (args.length === 0) return LogError("no files to unignore");

    const vecoDirectory = GetVecoDirectory();
    const ignoreFilePath = `${vecoDirectory}/.vecoig`;

    if (!fs.existsSync(ignoreFilePath)) return LogError("no ignore file found");

    let ignoreFileContent: string | string[] = fs.readFileSync(ignoreFilePath).toString().split("\n");

    for (const file of args) {
        if (!ignoreFileContent.includes(file)) return LogError(`invalid file ${file}`);

        ignoreFileContent = ignoreFileContent.filter((ignoreFile: string) => ignoreFile !== file);
    }

    ignoreFileContent = ignoreFileContent.join("\n");

    fs.writeFileSync(ignoreFilePath, ignoreFileContent);
}
