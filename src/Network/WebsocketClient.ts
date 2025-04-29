import { currentNodeUrl } from "./APIHandler";

let wsUrl = "ws";
let current_idx = 0;

export const websocketUrl = () => {
	const baseUrl = currentNodeUrl(true);
	return `${baseUrl}/${wsUrl}`;
};

export class WebSocketClient {
	private static instance: WebSocketClient;
	private socket!: WebSocket;
	private subscriptions: { [key: string]: (data: any) => void } = {};

	private constructor() {
		this.connect();
	}

	dispose(): void {
		// Clean up resources
		console.log("Resource released");
	}

	private connect() {
		this.socket = new WebSocket(websocketUrl());

		this.socket.onopen = () => {
			console.log("WebSocket connection established");
		};

		this.socket.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			const { status, message } = msg;

			if (!status || status !== "success") {
				console.error("WebSocket error:", message);
				return;
			}

			let incommingMessage = JSON.parse(message);

			const messageType = incommingMessage.messageType;
			const data = incommingMessage.message;

			if (this.subscriptions[messageType]) {
				this.subscriptions[messageType](data);
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection closed");
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};
	}

	public static getInstance(): WebSocketClient {
		if (!WebSocketClient.instance) {
			WebSocketClient.instance = new WebSocketClient();
		}
		return WebSocketClient.instance;
	}

	randomString(length: number) {
		const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		let randomstring = "";
		for (let i = 0; i < length; i++) {
			const rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum, rnum + 1);
		}
		return randomstring;
	}

	subscribe(type: string, callback: (data: any) => void) {
		if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
			this.connect();
		}
		this.subscriptions[type] = callback;
		this.waitForConnection(() => {
			this.sendMessage({
				service: "txpool",
				action: "subscribe"
			});
		});
	}

	unsubscribe(type: string) {
		if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
			this.connect();
		}
		delete this.subscriptions[type];
		this.waitForConnection(() => {
			this.sendMessage({
				service: "txpool",
				action: "unsubscribe"
			});
		});
	}

	private waitForConnection(callback: () => void) {
		const interval = 100; // ms
		const checkConnection = () => {
			if (this.socket.readyState === WebSocket.OPEN) {
				callback();
			} else {
				setTimeout(checkConnection, interval);
			}
		};
		checkConnection();
	}

	sendMessage(data: any) {
		const message = JSON.stringify(data);
		this.socket.send(message);
	}
}
