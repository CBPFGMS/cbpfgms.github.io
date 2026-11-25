import { useSyncExternalStore } from "react";
import progressStore from "../utils/progressstore";

function useProgress() {
	return useSyncExternalStore(
		progressStore.subscribe,
		progressStore.getSnapshot,
	);
}

export default useProgress;
