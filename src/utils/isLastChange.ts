import fs from "fs";

import { log } from "../utils";
import { ORDERFILE_PATH } from "../constants";

export function isLastChange(ID: string): boolean {
    if (!fs.existsSync(ORDERFILE_PATH)) {
        log.error("no changes to view");
        return false;
    }

    const ORDER = fs.readFileSync(ORDERFILE_PATH).toString().split("\n");
    ORDER.pop();

    return ORDER[ORDER.length - 1] === ID;
}
