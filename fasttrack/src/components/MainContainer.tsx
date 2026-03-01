import { useContext, useState } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import { constants } from "../utils/constants";
import Container from "@mui/material/Container";
import { Tooltip } from "react-tooltip";
import TopFilter from "./TopFilter";
import TopIntro from "./TopIntro";
import useUpdateQueryString from "../hooks/useupdatequerystring";

function MainContainer() {
	const { data, inDataLists, lists } = useContext(
		DataContext,
	) as DataContextType;

	const [fund, setFund] = useState<number[]>([...inDataLists.funds]);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<Tooltip
				id="tooltip"
				style={{ zIndex: 9999, maxWidth: "400px", textAlign: "center" }}
			/>
			<TopFilter />
			<TopIntro />
		</Container>
	);
}

export default MainContainer;
