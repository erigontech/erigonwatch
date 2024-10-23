import {
	DownloadedStats,
	SegmentPeer,
	SnapshotDownloadStatus,
	SnapshotIndexingStatus,
	SnapshotSegmentDownloadStatus,
	SnapshotSegmentIndexStatus
} from "../app/store/syncStagesSlice";

export const snapshotDownloadStatusFromJson = (
	json: any,
	prevStatus: SnapshotDownloadStatus | undefined,
	indexingStatus: SnapshotIndexingStatus
): SnapshotDownloadStatus => {
	let segs: SnapshotSegmentDownloadStatus[] = [];

	for (let key in json["segmentsDownloading"]) {
		let indexed = segmentIndexingPercent(key, indexingStatus);
		if (key.includes("beaconblocks")) {
			indexed = 100;
		}
		segs.push(jsonToSegment(json["segmentsDownloading"][key], indexed, key));
	}

	let downloadFinished: boolean = prevStatus?.downloadFinished || false;

	if (!downloadFinished) {
		let notFinished = false;
		for (let seg of segs) {
			if (seg.downloadedBytes < seg.totalBytes) {
				notFinished = true;
				break;
			}
		}

		if (!notFinished) {
			downloadFinished = true;
		}
	}

	let indexingFinished: boolean = prevStatus?.indexingFinished || false;

	let indexed = 100;
	if (!indexingFinished) {
		indexed = 0;
		let notFinished = false;
		for (let seg of segs) {
			indexed += seg.indexed;
			if (seg.indexed < 100) {
				notFinished = true;
			}
		}

		if (!notFinished) {
			indexed = 100;
			indexingFinished = true;
		} else {
			indexed = indexed / segs.length;
		}
	}

	if (indexingFinished) {
		console.log("indexing finished");
	}

	let ttarr: number[] = Array.from(prevStatus?.totalTime || [0]);
	let ntt = json.totalTime;
	let ott = ttarr[ttarr.length - 1] || 0;
	if (ott > ntt) {
		ttarr.push(ntt);
	} else {
		if (ttarr.length > 0) {
			ttarr[ttarr.length - 1] = ntt;
		} else {
			ttarr.push(ntt);
		}
	}

	return {
		downloaded: json.downloaded,
		total: json.total,
		totalTime: ttarr,
		downloadRate: json.downloadRate,
		uploadRate: json.uploadRate,
		peers: json.peers,
		files: json.files,
		connections: json.connections,
		alloc: json.alloc,
		sys: json.sys,
		downloadFinished: downloadFinished,
		segments: segs,
		indexingFinished: indexingFinished,
		indexed: indexed,
		torrentMetadataReady: json.torrentMetadataReady,
		diagramData: []
	};
};

const segmentIndexingPercent = (name: string, indexingStatus: SnapshotIndexingStatus): number => {
	let segment = indexingStatus.segments.find((seg) => seg.name === name);
	if (segment) {
		return segment.progress;
	}

	return 0;
};

const jsonToSegment = (json: any, indexed: number, name: string): SnapshotSegmentDownloadStatus => {
	return {
		name: name,
		totalBytes: json.totalBytes,
		downloadedBytes: json.downloadedBytes,
		webseeds: peersFromJson(json.webseeds),
		peers: peersFromJson(json.peers),
		indexed: indexed,
		downloadedStats: downloadedStatsFromJson(json?.downloadedStats)
	};
};

const downloadedStatsFromJson = (json: any): DownloadedStats | null => {
	if (json) {
		return {
			timeTook: json?.timeTook,
			averageRate: json?.averageRate
		};
	} else {
		return null;
	}
};

const peersFromJson = (json: any): SegmentPeer[] => {
	if (json) {
		let peers: SegmentPeer[] = [];

		json.forEach((val: any) => {
			peers.push({
				url: val.url,
				downloadRate: val.downloadRate,
				uploadRate: val.uploadRate,
				remoteAddr: val.remoteAddr,
				peerId: val.peerId,
				piecesCount: val.piecesCount,
				torrentName: val.torrentName
			});
		});
		return peers;
	} else {
		return [];
	}
};

export const snapshotIndexStatusFromJson = (json: any, segmentsCount: number): SnapshotIndexingStatus => {
	let segments: SnapshotSegmentIndexStatus[] = [];

	let progress = 0;
	if (json["segments"] !== null) {
		for (let key in json["segments"]) {
			let segment: SnapshotSegmentIndexStatus = snapshotSegmentIndexStatusFromJson(json["segments"][key]);
			segments.push(segment);

			progress += segment.progress;
		}
	}

	if (segments.length > 0) {
		progress = progress / segmentsCount;
	}

	let ttarr: number[] = [0];
	let ntt = json.timeElapsed;
	let ott = ttarr[ttarr.length - 1] || 0;
	if (ott > ntt) {
		ttarr.push(ntt);
	} else {
		if (ttarr.length > 0) {
			ttarr[ttarr.length - 1] = ntt;
		} else {
			ttarr.push(ntt);
		}
	}

	return {
		totalTime: ttarr,
		progress: progress,
		segments: segments,
		alloc: 0,
		sys: 0
	};
};

const snapshotSegmentIndexStatusFromJson = (json: any): SnapshotSegmentIndexStatus => {
	return {
		name: json.segmentName,
		progress: json.percent
	};
};
