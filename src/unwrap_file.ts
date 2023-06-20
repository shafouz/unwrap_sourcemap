import { dirname } from "path";
import { writeFileSync, mkdirSync } from "fs";
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
  let files: PathData[] = [];

  for (const file of files_array) {
    let path_data: PathData = {
      raw: file,
      processed: "",
    };

    files.push(path_data);
  }

  const files_final = format_path_data(files, output_dir);
  // for (let file of files_final) {
  //   console.log(file);
  // }

  for (let path_data of files_final) {
    const directoryPath = dirname(path_data.processed);
    mkdirSync(directoryPath, { recursive: true });

    try {
      // console.log(originalSources.raw);
      writeFileSync(path_data.processed, originalSources[path_data.raw]);
    } catch {}
  }

  // for (const file of files_array) {
  //   console.log(file);
  // }
}

// function handle_processed(files: PathData[], output_dir: string) { }

function format_path_data(files: PathData[], output_dir: string) {
  let node_modules_index = get_node_modules_index_for_set(files);
  let protocol_index = get_protocol_prefix_for_set(files);
  let slash_count = get_slash_count_for_set(
    files,
    node_modules_index,
    protocol_index
  );

  let ret: PathData[];

  // console.log("DEBUGPRINT[4]: unwrap_file.ts:69: slash_count=", slash_count);
  if (slash_count == 0) {
    ret = handle_multirepo(files, output_dir, protocol_index);
  } else {
    ret = handle_monorepo(files, output_dir, node_modules_index);
  }

  return ret;
}

function get_node_modules_index_for_set(files: PathData[]): number {
  let node_modules_count = {};

  for (let file of files) {
    node_modules_count[file.raw.indexOf("node_modules")] =
      node_modules_count[file.raw.indexOf("node_modules")] + 1 || 0;
  }

  let keys = Object.keys(node_modules_count)
    .filter((k) => k !== "-1")
    .sort();

  let node_modules_root = parseInt(keys[0]);

  return node_modules_root;
}

function get_protocol_prefix_for_set(files: PathData[]): number {
  let protocol_prefix = {};

  for (let file of files) {
    protocol_prefix[file.raw.indexOf("://") + 3] =
      protocol_prefix[file.raw.indexOf("://") + 3] + 1 || 0;
  }

  let keys = Object.keys(protocol_prefix)
    .filter((k) => k !== "-1")
    .sort();

  console.log(
    "DEBUGPRINT[10]: unwrap_file.ts:108: files[keys[0]]=",
    files[keys[0]]
  );
  console.log("DEBUGPRINT[9]: unwrap_file.ts:107: keys=", keys);
  let protocol_prefix_root = parseInt(keys[0]);

  return protocol_prefix_root;
}

function get_slash_count_for_set(
  files: PathData[],
  protocol_index: number,
  node_modules_index: number
): number {
  let slash_count = {};
  // let dbg = {};

  for (const file of files) {
    let slice = file.raw.slice(protocol_index, node_modules_index);
    let amount_of_slashes = slice.split("/").length - 1;
    slash_count[amount_of_slashes] = slash_count[amount_of_slashes] + 1 || 0;

    // dbg[amount_of_slashes] = {
    //   slice: slice,
    //   slash_count: slash_count[amount_of_slashes] + 1 || 0,
    // };
  }

  // console.log("DEBUGPRINT[7]: unwrap_file.ts:134: dbg=", dbg);
  let slash = parseInt(Object.keys(slash_count).sort()[0]);

  return slash;
}

function handle_monorepo(
  files: PathData[],
  output_dir: string,
  node_modules_root: number
) {
  files.map((file) => {
    file.processed = `${output_dir}/${file.raw.substring(
      node_modules_root
    )}`.replace(/\.\.\//g, "");
  });

  return files;
}

function handle_multirepo(
  files: PathData[],
  output_dir: string,
  protocol_prefix: number
) {
  files.map((file) => {
    file.processed = `${output_dir}/${file.raw.substring(
      protocol_prefix
    )}`.replace(/\.\.\//g, "");
  });

  return files;
}

export { unwrap_file };
