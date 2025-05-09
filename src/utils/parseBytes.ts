export function parseBytes(bytes: number) {
    if (bytes == 0) return "n/a";

    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i == 0) return bytes + " " + sizes[i];

    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}
