import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { readJsonFile, writeJsonFile, pinJsonToIpfs } from "./utils";

const main = async () => {
  try {
    // Read strikes from the JSON file
    const strikes = readJsonFile<
      {
        nodeOperatorId: number;
        pubkey: string;
        strikes: number[];
      }[]
    >("../strikes.json").map((item) => [
      item.nodeOperatorId,
      item.pubkey,
      item.strikes,
    ]);

    // Create the Merkle tree
    const tree = StandardMerkleTree.of(strikes, [
      "uint256",
      "string",
      "uint256[]",
    ]);

    // Upload the tree to Pinata
    const treeCid = await pinJsonToIpfs(tree.dump(), "merkle-tree-strikes");

    // Output the results
    console.log("Tree Root:", tree.root);
    console.log("Tree CID:", treeCid);

    // Update config.json
    const config = {
      treeRoot: tree.root,
      treeCid,
    };
    writeJsonFile("../tmp/config-strikes.json", config);
    console.log("Updated tmp/config-strikes.json with new tree root and CID.");
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
