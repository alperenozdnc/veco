interface CreateAction {
    name: string;
    run: Function;
}

export function Create(args: string[]) {
    const actions: CreateAction[] = [
        { name: "project", run: () => { } },
        { name: "change", run: () => { } },
        { name: "ignore", run: () => { } },
    ]

    const actionInput = args[0];

    for (const action of actions) {
        if (action.name === actionInput) {
            action.run();
            return;
        }
    }

    console.log(`Create action "${actionInput}" does not exist.`);
    console.log(`Use 'create {${actions.map((action) => action.name).join("|")}}'`)
}
