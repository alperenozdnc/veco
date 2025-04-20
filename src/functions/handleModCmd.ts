import { Action } from "../interfaces";
import { checkVecoDir, log } from "../utils";

export function handleModCmd(actions: Action[], cmd: string, modType: "create" | "delete") {
    const isProject = checkVecoDir();

    if (isProject || modType === "create" && cmd === "project") {
        for (const action of actions) {
            if (action.name === cmd) return action.run();
        }

        log.error(`invalid ${modType} action '${cmd}'`);
        console.log(`Usage: '${modType} {${actions.map((action) => action.name).join("|")}}'`)
    } else {
        log.error(`no veco project found in this or any parent directories`);
        console.log(`\nYou must run ${modType} commands inside a project.`);
        console.log("'veco create project' to create a project.");
    }
}

