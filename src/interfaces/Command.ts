export interface Command {
    callers: string[];
    action: Function;
    description: string;
    lock: boolean;
}

