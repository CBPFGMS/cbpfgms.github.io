import {
	PreProcessDataParams,
	PreProcessDataReturn,
	BySectorYear,
	ByDisabilityYear,
	ByLocationYear,
	ByTypeYear,
	ByOrganizationYear,
	GenericYear,
} from "../types.ts";
import {
	bySectorObjSchema,
	byDisabilityObjSchema,
	byLocationObjSchema,
	byTypeObjSchema,
	byOrganizationObjSchema,
} from "../schemas.ts";
import warnInvalidSchema from "./warninvalid.ts";

function preProcessData({
	bySector,
	byDisability,
	byLocation,
	byType,
	byOrganization,
	setInDataLists,
}: PreProcessDataParams): PreProcessDataReturn {
	const reportYearsSet = new Set<number>();
	const sectorsSet = new Set<number>();
	const allocationTypesSet = new Set<number>();
	const allocationSourcesSet = new Set<number>();
	const beneficiaryTypesSet = new Set<number>();
	const fundsSet = new Set<number>();
	const organizationTypesSet = new Set<number>();

	const bySectorYear: BySectorYear = [];
	const byDisabilityYear: ByDisabilityYear = [];
	const byLocationYear: ByLocationYear = [];
	const byTypeYear: ByTypeYear = [];
	const byOrganizationYear: ByOrganizationYear = [];
	const allocatedTotals: ByDisabilityYear = [];

	byDisability.forEach(row => {
		const parsedRow = byDisabilityObjSchema.safeParse(row);
		if (parsedRow.success) {
			fundsSet.add(row.PooledFundId);
			reportYearsSet.add(row.ReportApprovedDate.getFullYear());
			allocationTypesSet.add(row.AllocationtypeId);
			allocationSourcesSet.add(row.AllocationSourceId);
			populateYear<typeof row>(
				row,
				byDisabilityYear,
				row.ReportApprovedDate.getFullYear()
			);
			populateYear<typeof row>(row, allocatedTotals, row.AllocationYear);
		} else {
			warnInvalidSchema("ByGender_Disability", row, JSON.stringify(parsedRow.error));
		}
	});

	bySector.forEach(row => {
		if (bySectorObjSchema.safeParse(row).success) {
			sectorsSet.add(row.ClusterId);
			populateYear<typeof row>(
				row,
				bySectorYear,
				row.ReportApprovedDate.getFullYear()
			);
		} else {
			warnInvalidSchema("BySector", row);
		}
	});

	byLocation.forEach(row => {
		if (byLocationObjSchema.safeParse(row).success) {
			populateYear<typeof row>(
				row,
				byLocationYear,
				row.ApprovedDate.getFullYear()
			);
		} else {
			warnInvalidSchema("ByLocation", row);
		}
	});

	byType.forEach(row => {
		if (byTypeObjSchema.safeParse(row).success) {
			beneficiaryTypesSet.add(row.BeneficiaryTypeId);
			populateYear<typeof row>(
				row,
				byTypeYear,
				row.ReportApprovedDate.getFullYear()
			);
		} else {
			warnInvalidSchema("ByType", row);
		}
	});

	byOrganization.forEach(row => {
		if (byOrganizationObjSchema.safeParse(row).success) {
			organizationTypesSet.add(row.OrganizationType);
			populateYear<typeof row>(
				row,
				byOrganizationYear,
				row.ReportApprovedDate.getFullYear()
			);
		} else {
			warnInvalidSchema("ByOrganization", row);
		}
	});

	setInDataLists({
		reportYears: reportYearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		beneficiaryTypes: beneficiaryTypesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
	});

	bySectorYear.sort((a, b) => a.year - b.year);
	byDisabilityYear.sort((a, b) => a.year - b.year);
	byLocationYear.sort((a, b) => a.year - b.year);
	byTypeYear.sort((a, b) => a.year - b.year);
	byOrganizationYear.sort((a, b) => a.year - b.year);

	return {
		bySectorYear,
		byDisabilityYear,
		byLocationYear,
		byTypeYear,
		byOrganizationYear,
		allocatedTotals,
	};
}

function populateYear<TObj>(
	row: TObj,
	dataArray: GenericYear<TObj>,
	yearValue: number
): void {
	const foundYear = dataArray.find(year => year.year === yearValue);
	if (foundYear) {
		foundYear.values.push(row);
	} else {
		dataArray.push({
			year: yearValue,
			values: [row],
		});
	}
}

export default preProcessData;
