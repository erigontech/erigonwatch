import Alert from "@mui/material/Alert";

export const InfoAlert = () => {
	return (
		<div
			className="justify-center items-center flex top-[80vh] bottom-0 left-0 right-0 absolute"
			style={{ zIndex: 9999 }}
		>
			<div
				className="absolute bottom-[50px] flex items-center w-fit h-fit"
				role="alert"
			>
				<Alert severity="success">Copied!</Alert>
			</div>
		</div>
	);
};
