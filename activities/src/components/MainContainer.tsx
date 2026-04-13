type MainContainerProps = {
	startYear: number | null;
};

function MainContainer({ startYear }: MainContainerProps) {
	return (
		<div className="main-container">
			<div className="main-container__content">
				<h1>Main Container</h1>
				<p>Start Year: {startYear}</p>
			</div>
		</div>
	);
}

export default MainContainer;
