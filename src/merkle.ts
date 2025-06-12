import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import path from "path";
import pinataSDK from "@pinata/sdk";
import "dotenv/config";

const main = async () => {
  try {
    // Check for Pinata credentials
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
      throw new Error("Pinata API Key and Secret must be set in the .env file");
    }

    // Initialize Pinata SDK
    const pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_API_SECRET
    );

    // Read addresses from the JSON file
    const addressesPath = path.join(__dirname, "..", "addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));

    // Create the Merkle tree
    const tree = StandardMerkleTree.of(
      addresses.map((address: string) => [address]),
      ["address"]
    );

    // Export the tree to a JSON file
    const treeJsonPath = path.join(__dirname, "..", "tree.json");
    fs.writeFileSync(treeJsonPath, JSON.stringify(tree.dump()));

    // Upload the tree to Pinata
    const readableStreamForFile = fs.createReadStream(treeJsonPath);
    const options = {
      pinataMetadata: {
        name: "merkle-tree",
      },
    };
    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);

    // Output the results
    console.log("Tree Root:", tree.root);
    console.log("Tree CID:", result.IpfsHash);

    // Update config.json
    const configPath = path.join(__dirname, "..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config.treeRoot = tree.root;
    config.treeCid = result.IpfsHash;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Updated config.json with new tree root and CID.");
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
