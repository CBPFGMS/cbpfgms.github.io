import React, { useState, useRef } from "react";
import type {
	DatumIndicators,
	AllSectorsDatum,
} from "../utils/processdataindicators";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Box from "@mui/material/Box";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import IndicatorCard from "./IndicatorCard";
import type { List } from "../utils/makelists";
import { clustersIconsData } from "../assets/clustericons";
import { Typography } from "@mui/material";
import colors from "../utils/colors";
import DownloadIcon from "./DownloadIcon";
import type { DownloadStates } from "./MainContainer";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/swiper-bundle.css";
import downloadData from "../utils/downloaddata";
import { processIndicatorsDownload } from "../utils/processdownload";

type IndicatorsCarouselProps = {
	data: DatumIndicators[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

function isAllSectorsDatum(datum: DatumIndicators): datum is AllSectorsDatum {
	return datum && datum.sector === 0;
}

function IndicatorsCarousel({
	data,
	lists,
	clickedDownload,
	setClickedDownload,
}: IndicatorsCarouselProps) {
	const [activeStep, setActiveStep] = useState<number>(0),
		maxSteps = data.length;

	const swiperRef = useRef<SwiperType | null>(null);

	const visibleRange = [
		Math.max(0, activeStep - 1),
		activeStep,
		Math.min(maxSteps - 1, activeStep + 1),
	];

	function handleStepClick(step: number) {
		setActiveStep(step);
		swiperRef.current?.slideTo(step);
	}

	function handleNext() {
		swiperRef.current?.slideNext();
	}

	function handleBack() {
		swiperRef.current?.slidePrev();
	}

	function handleSlideChange(swiper: SwiperType) {
		setActiveStep(swiper.activeIndex);
	}

	const allSectorsData = data.find(isAllSectorsDatum)!;

	function handleDownloadClick() {
		const dataIndicatorsDownload = processIndicatorsDownload({
			allSectorsData,
			lists,
		});
		downloadData<(typeof dataIndicatorsDownload)[number]>(
			dataIndicatorsDownload,
			"global_indicators",
		);
	}

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			flexDirection="column"
			position={"relative"}
		>
			<Box
				style={{
					position: "absolute",
					top: "0",
					right: "0",
					paddingTop: "1.2em",
					paddingRight: "1.5em",
					cursor: "pointer",
					zIndex: 1000,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<DownloadIcon
					handleDownloadClick={handleDownloadClick}
					clickedDownload={clickedDownload}
					setClickedDownload={setClickedDownload}
					type="indicators"
				/>
			</Box>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				mt={2}
			>
				<Button
					onClick={handleBack}
					disabled={activeStep === 0}
					startIcon={<KeyboardArrowLeft />}
					sx={{ marginRight: "8px" }}
				>
					Back
				</Button>
				<Stepper
					activeStep={activeStep}
					nonLinear
				>
					{data.map((datum, index) => (
						<Step
							key={datum.sector}
							sx={{ padding: "4px" }}
						>
							<Box onClick={() => handleStepClick(index)}>
								<StepButton
									sx={{
										backgroundColor:
											index === activeStep
												? "primary.main"
												: "grey.300",
										borderRadius: "50%",
										margin: 0,
										padding: 0,
										width: "28px",
										height: "28px",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
									icon={
										datum.sector === 0 ? (
											<Typography
												variant="caption"
												style={{
													fontWeight: "bold",
													marginLeft: "8px", //TRY TO FIND A PROPER SOLUTION!!!
													color:
														index === activeStep
															? "white"
															: colors.unColor,
												}}
											>
												All
											</Typography>
										) : (
											<img
												src={
													clustersIconsData[
														datum.sector
													]
												}
												style={{
													width: "16px",
													height: "16px",
													marginLeft: "8px", //TRY TO FIND A PROPER SOLUTION!!!
													filter:
														index === activeStep
															? "brightness(0.1) invert(1)"
															: "none",
												}}
											/>
										)
									}
								></StepButton>
							</Box>
						</Step>
					))}
				</Stepper>
				<Button
					onClick={handleNext}
					disabled={activeStep === maxSteps - 1}
					endIcon={<KeyboardArrowRight />}
					sx={{ marginLeft: "8px" }}
				>
					Next
				</Button>
			</Box>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				width="100%"
				mt={2}
			>
				<Swiper
					onSwiper={swiper => (swiperRef.current = swiper)}
					onSlideChange={handleSlideChange}
					initialSlide={activeStep}
					spaceBetween={20}
					slidesPerView={1}
					// This replaces enableMouseEvents
					simulateTouch={true}
					style={{ width: "100%" }}
				>
					{data.map((datum, index) => (
						<SwiperSlide key={datum.sector}>
							<Box
								key={datum.sector}
								display="flex"
								justifyContent="center"
								alignItems="flex-start"
								paddingTop={2}
							>
								{visibleRange.includes(index) && (
									<IndicatorCard
										datumIndicator={datum}
										lists={lists}
									/>
								)}
							</Box>
						</SwiperSlide>
					))}
				</Swiper>
			</Box>
		</Box>
	);
}

const MemoisedIndicatorsCarousel = React.memo(IndicatorsCarousel);

export default MemoisedIndicatorsCarousel;
