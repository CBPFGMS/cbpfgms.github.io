export type ProgressState = {
	progress: number;
	totalFiles: number;
};

let state: ProgressState = { progress: 0, totalFiles: 0 };
const listeners = new Set<() => void>();

function emitChange(): void {
	listeners.forEach(listener => listener());
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot(): ProgressState {
	return state;
}

// Call once, synchronously, right before a batch of fetches is kicked off.
// Safe to call from outside a component (e.g. from fetchAppData) - it just
// mutates a plain module-level value and notifies subscribers, it doesn't
// touch React state directly.
function reset(totalFiles: number): void {
	state = { progress: 0, totalFiles };
	emitChange();
}

// Pass this directly as trackProgress's onSettled callback.
function increment(): void {
	state = { ...state, progress: state.progress + 1 };
	emitChange();
}

const progressStore = { subscribe, getSnapshot, reset, increment };

export default progressStore;
