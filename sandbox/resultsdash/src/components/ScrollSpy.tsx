import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import colors from "../utils/colors";

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
			/>
			<Tab
				label="By Gender and Age"
				inView={inViewPictogram}
				reference={pictogramRef}
				handleOnClick={handleOnClick}
			/>
			<Tab
				label="By Beneficiary Types"
				inView={inViewBeneficiaryTypes}
				reference={beneficiaryTypesRef}
				handleOnClick={handleOnClick}
			/>
			<Tab
				label="By Sectors"
				inView={inViewSectors}
				reference={sectorsRef}
				handleOnClick={handleOnClick}
			/>
			<Tab
				label="Geographic Location"
				inView={inViewMap}
				reference={mapRef}
				handleOnClick={handleOnClick}
			/>
		</Box>
	);
}

function Tab({ label, inView, reference, handleOnClick }: TabProps) {
	return (
		<Paper
			elevation={1}
			style={{
				padding: "0.2rem 1rem 0.2rem 1rem",
				borderBottom: inView ? `3px solid ${colors.unColor}` : "none",
				cursor: "pointer",
			}}
			className="scrollSpyTab"
			onClick={() => handleOnClick(reference)}
		>
			<Typography
				variant="body2"
				style={{
					fontSize: "0.85rem",
					color: "#555",
				}}
			>
				{label}
			</Typography>
		</Paper>
	);
}

export default ScroolSpy;
