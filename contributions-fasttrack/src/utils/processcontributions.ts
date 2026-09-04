import type { ContributionsData } from "./processrawdata";
import type { Tranche } from "../components/MainContainer";
import { constants } from "../utils/constants";

type ProcessContributionsParams = {
	contributionsData: ContributionsData;
	year: number;
	tranche: Tranche;
};

export type Data = Datum[];

type Datum = {
	[type in (typeof constants.contributionTypes)[number]]: number;
} & {
	name: string;
};

function processContributions({
	contributionsData,
	year,
	tranche,
}: ProcessContributionsParams): Data {
	const data: Data = [];

	contributionsData.forEach(datum => {
		if (
			datum.year === year &&
			(tranche === "all" || datum.tranche === tranche)
		) {
			const obj: Datum = {
				name: datum.fundName,
			} as Datum;

			constants.contributionTypes.forEach(type => {
				obj[type] =
					type === "total"
						? datum.totalAmount
						: type === "paid"
							? datum.paidAmount
							: datum.pledgedAmount;
			});

			data.push(obj);
		}
	});

	return data;
}

export default processContributions;
