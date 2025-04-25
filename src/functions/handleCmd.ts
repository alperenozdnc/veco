import { Action } from "../interfaces";
import { checkVecoDir, log } from "../utils";

export function handleCmd(actions: Action[], cmd: string, cmdType: "create" | "delete" | "view") {
    const isProject = checkVecoDir();

    if (isProject || cmdType === "create" && cmd === "project") {
        for (const action of actions) {
            if (action.name === cmd) return action.run();
        }

        log.error(`invalid ${cmdType} action '${cmd}'`);
        log.usage(`veco %cmd0 %arg0`, [cmdType], [actions.map(action => action.name)], []);
    } else {
        log.error(`no veco project found in this or any parent directories`);
        console.log(`\nYou must run ${cmdType} commands inside a project.`);
        log.usage(`veco %cmd0 %cmd1 to create a project`, ["create", "project"], [], []);
    }
}

