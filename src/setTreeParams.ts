import * as fs from "fs";
import * as path from "path";

import util from "node:util";
import child_process from "node:child_process";
const exec = util.promisify(child_process.exec);

const trim = (str: string) => str.replace(/^[\s"]+|[\s"]+$/g, "");

// --- Types ---
interface TreeConfig {
  contract: string;
  treeRoot: string;
  treeCid: string;
}

// --- Script Logic ---

// Read and parse the JSON config file
const configPath = path.resolve(__dirname, "../config.json");
const configFile = fs.readFileSync(configPath, "utf-8");
const config: TreeConfig = JSON.parse(configFile);

const { contract, treeRoot, treeCid } = config;

// Check if all required values are present
if (!contract || !treeRoot || !treeCid) {
  console.error(
    "Error: Missing required values in tree.json. Please ensure contract, sender, treeRoot, and treeCid are all present."
  );
  process.exit(1);
}

const getSender = async () => {
  const { stdout: role } = await exec(
    `cast call ${contract} "SET_TREE_ROLE()"`
  );
  let { stdout: sender } = await exec(
    `cast call ${contract} "getRoleMember(bytes32,uint256)(address)" ${trim(
      role
    )} 0`
  );
  sender = trim(sender);
  await exec(`cast rpc anvil_setBalance ${sender} "0x21E19E0C9BAB2400000"`);
  const { stdout: balance } = await exec(`cast balance ${sender}`);
  console.log("---");
  console.log(`sender: ${sender}, balance: ${balance}`);
  return sender;
};

const getRoot = async () => {
  let { stdout: currentTreeCid } = await exec(
    `cast call "${contract}" "treeCid()(string)"`
  );
  let { stdout: currentTreeRoot } = await exec(
    `cast call "${contract}" "treeRoot()(bytes32)"`
  );
  currentTreeCid = trim(currentTreeCid);
  currentTreeRoot = trim(currentTreeRoot);
  if (currentTreeCid === treeCid || currentTreeRoot === treeRoot) {
    console.error(
      `No changes needed. Current treeCid: ${currentTreeCid}, treeRoot: ${currentTreeRoot}`
    );
    process.exit(1);
  }
  console.log("---");
  console.log(
    `current treeRoot: ${currentTreeRoot}, treeCid: ${currentTreeCid}`
  );
  console.log(`new treeRoot: ${treeRoot}, treeCid: ${treeCid}`);
};

const setRoot = async (sender: string) => {
  await exec(`cast rpc anvil_impersonateAccount "${sender}"`);

  const { stderr, stdout } = await exec(
    `cast send "${contract}" "setTreeParams(bytes32,string)" "${treeRoot}" "${treeCid}" --from "${sender}" --unlocked`
  );
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  } else {
    console.log(`stdout: ${stdout}`);
    console.log("Command executed successfully.");
  }
};

const main = async () => {
  await getRoot();
  const sender = await getSender();
  setRoot(sender);
};

main();
