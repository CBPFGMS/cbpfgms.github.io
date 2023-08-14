import { useState } from "react";
import Header from "./components/header";
import Title from "./components/title";
import Selectors from "./components/selectors";
import DataContext from "./context/DataContext";
import data from "./data/data.ts";
import ChartArea from "./components/chartarea";

function App() {
	const [year, setYear] = useState<string[]>([data.years[0]!]);
	const [cbpf, setCbpf] = useState<string[]>(data.cbpfs);
	const [sector, setSector] = useState<string[]>(data.sectors);
	const [partnerType, setPartnerType] = useState<string[]>(data.partnerTypes);
	const [allocationType, setAllocationType] = useState<string[]>(
		data.allocationTypes
	);
	const [beneficiaryType, setBeneficiaryType] = useState<string[]>(
		data.beneficiaryTypes
	);

	return (
		<>
			<Header />
			<div className="topContainer">
				<DataContext.Provider value={data}>
					<Title />
					<Selectors
						year={year}
						setYear={setYear}
						cbpf={cbpf}
						setCbpf={setCbpf}
						sector={sector}
						setSector={setSector}
						partnerType={partnerType}
						setPartnerType={setPartnerType}
						allocationType={allocationType}
						setAllocationType={setAllocationType}
						beneficiaryType={beneficiaryType}
						setBeneficiaryType={setBeneficiaryType}
					/>
					<ChartArea />
				</DataContext.Provider>
			</div>
		</>
	);
}

export default App;
