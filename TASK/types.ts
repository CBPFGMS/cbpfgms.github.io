declare interface ProcessData {
	(rawData: RawData, projectsData: ProjectsData): Data;
}
declare interface RawData {
	CurrentStatusId: number;
	CurrentStatusCode: string;
	ProjectTemplateId: number;
	RowCount: number;
	DataState: string;
	DataStateMessage: string | null;
	TaskStatuses: TaskStatuses[];
}

declare interface TaskStatuses {
	StatusId: number;
	RowId: number;
	StatusType: string;
	StatusName: string;
	StatusCode: string;
	NextStatuses: NextStatuses[];
	SubTasks: SubTasks[];
}

declare interface NextStatuses {
	NextStatusId: number;
	NextStatusName: string;
	NextStatusCode: string;
	IsCompleted: boolean;
	LinkType: string;
	Tasks: Tasks[];
}

declare interface Tasks {
	TaskName: string;
	ButtonText: string;
	Roles: Roles[];
}

declare interface SubTasks {
	SubTaskName: string;
	SubTaskCode: string;
	IsTaskCompleted: boolean;
	AssignedToCurrentRole: boolean;
	Roles: Roles[];
}

declare interface Roles {
	UserRoleName: string;
	UserRoleCode: string;
}

declare interface ProjectsData {
	TrackingLogs: TrackingLog[];
	DataState: string;
	DataStateMessage: any;
}

declare interface TrackingLog {
	CurrentStatusId: number;
	NextStatusId: number;
	RowId: number;
	TaskRowId: number;
	TaskName: string;
	TaskCode: string;
	CurrentStatusName: string;
	NextStatusName: string;
	CurrentStatusCode: string;
	NextStatusCode: string;
	TaskInstanceLogId: number;
	UserRoleName: string;
	UserRoleCode: string;
	UserName: string;
	UserEmail: string;
	WorkflowLogDate: string;
	Comments: string;
	TaskCreatedDate: string;
	AssignedTaskDetail: any;
	LoggedTaskDetail: LoggedTaskDetail;
	EmailLogs: EmailLog[];
	AdditionalTasks: AdditionalTask[];
}

declare interface LoggedTaskDetail {
	UserName: string;
	UserEmail: string;
	UserRoleName: string;
	UserRoleCode: string;
	Date: string;
}

declare interface EmailLog {
	TaskInstanceLogId: number;
	AlertTitle: string;
	EmailCount: number;
	EncrAlertId: string;
}

declare interface AdditionalTask {
	TaskInstanceLogId: number;
	TaskName: string;
	TaskCode: string;
	TaskStatusName: string;
	TaskStatusCode: string;
	IsSubTask: boolean;
	TaskCreatedDate: string;
	AssignedTaskDetail?: AssignedTaskDetail;
	LoggedTaskDetail: LoggedTaskDetail2;
	EmailLogs: any[];
}

declare interface AssignedTaskDetail {
	UserName: string;
	UserEmail: string;
	UserRoleName: string;
	UserRoleCode: string;
	Date: string;
}

declare interface LoggedTaskDetail2 {
	UserName: string;
	UserEmail: string;
	UserRoleName: string;
	UserRoleCode: string;
	Date: string;
}

declare interface Data {
	nodes: Nodes[];
	links: Links[];
	numberOfColumns: number;
	currentStatus: number;
	currentSequence: number[];
	currentLinearSequence: Linear[];
}

declare interface Nodes {
	id: number;
	flowId: number;
	text: string;
	type: string;
	code: string;
}

declare interface Links {
	source: number;
	target: number;
	type: string;
	isCompleted: boolean;
	tasks: Tasks[];
	text: string; //This should be changed to filter the task name accordingly
	projectLogs: TrackingLog[];
	show: boolean;
	id?: number;
}

declare interface Linear {
	linearId: number;
	thisNode: number;
	nextNode: number | null;
	link: Links | null;
}

declare interface LinearExtended extends Linear {
	[key: string]: any;
}

declare type drawLinksList = ({
	dataLinksOriginal,
	sideDivContainer,
}: {
	dataLinksOriginal: Links[];
	sideDivContainer: any;
}) => void;

declare type createFlowChart = ([RawData, projectsData]: [
	RawData,
	ProjectsData
]) => void;

declare type drawNodesLinear = ({
	dataNodesOriginal,
	currentLinearSequence,
	svgLinear,
	width,
	currentStatus,
}: {
	dataNodesOriginal: Nodes[];
	currentLinearSequence: Linear[];
	svgLinear: d3.Selection<SVGGElement, unknown, null, undefined>;
	width: number;
	currentStatus: number;
}) => any;

declare type drawLinksLinear = ({
	dataLinksOriginal,
	nodesGroupLinear,
	currentLinearSequence,
	svgLinear,
	width,
}: {
	dataLinksOriginal: Links[];
	nodesGroupLinear: any;
	currentLinearSequence: Linear[];
	svgLinear: d3.Selection<SVGGElement, unknown, null, undefined>;
	width: number;
}) => void;

declare type drawLinks = ({
	dataLinks,
	svg,
	currentSequence,
}: {
	dataLinks: any;
	svg: d3.Selection<SVGGElement, unknown, null, undefined>;
	currentSequence: number[];
}) => any;

declare type detectCollision = (
	selection: d3.Selection<SVGGElement, unknown, null, undefined>,
	linksGroup: d3.Selection<SVGGElement, unknown, null, undefined>
) => void;

declare type fetchMethod = (
	url: string,
	rowFunction: Function | object | null
) => Promise<any>;

//Also:
// declare interface drawLinksList {
// 	(args: { dataLinksOriginal: Links[]; sideDivContainer: any }): void;
// }
