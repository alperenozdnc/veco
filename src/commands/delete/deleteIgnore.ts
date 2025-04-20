import fs from "fs";

import { getVecoDir, log } from "../../utils";

export function deleteIgnore(args: string[]) {
    if (args.length === 0) return log.error("no files to unignore");

    const VECO_DIR = getVecoDir();
    const IGNOREFILE_PATH = `${VECO_DIR}/.vecoig`;

    if (!fs.existsSync(IGNOREFILE_PATH)) return log.error("no ignore file found");

    let ignoreFileContent: string | string[] = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");

    for (const file of args) {
        if (!ignoreFileContent.includes(file)) return log.error(`invalid file ${file}`);

        ignoreFileContent = ignoreFileContent.filter((ignoreFile: string) => ignoreFile !== file);
    }

    ignoreFileContent = ignoreFileContent.join("\n");

    fs.writeFileSync(IGNOREFILE_PATH, ignoreFileContent);
}
