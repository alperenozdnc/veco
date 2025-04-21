import { File, Difference } from "../../interfaces";

export function compareTwoTrees(treeA: File[], treeB: File[]): Difference[] | null {
    if (JSON.stringify(treeA) === JSON.stringify(treeB)) {
        return null;
    }

    const differences: Difference[] = [];
    let supposedTreeBLength = treeA.length;

    for (const fileA of treeA) {
        const { path: pathA, content: contentA } = fileA;
        const fileB = treeB.find(({ path: pathB }) => pathA === pathB);

        if (!fileB) {
            differences.push({ operation: "DEL", file: fileA });
            supposedTreeBLength--;

            continue;
        }

        if (contentA !== fileB.content) {
            differences.push({ operation: "MOD", file: fileA, newFile: fileB });
            continue;
        }
    }

    if (treeB.length > supposedTreeBLength) {
        for (const fileB of treeB) {
            const { path: pathB } = fileB;
            const fileA = treeA.find(({ path: pathA }) => pathA === pathB);

            if (fileA) continue;

            differences.push({ operation: "INIT", file: fileB });
        }
    }

    return differences.length > 0 ? differences : null;
}
