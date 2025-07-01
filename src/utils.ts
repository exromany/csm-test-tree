import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pinataSDK from "@pinata/sdk";
import util from "node:util";
import child_process from "node:child_process";

const exec = util.promisify(child_process.exec);

export const trim = (str: string): string =>
  str.replace(/^[\s"]+|[\s"]+$/g, "");

export const readJsonFile = <T>(filePath: string, skipResolve?: boolean): T => {
  if (!skipResolve) {
    filePath = path.resolve(__dirname, filePath);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent) as T;
};

export const writeJsonFile = (filePath: string, data: unknown): void => {
  filePath = path.resolve(__dirname, filePath);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const pinJsonToIpfs = async (
  data: unknown,
  metadataName: string
): Promise<string> => {
  // Check for Pinata credentials
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
    throw new Error("Pinata API Key and Secret must be set in the .env file");
  }

  const pinata = new pinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_API_SECRET
  );
  const options = {
    pinataMetadata: {
      name: metadataName,
    },
  };
  const result = await pinata.pinJSONToIPFS(data, options);
  return result.IpfsHash;
};

export const executeCommand = async (
  command: string
): Promise<{ out: string; err: string }> => {
  const { stdout, stderr } = await exec(command);
  return { out: trim(stdout), err: stderr };
};

export interface TreeConfig {
  treeRoot: string;
  treeCid: string;
}

export const getTreeConfig = (configPath: string): TreeConfig => {
  return readJsonFile<TreeConfig>(configPath);
};

export const getContractAddress = (contractName: string): string => {
  const deployJsonPath = process.env.DEPLOY_JSON_PATH;
  if (!deployJsonPath) {
    console.error(`Error: DEPLOY_JSON_PATH env variable not set.`);
    process.exit(1);
  }
  const deployConfig = readJsonFile<{ [key: string]: string }>(
    deployJsonPath,
    true
  );
  const contractAddress = deployConfig[contractName];
  if (!contractAddress) {
    console.error(`Error: ${contractName} not found in ${deployJsonPath}`);
    process.exit(1);
  }
  return contractAddress;
};
