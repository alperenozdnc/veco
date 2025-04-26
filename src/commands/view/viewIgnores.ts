import fs from "fs";
import { IGNOREFILE_PATH } from "../../constants";
import { log, padLeft } from "../../utils";

export function viewIgnores() {
    if (!fs.existsSync(IGNOREFILE_PATH)) return log.error("no ignore file, create .vecoig file to see ignores");

    const IGNORES = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");
    IGNORES.pop();

    padLeft(IGNORES);
}
