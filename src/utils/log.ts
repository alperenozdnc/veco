interface TokenMap {
    prefix: string;
    format: Function;
}

function formatParameter(param: string | string[], wrapper: [string, string]) {
    const middle = typeof param === "string" ? param : param.join("/")

    return `${wrapper[0]}${middle}${wrapper[1]}`;
}

export const log = {
    warning: (msg: string) => console.log(`\u001b[33m[WARNING]: ${msg}\u001b[0m`),
    error: (msg: string) => console.log(`\x1b[31m[ERROR]: ${msg}\x1b[0m`),
    usage: (msg: string, commands: string[], args: (string | string[])[], options: (string | string[])[]) => {
        const TOKEN_MAP: TokenMap[] = [
            { prefix: "%arg", format: (i: number) => formatParameter(args[i], ["{", "}"]) },
            { prefix: "%cmd", format: (i: number) => commands[i] ?? "[missing]" },
            { prefix: "%opt", format: (i: number) => formatParameter(options[i], ["<", ">"]) }
        ];

        const output = msg
            .split(" ")
            .map(token => {
                const map = TOKEN_MAP.find(m => token.startsWith(m.prefix));

                if (map) {
                    const idx = Number(token.replace(map.prefix, ""));

                    return map.format(idx);
                }

                return token;
            })
            .join(" ");

        console.log(`[USAGE]: '\x1b[1;32m${output}\x1b[0m'`);
    }
};
