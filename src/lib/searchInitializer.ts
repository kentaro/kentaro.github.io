import type { LoadingProgress } from "@/lib/search";
import {
	defaultProgress,
	initializeSearchDB,
	loadSearchData,
	updateProgress,
	getCurrentProgress,
} from "@/lib/search";

// グローバル初期化状態
// モジュールスコープで一度だけ初期化される変数
const state = {
	isInitialized: false,
	isInitializing: false,
	isDataLoaded: false,
};

// コールバック管理（プログレス用）
const progressCallbacks: Record<string, (progress: LoadingProgress) => void> =
	{};

// 完了イベントリスナー登録（モーダル再レンダリングなしで使用）
const completionListeners: Array<() => void> = [];

// 最後の通知されたプログレス - 重複通知を避けるため
let lastNotifiedProgress: LoadingProgress = { ...defaultProgress };

// 初期化完了通知のフラグ - 通知が1回だけ行われるようにする
let hasNotifiedCompletion = false;

/**
 * 初期化状態を取得する関数
 */
export function getInitializationStatus() {
	return {
		isInitialized: state.isInitialized,
		isInitializing: state.isInitializing,
		isDataLoaded: state.isDataLoaded,
	};
}

/**
 * 完了イベントリスナーを登録
 * これはステート更新を伴わないため再レンダリングを引き起こしにくい
 */
export function addCompletionListener(listener: () => void) {
	// 同じリスナーが既に登録されていないことを確認
	const alreadyRegistered = completionListeners.some(
		(existingListener) => existingListener === listener,
	);

	// 重複登録を防止
	if (!alreadyRegistered) {
		console.log(
			"[SearchInitializer] Adding completion listener, count before:",
			completionListeners.length,
		);
		completionListeners.push(listener);
		console.log(
			"[SearchInitializer] New listener count:",
			completionListeners.length,
		);
	} else {
		console.log("[SearchInitializer] Listener already registered, skipping");
		return () => {}; // 何もしないクリーンアップ関数を返す（既に登録済み）
	}

	// 既に初期化済みの場合は即時通知（1回だけ）
	if (state.isInitialized) {
		console.log(
			"[SearchInitializer] DB already initialized, calling listener immediately",
		);
		try {
			// コールスタックをクリアするために非同期実行
			setTimeout(() => {
				if (state.isInitialized) {
					// 念のため二重チェック
					listener();
				}
			}, 0);
		} catch (error) {
			console.error(
				"[SearchInitializer] Error calling completion listener:",
				error,
			);
		}
	}

	// クリーンアップ関数を返す
	return () => {
		console.log(
			"[SearchInitializer] Removing completion listener, count before:",
			completionListeners.length,
		);
		const index = completionListeners.indexOf(listener);
		if (index !== -1) {
			completionListeners.splice(index, 1);
			console.log(
				"[SearchInitializer] New listener count after removal:",
				completionListeners.length,
			);
		} else {
			console.log("[SearchInitializer] Listener not found in list");
		}
	};
}

/**
 * 完了リスナーを全て呼び出す（1回だけ）
 */
function notifyCompletionListeners() {
	// 既に通知済みの場合はスキップ
	if (hasNotifiedCompletion) {
		console.log("[SearchInitializer] Completion already notified, skipping");
		return;
	}

	// 通知済みフラグをセット
	hasNotifiedCompletion = true;

	const listenerCount = completionListeners.length;
	console.log(
		`[SearchInitializer] Notifying ${listenerCount} completion listeners (first time)`,
	);

	// リスナーをコピーして、通知中に追加/削除されても安全に処理できるようにする
	const listeners = [...completionListeners];

	// 即時に通知（遅延させないように変更）
	for (const listener of listeners) {
		try {
			listener();
		} catch (error) {
			console.error("[SearchInitializer] Error in completion listener:", error);
		}
	}
}

/**
 * コールバックを登録する関数
 */
export function registerProgressCallback(
	id: string,
	callback: (progress: LoadingProgress) => void,
) {
	progressCallbacks[id] = callback;

	console.log("[SearchInitializer] Registering progress callback:", id, state);

	// すでに初期化済みの場合は完了状態を通知（UI更新なし）
	if (state.isInitialized) {
		console.log(
			"[SearchInitializer] DB already initialized, sending completion status",
		);
		const completeProgress: LoadingProgress = {
			isLoading: false,
			status: "検索システムは既に初期化されています",
			progress: 100,
			total: 100,
			error: null,
		};
		try {
			// 直接呼び出す（遅延させない）
			callback(completeProgress);
		} catch (error) {
			console.error("[SearchInitializer] Error in initial callback:", error);
		}
	} else if (state.isInitializing) {
		// 初期化中なら現在の進捗を通知
		console.log(
			"[SearchInitializer] Currently initializing, sending current progress",
		);
		const currentProgress = getCurrentProgress();
		try {
			callback(currentProgress);
		} catch (error) {
			console.error("[SearchInitializer] Error in initial callback:", error);
		}
	} else {
		// 初期化前なら初期状態を通知
		console.log(
			"[SearchInitializer] Not yet initialized, sending initial state",
		);
		try {
			callback(defaultProgress);
		} catch (error) {
			console.error("[SearchInitializer] Error in initial callback:", error);
		}
	}
}

