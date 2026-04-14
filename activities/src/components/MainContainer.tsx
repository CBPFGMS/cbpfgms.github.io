import { use } from "react";
import type { AppData } from "../utils/api";
import Container from "@mui/material/Container";

type MainContainerProps = {
	dataPromise: Promise<AppData>;
};

function MainContainer({ dataPromise }: MainContainerProps) {
	const { data } = use(dataPromise);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<div
				className="main-container__content"
				style={{ flexWrap: "wrap" }}
			>
				<h1>Main Container</h1>
				<p>Data Length: {data.length}</p>
			</div>
		</Container>
	);
}

export default MainContainer;
