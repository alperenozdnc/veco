import fs from "fs";
import { CheckVecoDirectory, HandleYesNoInput, log } from "../../utils";

export function CreateProject(args: string[]) {
    let path = args[0];

    if (!path) {
        const PATH_IS_CURR_DIR = HandleYesNoInput("No path given, assuming current directory?");

        if (PATH_IS_CURR_DIR) {
            path = process.cwd();
        } else {
            console.log("Aborting...");
            return;
        }
    }

    if (path === ".") path = process.cwd();

    if (!fs.existsSync(path)) return log.error(`invalid directory ${path}`);

    if (!fs.statSync(path).isDirectory()) return log.error(`${path} is not a directory`)

    if (path.endsWith("/")) path = path.slice(0, -1);

    let pathToCheck = path;

    if (path !== process.cwd()) pathToCheck = `${process.cwd()}/${path}`

    if (CheckVecoDirectory(pathToCheck)) {
        return log.error(`there is already a project in target or inside a parent`);
    }

    const VECO_PATH = `${path}/.veco`
    const REF_DIR = `${VECO_PATH}/ref`;

    fs.mkdirSync(VECO_PATH);
    fs.mkdirSync(`${VECO_PATH}/changes`)
    fs.mkdirSync(`${VECO_PATH}/dates`)
    fs.mkdirSync(`${VECO_PATH}/messages`)
    fs.mkdirSync(REF_DIR);

    // making a tmp copy because you cant copy to a subdirectory
    if (fs.existsSync("/tmp/ref")) { fs.rmSync("/tmp/ref", { recursive: true, force: true }) };

    fs.cpSync(process.cwd(), "/tmp/ref", { recursive: true });
    fs.cpSync("/tmp/ref", REF_DIR, { recursive: true });

    fs.rmSync(`${REF_DIR}/.veco`, { recursive: true, force: true })

    fs.writeFileSync(`${VECO_PATH}/focus`, "");

    console.log("Successfully created project.");
    console.log("'veco help' to see what commands you can use.");
}
