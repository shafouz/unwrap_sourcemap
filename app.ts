import { readFileSync } from "fs";
import { unwrap_file } from "./src/unwrap_file";

if (process.argv.length < 3) {
  console.error("Please provide a filename argument.");
  process.exit(1);
}

const filename = process.argv[2];

let lines = readFileSync(filename, "utf8");

for (const line of lines) {
  unwrap_file(line);
}
