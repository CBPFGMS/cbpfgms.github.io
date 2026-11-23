import { useState } from "react";
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
import DataSourceError, {
	type DataSourceErrorKind,
} from "../utils/data-source-error";
import { constants } from "../utils/constants";

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

// What each kind of failure does, and does not, tell us. The browser hides the real cause of
// network-level failures, so these texts only list possibilities.
const kindExplanations: Record<DataSourceErrorKind, string> = {
	http: "An HTTP status means the service responded, but returned an error.",
	timeout:
		"A timeout means no complete response arrived in time. This can be a slow connection, an overloaded service, or traffic silently dropped by a firewall or VPN; the browser cannot tell which.",
	unreachable:
		"“Could not connect” means the browser got no answer from the service at all. Possible causes include no internet connection, DNS or firewall restrictions, a VPN or proxy, or a browser extension blocking the request; the browser cannot reliably identify which one.",
	unreadable:
		"“Response not readable” means something answered, but the browser did not let this page read the answer. Typical causes are a proxy or firewall returning its own page, a redirect to a login or block page, or a server configuration (CORS) problem.",
	interrupted:
		"The connection dropped while data was being downloaded. This is usually a network problem; trying again often helps.",
	"invalid-response":
		"An invalid response means the service returned data the dashboard could not use; a proxy or access page may have been returned instead.",
};

const kindOrder = Object.keys(kindExplanations) as DataSourceErrorKind[];

function getStatusLabel(failure: DataSourceError): string {
	switch (failure.kind) {
		case "http":
			return `HTTP ${failure.status ?? "error"}`;
		case "timeout":
			return "No response (timed out)";
		case "unreachable":
			return "Could not connect";
		case "unreadable":
			return "Response not readable";
		case "interrupted":
			return "Connection interrupted";
		case "invalid-response":
			return "Invalid response";
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

function buildReport(failures: DataSourceError[], otherErrors: number): string {
	const hosts = [...new Set(failures.map(failure => failure.host))];
	const lines = [
		`${constants.pageName} - data loading report`,
		`Time: ${new Date().toISOString()}`,
		`Page: ${window.location.href}`,
		`Browser: ${navigator.userAgent}`,
		`Browser reports online: ${navigator.onLine}`,
		`Affected hosts: ${hosts.join(", ") || "none"}`,
		"",
		"host | kind | status | file | url | message",
	];
	failures.forEach(failure =>
		lines.push(
			[
				failure.host,
				failure.kind,
				failure.status ?? "-",
				failure.fileName,
				failure.url,
				failure.message,
			].join(" | "),
		),
	);
	if (otherErrors > 0) {
		lines.push("", `Other (non-network) errors: ${otherErrors}`);
	}
	return lines.join("\n");
}

async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback for contexts where the async clipboard API is unavailable.
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			return document.execCommand("copy");
		} catch {
			return false;
		} finally {
			document.body.removeChild(textarea);
		}
	}
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
		"idle",
	);
	const reasons = error instanceof AggregateError ? error.errors : [error];
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

	const presentKinds = kindOrder.filter(kind =>
		failures.some(failure => failure.kind === kind),
	);

	const handleCopy = async () => {
		const copied = await copyText(
			buildReport(failures, reasons.length - failures.length),
		);
		setCopyState(copied ? "copied" : "failed");
		window.setTimeout(() => setCopyState("idle"), 2500);
	};

	const copyLabel =
		copyState === "copied"
			? "Copied"
			: copyState === "failed"
			  ? "Copy failed"
			  : "Copy details for IT";

	return (
		<Box
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
						{failures.length > 0
							? "Some data sources could not be loaded"
							: "Something went wrong"}
					</Typography>
					<Typography
						id="data-error-description"
						color="text.secondary"
						sx={{ mb: 2 }}
					>
						{failures.length > 0
							? "The dashboard could not load all the data it needs. Review the affected services and what you can try below."
							: "The dashboard could not be prepared or displayed."}
					</Typography>

					{failures.length > 0 ? (
						<TableContainer
							component={Paper}
							variant="outlined"
							sx={{ mb: 2 }}
						>
							<Table
								size="small"
								aria-label="Failed data services"
							>
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
																flexWrap:
																	"wrap",
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
							<AlertTitle>Something went wrong</AlertTitle>
							The dashboard data could not be prepared or
							displayed. Try again, or reload the page, and
							contact the support team if the problem persists.
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
								Try again, or reload the page. If the problem
								continues: on a managed network, send the
								listed hosts (use “Copy details for IT”) to your
								IT team; for HTTP errors, retry later and
								contact support if they persist.
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

					{presentKinds.map(kind => (
						<Typography
							key={kind}
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							{kindExplanations[kind]}
						</Typography>
					))}

					<Box
						sx={{
							display: "flex",
							justifyContent: "flex-end",
							flexWrap: "wrap",
							gap: 1,
						}}
					>
						{failures.length > 0 && (
							<Button variant="outlined" onClick={handleCopy}>
								{copyLabel}
							</Button>
						)}
						<Button
							variant="text"
							color="error"
							onClick={() => window.location.reload()}
						>
							Reload page
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={resetErrorBoundary}
							autoFocus
						>
							Try again
						</Button>
					</Box>
				</Box>
			</Paper>
		</Box>
	);
}

export default ErrorFallback;
