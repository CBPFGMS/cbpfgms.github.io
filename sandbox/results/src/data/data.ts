export type Idata = {
	years: string[];
	cbpfs: string[];
	sectors: string[];
	partnerTypes: string[];
	allocationTypes: string[];
	beneficiaryTypes: string[];
};

const data: Idata = {
	years: Array.from(Array(2023 - 2006), (_, i) => 2006 + i + "").reverse(),
	cbpfs: [
		"Afghanistan",
		"Burkina Faso (RhPF-WCA)",
		"CAR",
		"Colombia",
		"DRC",
		"Ethiopia",
		"Haiti",
		"Iraq",
		"Jordan",
		"Lebanon",
		"Mali (RhPF-WCA)",
		"Myanmar",
		"Niger (RhPF-WCA)",
		"Nigeria",
		"oPt",
		"Pakistan",
		"Somalia",
		"South Sudan",
		"Sudan",
		"Syria",
		"Syria Cross border",
		"Ukraine",
		"Venezuela",
		"Yemen",
	],
	sectors: [
		"Camp Coordination / Management",
		"Early Recovery",
		"Education",
		"Emergency Shelter and NFI",
		"Emergency Telecommunications",
		"Food Security",
		"Health",
		"Logistics",
		"Nutrition",
		"Protection",
		"Water Sanitation Hygiene",
		"Coordination and Support Services",
		"Multi-Sector",
		"COVID-19",
		"Multi-purpose CASH",
	],
	partnerTypes: ["National NGO", "International NGO", "UN Agency", "Others"],
	allocationTypes: ["Standard", "Reserve"],
	beneficiaryTypes: ["Men", "Women", "Boys", "Girls"],
};

export default data;