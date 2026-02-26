const constants = {
	rootElementId: "fasttrackroot",
	fundType: 1,
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
	pageName: "CBPFProgress",
	localStorageTime: 60 * 60 * 1000, //1 hour
	consoleStyle: "background-color: #0d6cb6; color: white; padding: 2px;",
} as const;

export { constants };
