export const log = {
    warning: (msg: string) => console.log(`\u001b[33m[WARNING]: ${msg}\u001b[0m`),
    error: (msg: string) => console.log(`\x1b[31m[ERROR] ${msg}\x1b[0m`)
}
