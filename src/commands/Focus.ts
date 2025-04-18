import fs from "fs";

import { CheckVecoDirectory, GetVecoDirectory, LogError } from "../utils";

export function Focus(args: string[]) {
    const isVecoDirectory: boolean = CheckVecoDirectory();

    if (!isVecoDirectory) {
        LogError(`no veco project found in this or any parent directories`);
        console.log("\nYou must run the focus command inside a project.");
        console.log("'veco create project' to create a project.");

        return;
    }

    const VECO_DIR = GetVecoDirectory();

    for (const path in args) {
    }
}
