import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { type FallbackProps } from "react-error-boundary";
import DataSourceError from "../utils/data-source-error";

type ServiceDetails = {
	label: string;
	effect: string;
};

const serviceDetails: Record<string, ServiceDetails> = {
	"raw.githubusercontent.com": {
		label: "Dashboard data files",
		effect: "Charts, figures, and other data that use these files may be unavailable.",
	},
	"pfbi-eastus2-api-site.azurewebsites.net": {
		label: "Donor attribution API",
		effect: "Donor contribution and attribution figures may be unavailable.",
	},
};

function getStatusLabel(failure: DataSourceError): string {
	switch (failure.kind) {
		case "http":
			return `HTTP ${failure.status ?? "error"}`;
		case "invalid-response":
			return "Invalid response";
		case "network":
			return "Connection failed";
	}
}

function getServiceDetails(host: string): ServiceDetails {
	return (
		serviceDetails[host] ?? {
			label: "External data service",
			effect: "Data that depends on this service may be unavailable.",
		}
	);
}

function Error({ error }: FallbackProps) {
	console.error(error);
	const reasons =
		error instanceof AggregateError ? error.errors : [error];
	const failures = reasons.filter(
		(reason): reason is DataSourceError =>
			reason instanceof DataSourceError,
	);
	const groupedFailures = new Map<string, DataSourceError[]>();
	failures.forEach(failure => {
		const group = groupedFailures.get(failure.host) ?? [];
		group.push(failure);
		groupedFailures.set(failure.host, group);
	});

	const hasNetworkFailure = failures.some(
		failure => failure.kind === "network",
	);
	const hasHttpFailure = failures.some(failure => failure.kind === "http");
	const hasInvalidResponse = failures.some(
		failure => failure.kind === "invalid-response",
	);

	return (
		<Box
			component="main"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="data-error-title"
			aria-describedby="data-error-description"
			sx={{
				position: "fixed",
				inset: 0,
				zIndex: 1400,
				overflowY: "auto",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				p: { xs: 1, sm: 3 },
				bgcolor: "rgba(15, 23, 32, 0.62)",
			}}
		>
			<Paper
				component="section"
				elevation={12}
				sx={{
					width: "min(900px, 100%)",
					maxHeight: "100%",
					overflowY: "auto",
					borderTop: "6px solid",
					borderColor: "error.main",
					borderRadius: 2,
				}}
			>
				<Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2 }}>
					<Typography
						id="data-error-title"
						component="h1"
						variant="h5"
						sx={{ fontWeight: 700 }}
						gutterBottom
					>
						Some data sources could not be loaded
					</Typography>
					<Typography
						id="data-error-description"
						color="text.secondary"
						sx={{ mb: 2 }}
					>
						The dashboard could not load all the data it needs.
						Review the affected services and what you can try
						below.
					</Typography>

					{failures.length > 0 ? (
						<TableContainer
							component={Paper}
							variant="outlined"
							sx={{ mb: 2 }}
						>
							<Table size="small" aria-label="Failed data services">
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>
											Service
										</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>
											Status
										</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>
											Effect
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{[...groupedFailures].map(
										([host, serviceFailures]) => {
											const statuses = [
												...new Set(
													serviceFailures.map(
														getStatusLabel,
													),
												),
											];
											const details =
												getServiceDetails(host);

											return (
												<TableRow key={host}>
													<TableCell>
														<Typography
															variant="body2"
															sx={{
																fontWeight: 600,
															}}
														>
															{details.label}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															sx={{
																wordBreak:
																	"break-word",
															}}
														>
															{host}
														</Typography>
													</TableCell>
													<TableCell>
														<Box
															sx={{
																display: "flex",
																flexWrap: "wrap",
																gap: 0.5,
															}}
														>
															{statuses.map(
																status => (
																	<Chip
																		key={
																			status
																		}
																		label={
																			status
																		}
																		color="error"
																		size="small"
																		variant="outlined"
																	/>
																),
															)}
														</Box>
														<details>
															<summary>
																{
																	serviceFailures.length
																}{" "}
																failed{" "}
																{serviceFailures.length ===
																1
																	? "request"
																	: "requests"}
															</summary>
															<ul>
																{serviceFailures.map(
																	(
																		failure,
																		index,
																	) => (
																		<li
																			key={`${failure.fileName}-${index}`}
																		>
																			<strong>
																				{
																					failure.fileName
																				}
																			</strong>
																			:{" "}
																			{
																				failure.message
																			}
																		</li>
																	),
																)}
															</ul>
														</details>
													</TableCell>
													<TableCell>
														{details.effect}
													</TableCell>
												</TableRow>
											);
										},
									)}
									{reasons.length > failures.length && (
										<TableRow>
											<TableCell>
												<Typography
													variant="body2"
													sx={{ fontWeight: 600 }}
												>
													Additional data error
												</Typography>
											</TableCell>
											<TableCell>
												<Chip
													label="Failed"
													color="error"
													size="small"
													variant="outlined"
												/>
											</TableCell>
											<TableCell>
												Some dashboard data could not
												be processed.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Alert severity="error" sx={{ mb: 2 }}>
							<AlertTitle>Data loading failed</AlertTitle>
							The dashboard data could not be prepared. Please
							reload the page or contact the support team if the
							problem persists.
						</Alert>
					)}

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "1fr 1fr",
							},
							gap: 2,
							mb: 2,
						}}
					>
						<Alert severity="info" icon={false}>
							<AlertTitle>What you can do</AlertTitle>
							<Typography variant="body2" component="p">
								Reload the page to retry. For connection
								failures, check your connection; on a managed
								network, share the listed host with your IT
								team. For HTTP errors, retry later and contact
								support if they persist.
							</Typography>
						</Alert>
						<Alert severity="warning" icon={false}>
							<AlertTitle>What this page cannot fix</AlertTitle>
							<Typography variant="body2" component="p">
								This page cannot repair a remote service outage
								or change your network’s access rules. Data
								dependent on an affected service may remain
								unavailable until access is restored.
							</Typography>
						</Alert>
					</Box>

					{hasNetworkFailure && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							A browser connection failure can be caused by
							connectivity, CORS, a VPN, proxy, or firewall; the
							browser cannot reliably identify which one.
						</Typography>
					)}
					{hasInvalidResponse && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							An invalid response means the service returned data
							the dashboard could not use; a proxy or access page
							may have been returned instead.
						</Typography>
					)}
					{hasHttpFailure && (
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							An HTTP status means the service responded, but
							returned an error.
						</Typography>
					)}

					<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
						<Button
							variant="contained"
							color="error"
							onClick={() => window.location.reload()}
							autoFocus
						>
							Reload page
						</Button>
					</Box>
				</Box>
			</Paper>
		</Box>
	);
}

export default Error;
