import { currentNodeUrl } from "./APIHandler";

let wsUrl = "ws";

export const websocketUrl = () => {
	const baseUrl = currentNodeUrl(true);
	return `${baseUrl}/${wsUrl}`;
};

export class WebSocketClient {
	private static instance: WebSocketClient;
	private socket: WebSocket;
	private subscriptions: { [key: string]: (data: any) => void } = {};

	private constructor() {
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

			console.log("Onmessage Received message:", data);

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

	subscribe(type: string, callback: (data: any) => void) {
		this.subscriptions[type] = callback;
		this.sendMessage({
			service: "txpool",
			action: "subscribe"
		});
	}

	unsubscribe(type: string) {
		delete this.subscriptions[type];
		this.sendMessage({
			service: "txpool",
			action: "unsubscribe"
		});
	}

	sendMessage(data: any) {
		const message = JSON.stringify(data);
		this.socket.send(message);
	}
}

// Usage example
/*const client = WebSocketClient.getInstance();

client.subscribe("messageType1", (data) => {
	console.log("Received data for messageType1:", data);
});

client.subscribe("messageType2", (data) => {
	console.log("Received data for messageType2:", data);
});

// To send a message
client.sendMessage({ type: "messageType1", data: { key: "value" } });*/
