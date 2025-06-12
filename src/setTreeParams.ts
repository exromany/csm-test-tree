import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

// --- Types ---
interface TreeConfig {
  contract: string;
  sender: string;
  treeRoot: string;
  treeCid: string;
}

// --- Script Logic ---

// Read and parse the JSON config file
const configPath = path.resolve(__dirname, "../config.json");
const configFile = fs.readFileSync(configPath, "utf-8");
const config: TreeConfig = JSON.parse(configFile);

const { contract, sender, treeRoot, treeCid } = config;

// Check if all required values are present
if (!contract || !sender || !treeRoot || !treeCid) {
  console.error(
    "Error: Missing required values in tree.json. Please ensure contract, sender, treeRoot, and treeCid are all present."
  );
  process.exit(1);
}

// Construct the cast send command
const impersonate = `cast rpc anvil_impersonateAccount "${sender}"`;
const command = `${impersonate} && cast send "${contract}" "setTreeParams(bytes32,string)" "${treeRoot}" "${treeCid}" --from "${sender}" --unlocked`;

// Execute the command
console.log("Executing command:", command);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log("Command executed successfully.");
});
