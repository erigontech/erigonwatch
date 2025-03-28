export type DiagTxn = {
	rlp: string;
	hash: string;
	senderID: number;
	senderAddress: string;
	nonce: number;
	value: BigInt;
	gas: number;
	feeCap: BigInt;
	tip: BigInt;
	size: number;
	type: number;
	creation: boolean;
	dataLen: number;
	accessListAddrCount: number;
	accessListStorCount: number;
	blobHashes: string[] | null;
	blobs: string[] | null;
	isLocal: boolean;
	discardReason: string;
	pool: string;
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
	return {
		rlp: randomBytesHex(32),
		hash: randomBytesHex(32),
		senderID: randomInt(1, 2 ** 32),
		nonce: randomInt(1, 2 ** 32),
		value: randomBigInt(32),
		gas: randomInt(3000, 300000),
		feeCap: randomFeeCap(),
		tip: randomTip(),
		size: randomInt(100, 10000),
		type: randomInt(0, 255),
		creation: Math.random() < 0.5,
		dataLen: randomInt(0, 1000),
		accessListAddrCount: randomInt(0, 100),
		accessListStorCount: randomInt(0, 100),
		blobHashes: Array.from({ length: randomInt(0, 5) }, () => randomBytesHex(32)),
		blobs: Array.from({ length: randomInt(0, 5) }, () => randomBytesHex(32)),
		isLocal: Math.random() < 0.5,
		discardReason: Math.random() < 0.5 ? "Unknown" : "",
		pool: (() => {
			const rand = Math.random();
			if (rand < 0.33) return "Pending";
			if (rand < 0.66) return "BaseFee";
			return "Queued";
		})()
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
	const knownTxns: string[][] = [];
	for (let i = 0; i < txns.length; i++) {
		if (Math.random() < 0.5) {
			knownTxns.push([txns[i].hash]);
		} else {
			txnsToAdd.push(txns[i]);
		}
	}

	const senders = randomBytesHex(txnsToAdd.length * 32);
	const isLocal = Array.from({ length: txnsToAdd.length }, () => Math.random() < 0.5);

	return { txns: txnsToAdd, senders: senders, isLocal: isLocal, knownTxns: knownTxns };
}

export function randomIncommingTxnUpdate(): IncomingTxnUpdate {
	return generateRandomIncomingTxnUpdate(randomInt(1, 3));
}
