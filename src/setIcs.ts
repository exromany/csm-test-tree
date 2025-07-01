import { getTreeConfig, getContractAddress, executeCommand } from "./utils";

// --- Script Logic ---

const { treeRoot, treeCid } = getTreeConfig("../tmp/config-ics.json");
const contract = getContractAddress("VettedGate");

// Check if all required values are present
if (!contract || !treeRoot || !treeCid) {
  console.error(
    "Error: Missing required values. Please ensure contract, treeRoot, and treeCid are all present."
  );
  process.exit(1);
}

const getSender = async () => {
  const { out: role } = await executeCommand(
    `cast call ${contract} "SET_TREE_ROLE()"`
  );
  let { out: sender } = await executeCommand(
    `cast call ${contract} "getRoleMember(bytes32,uint256)(address)" ${role} 0`
  );
  await executeCommand(
    `cast rpc anvil_setBalance ${sender} "0x21E19E0C9BAB2400000"`
  );
  const { out: balance } = await executeCommand(`cast balance ${sender}`);
  console.log("---");
  console.log(`sender: ${sender}, balance: ${balance}`);
  return sender;
};

const getRoot = async () => {
  let { out: currentTreeCid } = await executeCommand(
    `cast call "${contract}" "treeCid()(string)"`
  );
  let { out: currentTreeRoot } = await executeCommand(
    `cast call "${contract}" "treeRoot()(bytes32)"`
  );
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
  await executeCommand(`cast rpc anvil_impersonateAccount "${sender}"`);

  const { err, out } = await executeCommand(
    `cast send "${contract}" "setTreeParams(bytes32,string)" "${treeRoot}" "${treeCid}" --from "${sender}" --unlocked`
  );
  if (err) {
    console.error(`stderr: ${err}`);
    return;
  } else {
    console.log(`stdout: ${out}`);
    console.log("Command executed successfully.");
  }
};

const main = async () => {
  await getRoot();
  const sender = await getSender();
  setRoot(sender);
};

main();
