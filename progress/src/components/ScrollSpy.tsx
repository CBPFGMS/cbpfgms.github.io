import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import colors from "../utils/colors";
import ListIcon from "@mui/icons-material/List";
import Pictogram from "../assets/Pictogram";
import PaidIcon from "@mui/icons-material/Paid";
import PublicIcon from "@mui/icons-material/Public";
import { RefIds } from "./MainContainer";
import constants from "../utils/constants";
import {
	GBVIcon,
	DisabilityIcon,
	ByTypeIcon,
	OrgIcon,
	EmergencyIcon,
	CashIcon,
} from "../assets/OchaIcons";

type ScrollSpyProps = {
	inViewSummary: boolean;
	inViewPictogram: boolean;
	inViewBeneficiaryTypes: boolean;
	inViewOrganizations: boolean;
	inViewSectors: boolean;
	inViewEmergencies: boolean;
	inViewIndicators: boolean;
	inViewDisability: boolean;
	inViewGBV: boolean;
	inViewCash: boolean;
	refIds: RefIds;
};

type TabProps = {
	label: string;
	inView: boolean;
	reference: string;
	handleOnClick: (reference: string) => void;
	Icon: React.ElementType;
	ochaIcon?: boolean;
};

const { iconSize } = constants;

function ScrollSpy({
	inViewSummary,
	inViewPictogram,
	inViewBeneficiaryTypes,
	inViewOrganizations,
	inViewSectors,
	inViewEmergencies,
	inViewIndicators,
	inViewDisability,
	inViewGBV,
	inViewCash,
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
			gap={2}
			style={{
				width: "98%",
			}}
		>
			<Tab
				label="Summary"
				inView={inViewSummary}
				reference={refIds.summaryRefId}
				handleOnClick={handleOnClick}
				Icon={PaidIcon}
			/>
			<Tab
				label="Gender/Age"
				inView={inViewPictogram}
				reference={refIds.pictogramRefId}
				handleOnClick={handleOnClick}
				Icon={Pictogram}
			/>
			<Tab
				label="Type"
				inView={inViewBeneficiaryTypes}
				reference={refIds.beneficiaryTypesRefId}
				handleOnClick={handleOnClick}
				Icon={ByTypeIcon}
				ochaIcon={true}
			/>
			<Tab
				label="Org."
				inView={inViewOrganizations}
				reference={refIds.organizationsRefId}
				handleOnClick={handleOnClick}
				Icon={OrgIcon}
				ochaIcon={true}
			/>
			<Tab
				label="Sector"
				inView={inViewSectors}
				reference={refIds.sectorsRefId}
				handleOnClick={handleOnClick}
				Icon={ListIcon}
			/>
			<Tab
				label="Disability"
				inView={inViewDisability}
				reference={refIds.disabilityRefId}
				handleOnClick={handleOnClick}
				Icon={DisabilityIcon}
				ochaIcon={true}
			/>
			<Tab
				label="GBV"
				inView={inViewGBV}
				reference={refIds.gbvRefId}
				handleOnClick={handleOnClick}
				Icon={GBVIcon}
				ochaIcon={true}
			/>
			<Tab
				label="Emergencies"
				inView={inViewEmergencies}
				reference={refIds.emergencyRefId}
				handleOnClick={handleOnClick}
				Icon={EmergencyIcon}
				ochaIcon={true}
			/>
			<Tab
				label="CASH"
				inView={inViewCash}
				reference={refIds.cashRefId}
				handleOnClick={handleOnClick}
				Icon={CashIcon}
				ochaIcon={true}
			/>
			<Tab
				label="Indicators"
				inView={inViewIndicators}
				reference={refIds.indicatorsRefId}
				handleOnClick={handleOnClick}
				Icon={PublicIcon}
			/>
		</Box>
	);
}

function Tab({
	label,
	inView,
	reference,
	handleOnClick,
	Icon,
	ochaIcon,
}: TabProps) {
	return (
		<Paper
			elevation={1}
			style={{
				padding: "0.2rem 1rem 0rem 1rem",
				cursor: "pointer",
				backgroundColor: inView ? colors.unColor : "white",
				flex: 1,
			}}
			className="scrollSpyTab"
			onClick={() => handleOnClick(reference)}
		>
			<Box
				mt={0.75}
				mb={0.5}
				display={"flex"}
				flexDirection={"column"}
				gap={0.5}
				alignItems={"center"}
			>
				<Icon
					htmlColor={inView ? "white" : colors.unColor}
					style={{
						width: iconSize,
						height: iconSize,
					}}
					{...(label === "Gender/Age" && {
						type: "total",
						svgProps: {
							style: {
								width: iconSize,
								height: iconSize,
								fill: inView ? "white" : colors.unColor,
							},
						},
					})}
					{...(ochaIcon && {
						svgProps: {
							style: {
								width: iconSize,
								height: iconSize,
								fill: inView ? "white" : colors.unColor,
							},
						},
					})}
				/>
				<Typography
					variant="body2"
					style={{
						fontSize: "0.85rem",
						color: inView ? "#fff" : "#555",
					}}
				>
					{label}
				</Typography>
			</Box>
		</Paper>
	);
}

const MemoizedScroolSpy = React.memo(ScrollSpy);

export default MemoizedScroolSpy;
