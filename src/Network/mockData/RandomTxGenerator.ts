import { Transaction } from "ethers";

export type DiagTxn = {
	rlp: string;
	senderID: number;
	size: number;
	creation: boolean;
	dataLen: number;
	accessListAddrCount: number;
	accessListStorCount: number;
	blobHashes: string[] | null;
	isLocal: boolean;
	discardReason: string;
	pool: string;
	tx: Transaction;
};

export type IncomingTxnUpdate = {
	txns: DiagTxn[];
	updates: { [key: string]: string[][] }; // Converted [32]byte array to string representation in JS
};

function randomBytesHex(length: number): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomBigInt(bytes: number): bigint {
	return BigInt("0x" + randomBytesHex(bytes));
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDiagTxn(): DiagTxn {
	let rndtx = Transaction.from({
		type: 2,
		nonce: randomInt(0, 1000),
		maxFeePerGas: randomFeeCap(),
		maxPriorityFeePerGas: randomTip(),
		gasLimit: BigInt(randomInt(21000, 1000000)),
		to: "0x" + randomBytesHex(20),
		value: randomBigInt(32),
		data: "0x" + randomBytesHex(randomInt(0, 1000)),
		chainId: BigInt(randomInt(1, 1000))
	});

	let rlp = rndtx.serialized;

	return {
		rlp: randomBytesHex(32),
		senderID: randomInt(1, 2 ** 32),
		size: randomInt(100, 10000),
		creation: Math.random() < 0.5,
		dataLen: randomInt(0, 1000),
		accessListAddrCount: randomInt(0, 100),
		accessListStorCount: randomInt(0, 100),
		blobHashes: Array.from({ length: randomInt(0, 5) }, () => randomBytesHex(32)),
		isLocal: Math.random() < 0.5,
		discardReason: Math.random() < 0.5 ? "Unknown" : "",
		pool: (() => {
			const rand = Math.random();
			if (rand < 0.33) return "Pending";
			if (rand < 0.66) return "BaseFee";
			return "Queued";
		})(),
		tx: rndtx
	};
}

// random tip should be in range from 1000000000 to 1500000000
function randomTip(): bigint {
	return BigInt(Math.floor(1000000000 + Math.random() * 500000000));
}

//random fee cap range 100000000000 to 250000000000
function randomFeeCap(): bigint {
	return BigInt(Math.floor(2500000000 + Math.random() * 5000000000));
}

function generateRandomIncomingTxnUpdate(txnCount: number): IncomingTxnUpdate {
	const txns = Array.from({ length: txnCount }, generateRandomDiagTxn);
	const txnsToAdd: DiagTxn[] = [];
	for (let i = 0; i < txns.length; i++) {
		txnsToAdd.push(txns[i]);
	}

	return { txns: txnsToAdd, updates: {} };
}

export function randomIncommingTxnUpdate(): IncomingTxnUpdate {
	return generateRandomIncomingTxnUpdate(randomInt(1, 3));
}

export function generateRandomTxns(count: number): Transaction[] {
	const knownTxns: string[] = [];
	const txns: Transaction[] = [];
	for (let i = 0; i < count; i++) {
		const diagTxn = generateRandomDiagTxn();
		knownTxns.push(diagTxn.rlp);
		txns.push(
			Transaction.from({
				type: 2, // EIP-1559 transaction
				nonce: randomInt(0, 1000),
				maxFeePerGas: randomFeeCap(),
				maxPriorityFeePerGas: randomTip(),
				gasLimit: BigInt(randomInt(21000, 1000000)),
				to: "0x" + randomBytesHex(20),
				value: randomBigInt(32),
				data: "0x" + randomBytesHex(randomInt(0, 1000)),
				chainId: BigInt(randomInt(1, 1000))
			})
		);
	}
	return txns;
}
