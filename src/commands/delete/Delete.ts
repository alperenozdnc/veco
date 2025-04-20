import { checkVecoDir, log } from "../../utils";
import { deleteIgnore } from "./deleteIgnore";
import { deleteProject } from "./deleteProject";

interface DeleteAction {
    name: string;
    run: Function;
}

export function Delete(args: string[]) {
    const restOfArgs = args.slice(1);

    const actions: DeleteAction[] = [
        { name: "project", run: () => deleteProject() },
        { name: "change", run: () => { } },
        { name: "ignore", run: () => { deleteIgnore(restOfArgs) } },
    ]

    const actionInput: string = args[0];
    const isProject = checkVecoDir();

    if (isProject) {
        for (const action of actions) {
            if (action.name === actionInput) return action.run();
        }

        // throw error if invalid create action
        log.error(`invalid delete action '${actionInput}'`);
        console.log(`Usage: 'delete {${actions.map((action) => action.name).join("|")}}'`)
    } else {
        log.error(`no veco project found in this or any parent directories`);
        console.log("\nYou must run delete commands inside a project.");
        console.log("'veco create project' to create a project.");
    }
}
