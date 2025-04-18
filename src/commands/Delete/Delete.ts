import { CheckVecoDirectory, LogError } from "../../utils";

interface DeleteAction {
    name: string;
    run: Function;
}

export function Delete(args: string[]) {
    const actions: DeleteAction[] = [
        { name: "project", run: () => { } },
        { name: "change", run: () => { } },
        { name: "ignore", run: () => { } },
    ]

    const actionInput: string = args[0];
    const isProject = CheckVecoDirectory();

    if (isProject) {
        for (const action of actions) {
            if (action.name === actionInput) return action.run();
        }

        // throw error if invalid create action
        LogError(`invalid delete action '${actionInput}'`);
        console.log(`Usage: 'delete {${actions.map((action) => action.name).join("|")}}'`)
    } else {
        LogError(`no veco project found in this or any parent directories`);
        console.log("\nYou must run delete commands inside a project.");
        console.log("'veco create project' to create a project.");
    }
}
