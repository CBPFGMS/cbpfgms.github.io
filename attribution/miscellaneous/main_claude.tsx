import { StrictMode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import "./styles/index.css";
import "./styles/d3chartstyles.css";
import "./styles/d3chartstylespbialp.css";
import App from "./App.tsx";
import UnsupportedScreen from "./components/UnsupportedScreen.tsx";
import { constants } from "./utils/constants.ts";

// The data-startyear attribute is set by the host page: accept exactly four digits, not in the future.
function parseStartYear(value: string | undefined): number | null {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const year = /^\d{4}$/.test(trimmed) ? Number(trimmed) : NaN;
	if (Number.isNaN(year) || year > constants.currentYear) {
		console.warn(`Ignoring invalid data-startyear "${value}".`);
		return null;
	}
	return year;
}

const mediaQuery = window.matchMedia(`(min-width: ${constants.minWidth}px)`);

function subscribeToWidth(onChange: () => void) {
	mediaQuery.addEventListener("change", onChange);
	return () => mediaQuery.removeEventListener("change", onChange);
}

function getIsWideEnough() {
	return mediaQuery.matches;
}

function Root({ startYear }: { startYear: number | null }) {
	const isWideEnough = useSyncExternalStore(
		subscribeToWidth,
		getIsWideEnough,
	);
	return isWideEnough ? <App startYear={startYear} /> : <UnsupportedScreen />;
}

// Last line of defence. Deliberately dependency-free (no MUI, no app code), so it cannot fail
// for the same reason as whatever it is replacing.
function RootFallback() {
	return (
		<div role="alert" style={{ padding: 24, fontFamily: "sans-serif" }}>
			<h1 style={{ fontSize: "1.25rem" }}>
				The dashboard could not be displayed
			</h1>
			<p>
				An unexpected error occurred. Please reload the page. If the
				problem persists, contact the support team.
			</p>
			<button type="button" onClick={() => window.location.reload()}>
				Reload page
			</button>
		</div>
	);
}

const rootElement = document.getElementById(constants.rootElementId);

if (!rootElement) {
	console.error(
		`Dashboard root element #${constants.rootElementId} was not found on the page.`,
	);
} else {
	createRoot(rootElement).render(
		<StrictMode>
			<ErrorBoundary
				FallbackComponent={RootFallback}
				onError={error => console.error("Unhandled dashboard error:", error)}
			>
				<Root startYear={parseStartYear(rootElement.dataset.startyear)} />
			</ErrorBoundary>
		</StrictMode>,
	);
}
