import { JsonRpcProvider, Web3Provider } from 'ethers/providers';
import { isUrl, colors} from 'etherlime-utils';
import { logger } from 'etherlime-logger';

import PrivateKeyDeployer from './../private-key-deployer';
import { txParams, JSONRPCGlobal } from '../../types/types';

const COVERAGE_PROVIDER_INDEX = 1; // This is the index of the desired provider located in global.providers. We have two providers there: one for coverage which is listening for blocks and one for deploying contracts
declare const global: JSONRPCGlobal;

class JSONRPCPrivateKeyDeployer extends PrivateKeyDeployer {

	/**
	 *
	 * Instantiates new deployer based on the JSONRPC Provider Address (for example: 'http://localhost:8545/') and private key based deployment wallet/signer instance
	 *
	 * @param {*} privateKey the private key for the deployer wallet/signer instance
	 * @param {*} nodeUrl url of the network to deploy on. This is the node url address that is given to the class
	 * @param {*} defaultOverrides [Optional] default deployment overrides
	 */
	
	nodeUrl: string

	constructor(privateKey: string, nodeUrl: string, defaultOverrides?: txParams) {
		let localNodeProvider: JsonRpcProvider | Web3Provider;
		JSONRPCPrivateKeyDeployer._validateUrlInput(nodeUrl);
		if (global.coverageSubprovider) {
			global.provider._providers[COVERAGE_PROVIDER_INDEX].rpcUrl = nodeUrl;
			localNodeProvider = new Web3Provider(global.provider);
			localNodeProvider.connection.url = nodeUrl;
		} else {
			localNodeProvider = new JsonRpcProvider(nodeUrl);
		}
		
		super(privateKey, localNodeProvider, defaultOverrides);
		this.nodeUrl = nodeUrl;

		logger.log(`JSONRPC Deployer Network: ${colors.colorNetwork(this.nodeUrl)}`);
	}

	setNodeUrl(nodeUrl: string): void {
		JSONRPCPrivateKeyDeployer._validateUrlInput(nodeUrl);

		const localNodeProvider = new JsonRpcProvider(nodeUrl);
		this.setProvider(localNodeProvider);
		this.nodeUrl = nodeUrl;
	}

	static _validateUrlInput(nodeUrl: string): void {
		if (!(isUrl(nodeUrl))) {
			throw new Error(`Passed contract url (${nodeUrl}) is not valid url`);
		}
	}

	toString(): string {
		const superString = super.toString();
		return `Network: ${colors.colorNetwork(this.nodeUrl)}\n${superString}`;
	}
}

export default JSONRPCPrivateKeyDeployer;
