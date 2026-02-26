import {
	type ProjectSummaryObject,
	projectSummaryObjectSchema,
} from "./schemas";
import { type List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import { constants } from "./constants";

export type Datum = {
	reached: BeneficiariesObject;
	targeted: BeneficiariesObject;
	fund: number;
	year: number;
	projectCode: string;
	projectId: number;
	allocationSource: number;
	organizationType: number;
	organizationId: number;
	allocationType: number;
	allocationTypeId: number;
	endDate: Date;
	approvalDate: Date;
	budget: number;
};

export type Data = Datum[];

export type GenderAndAge = (typeof constants.beneficiaryCategories)[number];

export type BeneficiariesObject = {
	[K in GenderAndAge]: number;
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
	listsObj: List;
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists>>;
};

function processRawData({
	projectSummary,
	listsObj,
	setInDataLists,
}: ProcessRawDataParams): Data {
	const data: Data = [];

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

	projectSummary.forEach(row => {
		const parsedRow = projectSummaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisAllocationType =
				listsObj.allocationTypesCompleteList[
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`)
				];
			const thisOrganization =
				listsObj.organizationsCompleteList[row.GlobalUniqueOrgId];

			if (!thisAllocationType) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in allocation types",
				);
			}

			if (!thisOrganization) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in organizations",
				);
			}

			if (thisAllocationType && thisOrganization) {
				yearsSet.add(thisAllocationType.AllocationYear);
				fundsSet.add(row.PooledFundId);
				allocationSourcesSet.add(thisAllocationType.AllocationSourceId);
				organizationTypesSet.add(thisOrganization.OrganizationTypeId);
				organizationsSet.add(thisOrganization.GlobalUniqueId);
				allocationTypesSet.add(
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`),
				);

				listsObj.projectDetails.set(row.ChfId, {
					year: thisAllocationType.AllocationYear,
					fund: row.PooledFundId,
					allocationSource: thisAllocationType.AllocationSourceId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
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
					organizationId: thisOrganization.GlobalUniqueId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
					),
					allocationTypeId: row.AllocationtypeId,
					endDate: new Date(row.EndDate),
					approvalDate: new Date(row.PrjApprDate),
					budget: row.Budget,
					reached: generateBeneficiariesObjectSummary(row, "reached"),
					targeted: generateBeneficiariesObjectSummary(
						row,
						"targeted",
					),
				};

				data.push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"projectSummary",
				row,
				JSON.stringify(parsedRow.error),
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

function generateBeneficiariesObjectSummary(
	row: ProjectSummaryObject,
	type: "reached" | "targeted" | "disabledReached" | "disabledTargeted",
): BeneficiariesObject {
	let girls = 0,
		boys = 0,
		women = 0,
		men = 0;

	if (type === "reached") {
		girls = row.AchG || 0;
		boys = row.AchB || 0;
		women = row.AchW || 0;
		men = row.AchM || 0;
	}

	if (type === "targeted") {
		girls = row.BenG || 0;
		boys = row.BenB || 0;
		women = row.BenW || 0;
		men = row.BenM || 0;
	}

	if (type === "disabledReached") {
		girls = row.AchDisabledG || 0;
		boys = row.AchDisabledB || 0;
		women = row.AchDisabledW || 0;
		men = row.AchDisabledM || 0;
	}

	if (type === "disabledTargeted") {
		girls = row.DisabledG || 0;
		boys = row.DisabledB || 0;
		women = row.DisabledW || 0;
		men = row.DisabledM || 0;
	}

	return {
		girls,
		boys,
		women,
		men,
	};
}

export default processRawData;
