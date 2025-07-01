import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { readJsonFile, writeJsonFile, pinJsonToIpfs } from "./utils";

const main = async () => {
  try {
    // Read addresses from the JSON file
    const addresses = readJsonFile<string[]>("../addresses.json");

    // Create the Merkle tree
    const tree = StandardMerkleTree.of(
      addresses.map((address: string) => [address]),
      ["address"]
    );

    // Upload the tree to Pinata
    const treeCid = await pinJsonToIpfs(tree.dump(), "merkle-tree-ics");

    // Output the results
    console.log("Tree Root:", tree.root);
    console.log("Tree CID:", treeCid);

    // Update config.json
    const config = {
      treeRoot: tree.root,
      treeCid,
    };
    writeJsonFile("../tmp/config-ics.json", config);
    console.log("Updated tmp/config-ics.json with new tree root and CID.");
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
