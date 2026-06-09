import Box from "@mui/material/Box";
import type { List } from "../utils/makelists";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";

type ProjectsListProps = {
	lists: List;
	projectsList: string[];
	setShowList: React.Dispatch<React.SetStateAction<boolean>>;
};

function ProjectsList({ lists, projectsList, setShowList }: ProjectsListProps) {
	function handleClose() {
		setShowList(false);
	}

	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				justifyContent: "center",
				mb: 3,
				mt: 3,
				flexDirection: "column",
			}}
		>
			<Paper
				elevation={1}
				sx={{
					p: 2,
					backgroundColor: "#ffffff", // Pure white card to pop from page background
					borderRadius: "16px", // Softer, more modern rounded corners
					border: "1px solid #e0e0e0", // Clean subtle border instead of heavy shadow
					overflow: "hidden",
				}}
			>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					mb={3}
				>
					<Box
						display="flex"
						flexDirection="column"
					>
						<Typography
							sx={{ paddingLeft: "0.5em" }}
							variant="h6"
						>
							List of Projects:
						</Typography>
					</Box>
					<Button
						variant="outlined"
						onClick={handleClose}
						size="small"
						sx={{
							backgroundColor: "#f4faff", // Pure white card to pop from page background
							borderRadius: "16px", // Softer, more modern rounded corners
							border: "1px solid color.primary", // Clean subtle border instead of heavy shadow
							overflow: "hidden",
						}}
					>
						Close
					</Button>
				</Box>
				<TableContainer>
					<Table
						stickyHeader
						aria-label="project data table"
					>
						<TableHead>
							<TableRow>
								{[
									"Project",
									"Fund",
									"Allocation Source",
									"Organization Type",
									"Project Status",
									"End Date",
								].map(text => (
									<TableCell
										key={text}
										sx={{
											backgroundColor: "#f8f9fa", // Light gray header background
											color: "#5f6368", // Muted dark gray text
											fontWeight: 600, // Make headers bold
											fontSize: "0.85rem",
											borderBottom: "2px solid #edeff1",
										}}
									>
										{text}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{projectsList.map((projectCode, index) => {
								const thisProject =
									lists.projectDetails.get(projectCode);
								if (!thisProject) {
									return null;
								}
								return (
									<TableRow
										hover
										key={`${projectCode}-${index}`}
										sx={{
											"&:hover": {
												backgroundColor:
													"#f1f3f4 !important", // Crisper hover effect
											},
											"&:last-child td, &:last-child th":
												{
													border: 0,
												},
										}}
									>
										<TableCell>{projectCode}</TableCell>
										<TableCell>
											{lists.fundNames[thisProject.fund]}
										</TableCell>
										<TableCell>
											{
												lists.allocationSources[
													thisProject.allocationSource
												]
											}
										</TableCell>
										<TableCell>
											{
												lists.organizationTypes[
													thisProject.organizationType
												]
											}
										</TableCell>
										<TableCell>
											{
												lists.projectStatus[
													thisProject.projectStatusId
												]
											}
										</TableCell>
										<TableCell>
											{thisProject.endDate.toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "long",
													day: "numeric",
												},
											)}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</Box>
	);
}

export default ProjectsList;
