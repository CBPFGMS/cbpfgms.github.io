import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import colors from "../utils/colors";
import { RefIds } from "./MainContainer";
import ScrollSpy from "./ScrollSpy";
import { InSelectionData } from "../utils/processdatasummary";
import QuickSelectors from "./QuickSelectors";

type TopPanelProps = {
	titleRef: (node?: Element | null | undefined) => void;
	inViewTitle: boolean;
	inViewMenus: boolean;
	inViewSummary: boolean;
	inViewPictogram: boolean;
	inViewBeneficiaryTypes: boolean;
	inViewOrganizations: boolean;
	inViewSectors: boolean;
	inViewLeadership: boolean;
	refIds: RefIds;
	year: number[];
	setYear: React.Dispatch<React.SetStateAction<number[]>>;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function TopPanel({
	titleRef,
	inViewTitle,
	inViewMenus,
	inViewSummary,
	inViewPictogram,
	inViewBeneficiaryTypes,
	inViewOrganizations,
	inViewSectors,
	inViewLeadership,
	refIds,
	year,
	setYear,
	fund,
	setFund,
	allocationSource,
	setAllocationSource,
	allocationType,
	setAllocationType,
	inSelectionData,
}: TopPanelProps) {
	return (
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
						fontSize: inViewMenus ? "40px" : "24px",
						// fontSize: "40px",
						fontWeight: 700,
						marginLeft: inViewMenus ? "1em" : "2em",
						// marginLeft: "1em",
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
						fontSize: inViewMenus ? "26px" : "18px",
						// fontSize: "26px",
						marginLeft: "0.1em",
						alignSelf: "flex-start",
					}}
				/>
				{!inViewMenus && (
					<QuickSelectors
						year={year}
						setYear={setYear}
						fund={fund}
						setFund={setFund}
						allocationSource={allocationSource}
						setAllocationSource={setAllocationSource}
						allocationType={allocationType}
						setAllocationType={setAllocationType}
						inSelectionData={inSelectionData}
					/>
				)}
			</Grid>
			<ScrollSpy
				inViewSummary={inViewSummary}
				inViewPictogram={inViewPictogram}
				inViewBeneficiaryTypes={inViewBeneficiaryTypes}
				inViewOrganizations={inViewOrganizations}
				inViewSectors={inViewSectors}
				inViewLeadership={inViewLeadership}
				refIds={refIds}
			/>
		</Grid>
	);
}

export default TopPanel;
