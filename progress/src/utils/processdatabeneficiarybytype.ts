import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import calculateStatus from "./calculatestatus";
import { BeneficiariesObject } from "./processrawdata";
import constants from "./constants";

export type DatumBeneficiaryByType = {
	type: BeneficiaryTypesList;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

export type BeneficiaryTypesList = (typeof beneficiariesSplitOrder)[number];

type ProcessDataBeneficiaryByTypeProps = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
};

const { beneficiariesSplitOrder, beneficiaryCategories } = constants;

function processDataBeneficiaryByType({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	lists,
}: ProcessDataBeneficiaryByTypeProps) {
	const dataBeneficiaryByType: DatumBeneficiaryByType[] = [];

	beneficiariesSplitOrder.forEach(type => {
		const targeted = beneficiaryCategories.reduce((acc, category) => {
			acc[category] = 0;
			return acc;
		}, {} as BeneficiariesObject);
		const reached = beneficiaryCategories.reduce((acc, category) => {
			acc[category] = 0;
			return acc;
		}, {} as BeneficiariesObject);
		const obj: DatumBeneficiaryByType = { type, targeted, reached };

		dataBeneficiaryByType.push(obj);
	});

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists);
		if (implementationStatus.includes(thisStatus)) {
			if (
				year.includes(datum.year) &&
				fund.includes(datum.fund) &&
				allocationSource.includes(datum.allocationSource) &&
				allocationType.includes(datum.allocationType)
			) {
				for (const type in datum.reachedByBeneficiaryType) {
					const foundType = dataBeneficiaryByType.find(
						d => d.type === parseInt(type)
					);
					if (foundType) {
						beneficiaryCategories.forEach(category => {
							foundType.reached[category] +=
								datum.reachedByBeneficiaryType[
									+type as BeneficiaryTypesList
								][category];
						});
					}
				}
				for (const type in datum.targetedByBeneficiaryType) {
					const foundType = dataBeneficiaryByType.find(
						d => d.type === parseInt(type)
					);
					if (foundType) {
						beneficiaryCategories.forEach(category => {
							foundType.targeted[category] +=
								datum.targetedByBeneficiaryType[
									+type as BeneficiaryTypesList
								][category];
						});
					}
				}
			}
		}
	});

	return dataBeneficiaryByType;
}

export default processDataBeneficiaryByType;
