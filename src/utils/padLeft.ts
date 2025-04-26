export function padLeft(lines: string[], padWidth = 2) {
    for (const line of lines) {
        console.log(`${" ".repeat(padWidth)}${line}`);
    }
}
