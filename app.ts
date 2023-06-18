import { readFileSync } from "fs";
import { unwrap_file } from "./src/unwrap_file";

if (process.argv.length < 3) {
  console.error("Please provide a filename and a output_dir argument.");
  process.exit(1);
}

const output_dir = process.argv[2];
// console.log("DEBUGPRINT[4]: app.ts:10: output_dir=", output_dir);

let stdinBuffer = readFileSync(0);
let lines: string[] = stdinBuffer.toString().split("\n");

for (const line of lines) {
  unwrap_file(line, output_dir);
}
