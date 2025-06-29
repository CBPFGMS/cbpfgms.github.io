import {
	type ProjectSummaryObject,
	projectSummaryObjectSchema,
	cvaObjectSchema,
	type CvaObject,
} from "./schemas";
import { type List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";

export type Datum = {
	fund: number;
	year: number;
	projectCode: string;
	projectId: number;
	allocationSource: number;
	organizationType: number;
	organizationId: number | null;
	organizationGlobalId: number;
	allocationType: number;
	allocationTypeId: number;
	endDate: Date;
	approvalDate: Date;
	budget: number;
	cvaData: CvaDatum[] | null;
};

export type Data = Datum[];

type CvaDatum = {
	cvaId: number;
	organizationTypeId: number;
	sectorId: number;
	budget: number;
};

type CvaMapValue = {
	projectCode: string;
	projectId: number;
	cva: CvaDatum[];
};

export type InDataLists = {
	years: Set<number>;
	sectors: Set<number>;
	allocationTypes: Set<number>;
	allocationSources: Set<number>;
	funds: Set<number>;
	organizationTypes: Set<number>;
	organizations: Set<number>;
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InDataListsValues = SetType<InDataLists>;

type ProcessRawDataParams = {
	projectSummary: ProjectSummaryObject[];
	cvaData: CvaObject[];
	listsObj: List;
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists>>;
};

function processRawData({
	projectSummary,
	cvaData,
	listsObj,
	setInDataLists,
}: ProcessRawDataParams): Data {
	const data: Data = [];
	const cvaDataMap: Map<string, CvaMapValue> = new Map();

	const yearsSet: Set<InDataListsValues["years"]> = new Set();
	const sectorsSet: Set<InDataListsValues["sectors"]> = new Set();
	const allocationTypesSet: Set<InDataListsValues["allocationTypes"]> =
		new Set();
	const allocationSourcesSet: Set<InDataListsValues["allocationSources"]> =
		new Set();
	const fundsSet: Set<InDataListsValues["funds"]> = new Set();
	const organizationTypesSet: Set<InDataListsValues["organizationTypes"]> =
		new Set();
	const organizationsSet: Set<InDataListsValues["organizations"]> = new Set();

	cvaData.forEach(row => {
		const parsedRow = cvaObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const cvaObject = {
				cvaId: row.CVATypeId,
				organizationTypeId: row.OrganizationTypeId,
				sectorId: row.GlobalClusterId,
				budget: row.TransferAmount ?? 0,
			};
			if (!cvaDataMap.has(row.ChfProjectCode)) {
				cvaDataMap.set(row.ChfProjectCode, {
					projectCode: row.ChfProjectCode,
					projectId: row.CHFId,
					cva: [cvaObject],
				});
			} else {
				const projectData = cvaDataMap.get(row.ChfProjectCode);
				if (projectData) {
					projectData.cva.push(cvaObject);
				} else {
					warnProjectNotFound(
						row.ChfProjectCode,
						row,
						"Project not found in cvaDataMap"
					);
				}
			}
		} else {
			warnInvalidSchema("cvaData", row, JSON.stringify(parsedRow.error));
		}
	});

	projectSummary.forEach(row => {
		const parsedRow = projectSummaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisAllocationType =
				listsObj.allocationTypesCompleteList[
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`)
				];
			const thisOrganization =
				listsObj.organizationsCompleteList[row.GlobalUniqueOrgId];
			const thisCvaData = cvaDataMap.get(row.ChfProjectCode);

			if (!thisAllocationType) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in allocation types"
				);
			}

			if (!thisOrganization) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in organizations"
				);
			}

			if (thisAllocationType && thisOrganization) {
				if (thisCvaData) {
					yearsSet.add(thisAllocationType.AllocationYear);
					fundsSet.add(row.PooledFundId);
					allocationSourcesSet.add(
						thisAllocationType.AllocationSourceId
					);
					organizationTypesSet.add(
						thisOrganization.OrganizationTypeId
					);
					if (thisOrganization.GlobalOrgId) {
						organizationsSet.add(thisOrganization.GlobalOrgId);
					}
					allocationTypesSet.add(
						parseFloat(
							`${row.PooledFundId}.${row.AllocationtypeId}`
						)
					);
					thisCvaData?.cva.forEach(cva => {
						sectorsSet.add(cva.sectorId);
					});
				}

				listsObj.projectDetails.set(row.ChfId, {
					year: thisAllocationType.AllocationYear,
					fund: row.PooledFundId,
					allocationSource: thisAllocationType.AllocationSourceId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`
					),
					endDate: new Date(row.EndDate),
					approvalDate: new Date(row.PrjApprDate),
					projectStatusId: row.GlbPrjStatusId,
				});

				const objDatum: Datum = {
					fund: row.PooledFundId,
					year: thisAllocationType.AllocationYear,
					projectCode: row.ChfProjectCode,
					projectId: row.ChfId,
					allocationSource: thisAllocationType.AllocationSourceId,
					organizationType: thisOrganization.OrganizationTypeId,
					organizationId: thisOrganization.GlobalOrgId,
					organizationGlobalId: thisOrganization.GlobalUniqueId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`
					),
					allocationTypeId: row.AllocationtypeId,
					endDate: new Date(row.EndDate),
					approvalDate: new Date(row.PrjApprDate),
					budget: row.Budget,
					cvaData: thisCvaData ? thisCvaData.cva : null,
				};

				data.push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"projectSummary",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	setInDataLists(() => ({
		years: yearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
		organizations: organizationsSet,
	}));

	return data;
}

export default processRawData;
