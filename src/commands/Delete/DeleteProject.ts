import fs from "fs";

import { GetVecoDirectory, LogWarning, HandleYesNoInput } from "../../utils";

export function DeleteProject() {
    const VECO_DIR = GetVecoDirectory();
    const IGNOREFILE_PATH = `${VECO_DIR}/.vecoig`;

    LogWarning(`This action will delete the veco instance on ${VECO_DIR}`);
    const USER_DID_CONFIRM = HandleYesNoInput("Are you absolutely sure?");

    if (!USER_DID_CONFIRM) return console.log("Aborting...");

    console.log(`\nRemoving '${VECO_DIR}/.veco'...`);
    fs.rmSync(`${VECO_DIR}/.veco`, { recursive: true, force: true });

    if (fs.existsSync(IGNOREFILE_PATH)) {
        console.log(`Removing '${IGNOREFILE_PATH}'...`);
        fs.rmSync(IGNOREFILE_PATH);
    }

    console.log("\nSuccessfully deleted project.");
    console.log("'veco create project {project_path}' to make a new project.");
}
