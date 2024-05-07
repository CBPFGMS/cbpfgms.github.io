import { useContext, useState } from "react";
import DataContext, { DataContextType } from "../context/DataContext";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";
import { useInView } from "react-intersection-observer";
import colors from "../utils/colors";
import InfoIcon from "@mui/icons-material/Info";

type MainContainerProps = {
	defaultYear: number;
};

const queryStringValues = new URLSearchParams(location.search);

function MainContainer({ defaultYear }: MainContainerProps) {
	const apiData = useContext(DataContext) as DataContextType;
	const data = apiData.data;

	const [year, setYear] = useState<number>(defaultYear);
	const [fund, setFund] = useState<number[]>([...apiData.inDataLists.funds]);
	const [allocationType, setAllocationType] = useState<number[]>([
		...apiData.inDataLists.allocationTypes,
	]);
	const [allocationSource, setAllocationSource] = useState<number[]>([
		...apiData.inDataLists.allocationSources,
	]);

	const [titleRef, inViewTitle] = useInView({
		threshold: 0.999,
	});

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
			<Grid
				container
				spacing={2}
				justifyContent={"center"}
				position={"sticky"}
				top={-1}
				ref={titleRef}
				mb={2}
				pt={1}
				style={{
					backgroundColor: "rgba(255,255,255,0.95)",
					zIndex: 1200,
					borderBottom: inViewTitle ? "none" : "1px solid #ccc",
					boxShadow: inViewTitle
						? "none"
						: "0px 10px 10px -10px rgba(0,0,0,0.2)",
				}}
			>
				<Grid
					pb={2}
					pt={2}
					xs={12}
					display={"flex"}
					alignItems={"center"}
					justifyContent={"center"}
				>
					<Typography
						variant={"h4"}
						style={{
							fontFamily: "Montserrat",
							// fontSize: inViewMenus ? "40px" : "18px",
							fontSize: "40px",
							fontWeight: 700,
							// marginLeft: inViewMenus ? "1em" : "2em",
							marginLeft: "1em",
						}}
					>
						Allocation Progress Dashboard
					</Typography>
					<InfoIcon
						data-tooltip-id="tooltip"
						data-tooltip-content={
							"The Allocation Progress dashboard provides visual representation of both under implementation and implemented projects"
						}
						data-tooltip-place="top"
						style={{
							color: colors.unColor,
							// fontSize: inViewMenus ? "26px" : "18px",
							fontSize: "26px",
							marginLeft: "0.1em",
							// alignSelf: inViewMenus ? "flex-start" : "center",
							alignSelf: "flex-start",
						}}
					/>
					{/* {!inViewMenus && (
						<QuickSelectors
							fund={fund}
							setFund={setFund}
							allocationSource={allocationSource}
							setAllocationSource={setAllocationSource}
							allocationType={allocationType}
							setAllocationType={setAllocationType}
							inSelectionData={inSelectionData}
						/>
					)} */}
				</Grid>
			</Grid>
		</Container>
	);
}

export default MainContainer;
