import fs from "fs";

import { readChangeFromId, revertToChange } from "../functions";
import { log } from "../utils";
import { ORDERFILE_PATH } from "../constants";

export function revert(args: string[]) {
    if (args.length > 1) {
        log.warning(`this command only accepts a single argument (skipping ${args.slice(1).join(", ")})`);
    }

    const TARGET_ID = args[0];

    if (!TARGET_ID) {
        log.error("no identifier provided");
        process.exit();
    }

    if (!fs.existsSync(ORDERFILE_PATH)) {
        log.error("no changes to revert back to");
        process.exit();
    }

    const ORDERFILE = fs.readFileSync(ORDERFILE_PATH).toString().split("\n");

    if (!ORDERFILE.includes(TARGET_ID)) {
        log.error(`identifier '${TARGET_ID}' does not exist as a change`);
        process.exit();
    }

    const TARGET_CHANGE = readChangeFromId(TARGET_ID);

    revertToChange(TARGET_CHANGE);
}
