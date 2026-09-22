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
	fund: number;
};

function processContributions({
	contributionsData,
	year,
	tranche,
}: ProcessContributionsParams): Data {
	const data: Data = [];

	contributionsData.forEach(datum => {
		if (
			datum.year !== year ||
			(tranche !== "all" && datum.tranche !== tranche)
		) {
			return;
		}

		const foundFund = data.find(d => d.fund === datum.fund);

		if (foundFund) {
			constants.contributionTypes.forEach(type => {
				foundFund[type] +=
					type === "total"
						? datum.totalAmount
						: type === "paid"
							? datum.paidAmount
							: datum.pledgedAmount;
			});
		} else {
			const obj: Datum = {
				fund: datum.fund,
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
