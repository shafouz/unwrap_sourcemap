import { dirname } from "path";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { SourceMapConsumer } from "source-map";

type PathData = {
  raw: string;
  processed: string;
};

async function unwrap_file(source_data: string, output_dir: string) {
  const originalSources = await SourceMapConsumer.with(
    source_data,
    null,
    async (consumer) => {
      return consumer.sources.reduce(
        (acc, sourceUrl) =>
          Object.assign(Object.assign({}, acc), {
            [sourceUrl]: consumer.sourceContentFor(sourceUrl),
          }),
        {}
      );
    }
  );
  let files_array = Object.keys(originalSources);
  let node_modules_count = {};
  let files: PathData[] = [];
  for (const file of files_array) {
    files.push({
      raw: file,
      processed: "",
    });
    node_modules_count[file.indexOf("node_modules")] =
      node_modules_count[file.indexOf("node_modules")] + 1 || 0;
  }
  let node_modules_root = parseInt(
    Object.keys(node_modules_count)
      .filter((k) => k !== "-1")
      .sort()[0]
  );
  for (let path_data of files) {
    path_data.processed = `${output_dir}/${path_data.raw.substring(
      node_modules_root
    )}`;
    const directoryPath = dirname(path_data.processed);
    mkdirSync(directoryPath, { recursive: true });
    console.log("DEBUGPRINT[1]: app.ts:68: path_data=", path_data);
    writeFileSync(path_data.processed, originalSources[path_data.raw]);
  }
}

export { unwrap_file };
