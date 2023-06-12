import { constants } from "./constants.js";

const { dialogContainer, classPrefix } = constants;

const fields = [
	{ field: "CurrentStatusName", label: "From status" },
	{ field: "NextStatusName", label: "To status" },
	{ field: "UserRoleName", label: "User role" },
	{ field: "UserName", label: "User name" },
	{ field: "UserEmail", label: "User email" },
	{ field: "TaskCreatedDate", label: "Task created" },
	{ field: "WorkflowLogDate", label: "Log date" },
];

function createDialog(projectLog, listRowsContainer) {
	dialogContainer.html(null);

	const dialogTitle = dialogContainer
		.append("div")
		.attr("class", classPrefix + "dialogTitle");

	dialogTitle
		.append("span")
		.attr("class", classPrefix + "dialogTitleProjectLog")
		.html("Project log: ");

	dialogTitle
		.append("span")
		.attr("class", classPrefix + "dialogTitleProjectName")
		.html(projectLog.TaskName);

	const dialogBody = dialogContainer
		.append("div")
		.attr("class", classPrefix + "dialogBody");

	fields.forEach(({ field, label }) => {
		const fieldContainer = dialogBody
			.append("div")
			.attr("class", classPrefix + "dialogFieldContainer");

		fieldContainer
			.append("div")
			.attr("class", classPrefix + "dialogFieldLabel")
			.html(label + ": ");

		fieldContainer
			.append("div")
			.attr("class", classPrefix + "dialogFieldValue")
			.html(projectLog[field]);
	});

	if (projectLog.EmailLogs.length) {
		const emailLogsContainer = dialogBody
			.append("div")
			.attr("class", classPrefix + "dialogFieldContainer");

		emailLogsContainer
			.append("div")
			.attr("class", classPrefix + "dialogFieldLabel")
			.html("Email logs:");

		emailLogsContainer
			.append("div")
			.attr("class", classPrefix + "dialogFieldValue")
			.html(projectLog.EmailLogs[0].EmailCount);
	}

	dialogBody
		.append("button")
		.attr("class", classPrefix + "dialogCloseButton")
		.html("Close")
		.on("click", () => {
			dialogContainer.node().close();
			listRowsContainer.classed("active", d => (d.clicked = !d.clicked));
		});
}

export { createDialog };
