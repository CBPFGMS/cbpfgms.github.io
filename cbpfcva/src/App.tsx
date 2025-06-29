import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/DataContext";
import MainContainer from "./components/MainContainer";
import Container from "@mui/material/Container";
import TopIntro from "./components/TopIntro";

type AppProps = {
	defaultYear: number;
	defaultFundType: number | null;
	startYear: number | null;
};

function App({ defaultYear, defaultFundType, startYear }: AppProps) {
	const { data, lists, inDataLists, loading, error, progress } = useData(
		defaultFundType,
		startYear
	);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<TopIntro />
			{loading ? (
				<Loading progress={progress} />
			) : error ? (
				<Error error={error} />
			) : (
				<DataContext.Provider value={{ data, lists, inDataLists }}>
					<MainContainer defaultYear={defaultYear} />
				</DataContext.Provider>
			)}
		</Container>
	);
}

export default App;
