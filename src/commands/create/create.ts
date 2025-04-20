import { checkVecoDir, log } from "../../utils";
import { createChange } from "./createChange";
import { createIgnore } from "./createIgnore";
import { createProject } from "./createProject";

interface CreateAction {
    name: string;
    run: Function;
}

export function create(args: string[]) {
    const restOfArgs = args.slice(1);

    const actions: CreateAction[] = [
        { name: "project", run: () => createProject(restOfArgs) },
        { name: "change", run: () => createChange(restOfArgs) },
        { name: "ignore", run: () => createIgnore(restOfArgs) },
    ]

    const actionInput: string = args[0];
    const isProject = checkVecoDir();

    if (isProject || actionInput === "project") {
        for (const action of actions) {
            if (action.name === actionInput) return action.run();
        }

        // throw error if invalid create action
        log.error(`invalid create action '${actionInput}'`);
        console.log(`Usage: 'create {${actions.map((action) => action.name).join("|")}}'`)
    } else {
        log.error(`no veco project found in this or any parent directories`);
        console.log("\nYou must run create commands inside a project.");
        console.log("'veco create project' to create a project.");
    }
}
