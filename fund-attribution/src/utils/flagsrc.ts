import type { List } from "./makelists";
import { flags60 } from "../assets/flags60";
import { flagsCDNList } from "../assets/flagscdnlist";

type GetFlagSrcProps = {
	donor: number;
	lists: List;
};

function getFlagSrc({ donor, lists }: GetFlagSrcProps): {
	flagSrc: string;
	faviconFlag: string;
} {
	const donorIsoCode = lists.donorISO2Codes[donor]!.toLowerCase();

	const missingFlag =
		donorIsoCode && flagsCDNList[donorIsoCode] ? false : true;

	const flagSrc =
		donor === 200
			? "https://flagcdn.com/gb-sct.svg" //Hardcoded: in flagsCDN Scotland is gb-sct, not gb-sc
			: missingFlag
				? flags60[donorIsoCode]
				: `https://flagcdn.com/${donorIsoCode}.svg`;

	const faviconFlag =
		donor === 200 || missingFlag
			? flagSrc
			: `https://flagcdn.com/w40/${donorIsoCode}.png`;

	return { flagSrc, faviconFlag };
}

export default getFlagSrc;
