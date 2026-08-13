import type { List } from "./makelists";
import { flags60 } from "../assets/flags60";

type GetFlagSrcProps = {
	donor: number;
	lists: List;
	missingFlags: string[];
};

function getFlagSrc({ donor, lists, missingFlags }: GetFlagSrcProps): string {
	const flagSrc =
		donor === 200
			? "https://flagcdn.com/gb-sct.svg" //Hardcoded: in flagsCDN Scotland is gb-sct, not gb-sc
			: missingFlags.includes(lists.donorISO2Codes[donor]!.toLowerCase())
				? flags60[lists.donorISO2Codes[donor]!.toLowerCase()]
				: `https://flagcdn.com/${lists.donorISO2Codes[donor]!.toLowerCase()}.svg`;

	return flagSrc;
}

export default getFlagSrc;
