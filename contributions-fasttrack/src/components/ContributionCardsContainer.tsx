import Grid from "@mui/material/Grid";
import type { TopValuesData } from "../utils/processtopvalues";
import type { ContributionType } from "./MainContainer";
import { constants } from "../utils/constants";
import ContributionCard from "./ContributionCard";
import type { List } from "../utils/makelists";

type CardsContainerProps = {
	topValuesData: TopValuesData;
	contributionType: ContributionType;
	setContributionType: React.Dispatch<React.SetStateAction<ContributionType>>;
	lists: List;
};

const { contributionTypes } = constants;

function CardsContainer({
	topValuesData,
	contributionType,
	setContributionType,
	lists,
}: CardsContainerProps) {
	return (
		<Grid
			container
			spacing={3}
			sx={{
				width: "100%",
			}}
		>
			{contributionTypes.map(type => {
				return (
					<Grid
						size={4}
						key={type}
					>
						<ContributionCard
							topValuesDatum={topValuesData[type]}
							contributionType={contributionType}
							type={type}
							setContributionType={setContributionType}
							lists={lists}
						/>
					</Grid>
				);
			})}
		</Grid>
	);
}

export default CardsContainer;
