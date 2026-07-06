import Container from "@mui/material/Container";
import { useAppData } from "../hooks/useappdata";

function MainContainer() {
	const { contributionsData, contributionsInDataLists } = useAppData();

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		></Container>
	);
}

export default MainContainer;
