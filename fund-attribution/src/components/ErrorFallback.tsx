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

const kindExplanations: Record<DataSourceErrorKind, string> = {
	http: "The server returned an HTTP error status. This confirms a response was received, but does not establish whether the response came from the service or an intermediary.",
	timeout:
		"The request did not complete within 30 seconds. A slow connection, an overloaded service, or traffic filtering could cause this; the page cannot determine which.",
	"request-failed":
		"The browser did not provide a readable response. A follow-up check may receive an opaque response, but cannot reveal its status or body or identify the cause of the original failure.",
	interrupted:
		"The response began, but its body could not be fully read. Reloading may succeed if the interruption was temporary.",
	"invalid-response":
		"The response was empty, HTML, or could not be parsed as the expected data format.",
};

function getStatusLabel(failure: DataSourceError): string {
	switch (failure.kind) {
		case "http":
			return `HTTP ${failure.status ?? "error"}`;
		case "timeout":
			return "Timed out";
		case "request-failed":
			switch (failure.probeResult) {
				case "opaque-response":
					return "Opaque response on retry";
				case "probe-timed-out":
					return "Request failed; check timed out";
				case "probe-failed":
				case undefined:
					return "Request failed; cause unknown";
			}
			break;
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

function safeUrl(url: string): string {
	try {
		const parsedUrl = new URL(url, window.location.href);
		return `${parsedUrl.origin}${parsedUrl.pathname}`;
	} catch {
		return "URL unavailable";
	}
}

function buildReport(
	failures: DataSourceError[],
	otherErrorCount: number,
): string {
	const lines = [
		"Attribution dashboard data-loading report",
		`Time: ${new Date().toISOString()}`,
		`Page: ${window.location.origin}${window.location.pathname}`,
		`Browser reports online: ${navigator.onLine}`,
		"",
		"Host | Status | File | URL path | Detail",
	];

	failures.forEach(failure => {
		lines.push(
			[
				failure.host,
				getStatusLabel(failure),
				failure.fileName,
				safeUrl(failure.url),
				failure.message,
			].join(" | "),
		);
	});

	if (otherErrorCount > 0) {
		lines.push("", `Other application errors: ${otherErrorCount}`);
	}
	return lines.join("\n");
}

async function copyText(text: string): Promise<boolean> {
	if (navigator.clipboard) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Fall back when clipboard access is unavailable or denied.
		}
	}

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
	const presentKinds = [...new Set(failures.map(failure => failure.kind))];

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
						{failures.length
							? "Some data sources could not be loaded"
							: "Something went wrong"}
					</Typography>
					<Typography
						id="data-error-description"
						color="text.secondary"
						sx={{ mb: 2 }}
					>
						{failures.length
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
																			{failure.probeResult ===
																				"opaque-response" &&
																				" A follow-up check received an opaque response; its status and contents are not available to this page."}
																			{failure.probeResult ===
																				"probe-timed-out" &&
																				" The follow-up check also timed out."}
																			{failure.probeResult ===
																				"probe-failed" &&
																				" The follow-up check could not confirm a response."}
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
													Additional application error
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
												Some dashboard data could not be
												processed.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Alert
							severity="error"
							sx={{ mb: 2 }}
						>
							<AlertTitle>Something went wrong</AlertTitle>
							The dashboard could not be prepared or displayed.
							Please try again, or reload the page if the problem
							persists.
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
						<Alert
							severity="info"
							icon={false}
						>
							<AlertTitle>What you can do</AlertTitle>
							<Typography
								variant="body2"
								component="p"
							>
								Try again or reload the page. If the problem
								continues on a managed network, share the listed
								hosts and copied diagnostic details with your IT
								team. For HTTP errors, retry later and contact
								support if they persist.
							</Typography>
						</Alert>
						<Alert
							severity="warning"
							icon={false}
						>
							<AlertTitle>What this page cannot fix</AlertTitle>
							<Typography
								variant="body2"
								component="p"
							>
								This page cannot repair a remote service or
								change your network’s access rules. Data that
								depends on an affected service may remain
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
							<Button
								variant="outlined"
								onClick={handleCopy}
							>
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
