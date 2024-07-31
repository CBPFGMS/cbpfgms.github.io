import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import colors from "../utils/colors";
import ListIcon from "@mui/icons-material/List";
import Pictogram from "../assets/Pictogram";
import PaidIcon from "@mui/icons-material/Paid";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
import PublicIcon from "@mui/icons-material/Public";
import { RefIds } from "./MainContainer";
import React from "react";

type ScrollSpyProps = {
	inViewSummary: boolean;
	inViewPictogram: boolean;
	inViewBeneficiaryTypes: boolean;
	inViewOrganizations: boolean;
	inViewSectors: boolean;
	inViewIndicators: boolean;
	inViewDisability: boolean;
	refIds: RefIds;
};

type TabProps = {
	label: string;
	inView: boolean;
	reference: string;
	handleOnClick: (reference: string) => void;
	Icon: React.ElementType;
};

function ScroolSpy({
	inViewSummary,
	inViewPictogram,
	inViewBeneficiaryTypes,
	inViewOrganizations,
	inViewSectors,
	inViewIndicators,
	inViewDisability,
	refIds,
}: ScrollSpyProps) {
	function handleOnClick(reference: string) {
		document.getElementById(reference)?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}

	return (
		<Box
			display="flex"
			flexDirection="row"
			mt={0.5}
			mb={2}
			gap={1}
		>
			<Tab
				label="Summary"
				inView={inViewSummary}
				reference={refIds.summaryRefId}
				handleOnClick={handleOnClick}
				Icon={PaidIcon}
			/>
			<Tab
				label="By Gender/Age"
				inView={inViewPictogram}
				reference={refIds.pictogramRefId}
				handleOnClick={handleOnClick}
				Icon={Pictogram}
			/>
			<Tab
				label="By Beneficiary Types"
				inView={inViewBeneficiaryTypes}
				reference={refIds.beneficiaryTypesRefId}
				handleOnClick={handleOnClick}
				Icon={GroupsIcon}
			/>
			<Tab
				label="By Organization"
				inView={inViewOrganizations}
				reference={refIds.organizationsRefId}
				handleOnClick={handleOnClick}
				Icon={BusinessIcon}
			/>
			<Tab
				label="By Sectors"
				inView={inViewSectors}
				reference={refIds.sectorsRefId}
				handleOnClick={handleOnClick}
				Icon={ListIcon}
			/>
			<Tab
				label="Global Indicators"
				inView={inViewIndicators}
				reference={refIds.indicatorsRefId}
				handleOnClick={handleOnClick}
				Icon={PublicIcon}
			/>
		</Box>
	);
}

function Tab({ label, inView, reference, handleOnClick, Icon }: TabProps) {
	return (
		<Paper
			elevation={1}
			style={{
				padding: "0.2rem 1rem 0rem 1rem",
				borderBottom: inView
					? `3px solid ${colors.unColor}`
					: "3px solid transparent",
				cursor: "pointer",
			}}
			className="scrollSpyTab"
			onClick={() => handleOnClick(reference)}
		>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
			>
				<Icon
					htmlColor={colors.unColor}
					fontSize="medium"
					{...(label === "By Gender/Age" && {
						type: "total",
						svgProps: {
							style: {
								width: 12,
								fill: colors.unColor,
							},
						},
					})}
				/>
				<Typography
					variant="body2"
					style={{
						fontSize: "0.85rem",
						color: "#555",
						marginLeft: "0.5em",
					}}
				>
					{label}
				</Typography>
			</Box>
		</Paper>
	);
}

const MemoizedScroolSpy = React.memo(ScroolSpy);

export default MemoizedScroolSpy;
