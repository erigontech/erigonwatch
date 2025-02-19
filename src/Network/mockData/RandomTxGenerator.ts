export type DiagTxn = {
	IDHash: string;
	SenderID: number;
	Nonce: number;
	Value: BigInt;
	Gas: number;
	FeeCap: BigInt;
	Tip: BigInt;
	Size: number;
	Type: number;
	Creation: boolean;
	DataLen: number;
	AccessListAddrCount: number;
	AccessListStorCount: number;
	BlobHashes: string[];
	Blobs: string[];
};

export type IncomingTxnUpdate = {
	Txns: DiagTxn[];
	Senders: string;
	IsLocal: boolean[];
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
		IDHash: randomBytesHex(32),
		SenderID: randomInt(1, 2 ** 32),
		Nonce: randomInt(1, 2 ** 32),
		Value: randomBigInt(32),
		Gas: randomInt(1000, 100000),
		FeeCap: randomBigInt(32),
		Tip: randomBigInt(32),
		Size: randomInt(100, 10000),
		Type: randomInt(0, 255),
		Creation: Math.random() < 0.5,
		DataLen: randomInt(0, 1000),
		AccessListAddrCount: randomInt(0, 100),
		AccessListStorCount: randomInt(0, 100),
		BlobHashes: Array.from({ length: randomInt(0, 5) }, () => randomBytesHex(32)),
		Blobs: Array.from({ length: randomInt(0, 5) }, () => randomBytesHex(32))
	};
}

function generateRandomIncomingTxnUpdate(txnCount: number): IncomingTxnUpdate {
	const txns = Array.from({ length: txnCount }, generateRandomDiagTxn);
	const senders = randomBytesHex(txnCount * 32);
	const isLocal = Array.from({ length: txnCount }, () => Math.random() < 0.5);

	return { Txns: txns, Senders: senders, IsLocal: isLocal };
}

export function randomIncommingTxnUpdate(): IncomingTxnUpdate {
	return generateRandomIncomingTxnUpdate(randomInt(1, 10));
}