/**
 * コールバックを解除する関数
 */
export function unregisterProgressCallback(id: string) {
	delete progressCallbacks[id];
}

/**
 * プログレスコールバックに通知する関数
 * 同じ進捗状況を複数回通知しないように最適化
 */
function notifyProgressCallbacks(progress: LoadingProgress) {
	// プログレスの比較 - 変更がない場合は通知しない
	const isSameProgress =
		lastNotifiedProgress.isLoading === progress.isLoading &&
		lastNotifiedProgress.status === progress.status &&
		lastNotifiedProgress.progress === progress.progress &&
		lastNotifiedProgress.total === progress.total &&
		lastNotifiedProgress.error === progress.error;

	if (isSameProgress) {
		return;
	}

	// 最後の通知を更新
	lastNotifiedProgress = { ...progress };

	// 各コールバックに通知（エラーを個別に捕捉して全体の処理を継続）
	for (const callback of Object.values(progressCallbacks)) {
		try {
			callback({ ...progress });
		} catch (error) {
			console.error("Error in progress callback:", error);
		}
	}
}

/**
 * 検索を初期化する関数
 */
export async function initSearch() {
	// 既に初期化済みの場合は早期リターン
	if (state.isInitialized) {
		console.log(
			"[SearchInitializer] Search already initialized, skipping initialization",
		);

		// 進捗通知だけを行い、完了通知は状態に応じて
		notifyProgressCallbacks({
			isLoading: false,
			status: "検索システムは既に初期化されています",
			progress: 100,
			total: 100,
			error: null,
		});

		// 完了リスナーにも通知（初回のみ）
		if (!hasNotifiedCompletion) {
			console.log(
				"[SearchInitializer] First call to initialized DB, notifying completion listeners",
			);
			notifyCompletionListeners();
		} else {
			console.log(
				"[SearchInitializer] Already notified completion, skipping redundant notification",
			);
		}
		return;
	}

	// 初期化中の場合は重複呼び出しを防止
	if (state.isInitializing) {
		console.log("[SearchInitializer] Search is already being initialized");
		notifyProgressCallbacks({
			isLoading: true,
			status: "検索システムを初期化中...",
			progress: getCurrentProgress().progress,
			total: getCurrentProgress().total,
			error: null,
		});
		return;
	}

	try {
		// 初期化フラグを設定
		state.isInitializing = true;

		// 全コールバックに初期化開始を通知
		notifyProgressCallbacks({
			isLoading: true,
			status: "検索システムを初期化中...",
			progress: 0,
			total: 100,
			error: null,
		});

		// データベースを初期化
		console.log("[SearchInitializer] 初期化開始: DB初期化前");
		const db = await initializeSearchDB((progress) => {
			notifyProgressCallbacks({ ...progress });
		});

		if (!db) {
			throw new Error("データベースの初期化に失敗しました");
		}

		console.log("[SearchInitializer] 初期化中: DB初期化完了、データロード前");

		// 検索データを読み込み
		await loadSearchData((progress) => {
			notifyProgressCallbacks({ ...progress });
		});

		console.log("[SearchInitializer] 初期化完了: データロード完了");

		// 初期化完了フラグを即時設定
		state.isInitialized = true;
		state.isDataLoaded = true;
		state.isInitializing = false;

		console.log("[SearchInitializer] Search system initialized successfully");

		// UI更新用の通知を送信
		notifyProgressCallbacks({
			isLoading: false,
			status: "検索システムの初期化が完了しました",
			progress: 100,
			total: 100,
			error: null,
		});

		// 完了通知を即時実行
		if (!hasNotifiedCompletion) {
			console.log(
				"[SearchInitializer] Calling notifyCompletionListeners immediately after initialization",
			);
			notifyCompletionListeners();
		} else {
			console.log(
				"[SearchInitializer] Completion already notified, not notifying again",
			);
		}
	} catch (error) {
		console.error(
			"[SearchInitializer] Error initializing search system:",
			error,
		);

		// エラー情報をコールバックに通知
		notifyProgressCallbacks({
			isLoading: false,
			status: "エラーが発生しました",
			progress: 0,
			total: 100,
			error:
				error instanceof Error
					? error.message
					: "検索システムの初期化中にエラーが発生しました",
		});

		// フラグリセット
		state.isInitializing = false;
	}
}

/**
 * 検索モジュールの初期化状態をリセット（テスト用）
 */
export function resetSearchInitializationState() {
	state.isInitialized = false;
	state.isInitializing = false;
	state.isDataLoaded = false;

	// 通知フラグをリセット
	hasNotifiedCompletion = false;

	// 最後の通知をリセット
	lastNotifiedProgress = { ...defaultProgress };

	// 進捗状況もリセット
	updateProgress(defaultProgress);

	// コールバックに通知
	notifyProgressCallbacks(defaultProgress);
}
