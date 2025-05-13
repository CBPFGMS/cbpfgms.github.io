import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import colors from "../utils/colors";
import ListIcon from "@mui/icons-material/List";
import Pictogram from "../assets/Pictogram";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaidIcon from "@mui/icons-material/Paid";
import { ScrollSpyProps, TabProps } from "../types";
import { ByTypeIcon, OrgIcon } from "../assets/OchaIcons";

const iconSize = 32;

function ScroolSpy({
	inViewSummary,
	inViewPictogram,
	inViewBeneficiaryTypes,
	inViewOrganizationTypes,
	inViewSectors,
	inViewMap,
	summaryRef,
	pictogramRef,
	beneficiaryTypesRef,
	organizationTypesRef,
	sectorsRef,
	mapRef,
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
				width: "84%",
			}}
		>
			<Tab
				label="Summary"
				inView={inViewSummary}
				reference={summaryRef}
				handleOnClick={handleOnClick}
				Icon={PaidIcon}
			/>
			<Tab
				label="Gender and Age"
				inView={inViewPictogram}
				reference={pictogramRef}
				handleOnClick={handleOnClick}
				Icon={Pictogram}
			/>
			<Tab
				label="Beneficiary Type"
				inView={inViewBeneficiaryTypes}
				reference={beneficiaryTypesRef}
				handleOnClick={handleOnClick}
				Icon={ByTypeIcon}
				ochaIcon={true}
			/>
			<Tab
				label="Organization"
				inView={inViewOrganizationTypes}
				reference={organizationTypesRef}
				handleOnClick={handleOnClick}
				Icon={OrgIcon}
				ochaIcon={true}
			/>
			<Tab
				label="Sectors"
				inView={inViewSectors}
				reference={sectorsRef}
				handleOnClick={handleOnClick}
				Icon={ListIcon}
			/>
			<Tab
				label="Location"
				inView={inViewMap}
				reference={mapRef}
				handleOnClick={handleOnClick}
				Icon={LocationOnIcon}
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
				backgroundColor: inView ? colors.unColor : "white",
				cursor: "pointer",
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
					fontSize="medium"
					{...(label === "Gender and Age" && {
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
						textAlign: "center",
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

export default ScroolSpy;
