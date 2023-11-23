import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import colors from "../utils/colors";
import ListIcon from "@mui/icons-material/List";
import Pictogram from "../assets/Pictogram";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaidIcon from "@mui/icons-material/Paid";

function ScroolSpy({
	inViewSummary,
	inViewPictogram,
	inViewBeneficiaryTypes,
	inViewSectors,
	inViewMap,
	summaryRef,
	pictogramRef,
	beneficiaryTypesRef,
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
			gap={1}
		>
			<Tab
				label="Summary"
				inView={inViewSummary}
				reference={summaryRef}
				handleOnClick={handleOnClick}
				Icon={PaidIcon}
			/>
			<Tab
				label="By Gender and Age"
				inView={inViewPictogram}
				reference={pictogramRef}
				handleOnClick={handleOnClick}
				Icon={Pictogram}
			/>
			<Tab
				label="By Beneficiary Types"
				inView={inViewBeneficiaryTypes}
				reference={beneficiaryTypesRef}
				handleOnClick={handleOnClick}
				Icon={ListIcon}
			/>
			<Tab
				label="By Sectors"
				inView={inViewSectors}
				reference={sectorsRef}
				handleOnClick={handleOnClick}
				Icon={ListIcon}
			/>
			<Tab
				label="Geographic Location"
				inView={inViewMap}
				reference={mapRef}
				handleOnClick={handleOnClick}
				Icon={LocationOnIcon}
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
					{...(label === "By Gender and Age" && {
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

export default ScroolSpy;
