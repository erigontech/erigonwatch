import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { heapProfileUrl } from "../../Network/APIHandler";

export const ProfilePage = () => {
	const [img, setImg] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(false);

	const getFunction = async () => {
		try {
			const resp = await axios.get(heapProfileUrl(), {
				onDownloadProgress: (progressEvent) => {
					let eventObj: XMLHttpRequest | undefined = undefined;
					if (progressEvent.event?.currentTarget) {
						eventObj = progressEvent.event?.currentTarget;
					} else if (progressEvent.event?.srcElement) {
						eventObj = progressEvent.event?.srcElement;
					} else if (progressEvent.event?.target) {
						eventObj = progressEvent.event?.target;
					}
					if (!eventObj) return;
				}
			});
			setLoading(false);
			setImg(resp.data);
		} catch (error) {
			setLoading(false);
			console.error(error);
		}
	};

	const Example = () => {
		return (
			<TransformWrapper>
				<TransformComponent>
					<img
						src={img}
						alt="test"
					/>
				</TransformComponent>
			</TransformWrapper>
		);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-row justify-between">
				<div className="w-[15%]">
					{loading ? (
						<CircularProgress />
					) : (
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setLoading(true);
								getFunction();
							}}
						>
							Fetch Data
						</Button>
					)}
				</div>
				<div className="w-[15%]">
					<h3 className="text-xl font-semibold">Heap Profile</h3>
				</div>
				<div className="w-[15%]" />
			</div>
			<div className="mt-5 mr-5 mb-5">
				{img && (
					<TransformWrapper>
						<TransformComponent>
							<img
								src={`data:image/png;base64,${img}`}
								alt="test"
							/>
						</TransformComponent>
					</TransformWrapper>
				)}
			</div>
		</div>
	);
};
