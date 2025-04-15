import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { PGliteProvider } from '@electric-sql/pglite-react';
import type { PGlite } from '@electric-sql/pglite';

// PGliteコンテキストの型定義
interface PGliteContextType {
    pglite: PGlite | null;
    setPglite: (db: PGlite | null) => void;
    isInitialized: boolean;
}

// モジュールスコープで変数を保持（privateな変数）
let _globalPglite: PGlite | null = null;
let _isInitialized = false;

// グローバルPGliteインスタンスを取得する関数
export function getGlobalPglite(): PGlite | null {
    return _globalPglite;
}

// グローバルPGliteインスタンスを設定する関数
export function setGlobalPglite(db: PGlite | null): void {
    _globalPglite = db;
    _isInitialized = !!db;
}

// デフォルト値（memo化して不要な再レンダリングを防止）
const defaultContextValue: PGliteContextType = {
    pglite: null,
    setPglite: () => { },
    isInitialized: false,
};

// PGliteコンテキストの作成
const PGliteContext = createContext<PGliteContextType>(defaultContextValue);

// PGliteコンテキストを提供するプロバイダーコンポーネント
export function GlobalPGliteProvider({ children }: { children: ReactNode }) {
    const [pglite, setPgliteState] = useState<PGlite | null>(_globalPglite);
    const [isInitialized, setIsInitialized] = useState(_isInitialized);

    // グローバル変数と状態の同期を行う関数（useCallbackでメモ化）
    const setPglite = useCallback((db: PGlite | null) => {
        if (db === pglite) return;
        setGlobalPglite(db);
        setPgliteState(db);
        if (!isInitialized) setIsInitialized(true);
    }, [pglite, isInitialized]);

    // グローバル変数が既に設定されている場合は状態に反映（一度だけ）
    useEffect(() => {
        const currentGlobal = getGlobalPglite();
        if (currentGlobal && !pglite) {
            setPgliteState(currentGlobal);
            setIsInitialized(true);
        }
    }, [pglite]);

    // コンテキスト値をメモ化して不要な再レンダリングを防止
    const contextValue = useMemo(() => {
        return { pglite, setPglite, isInitialized };
    }, [pglite, setPglite, isInitialized]);

    // PGliteProviderのラッピングをメモ化
    const providerContent = useMemo(() => {
        return pglite ? (
            <PGliteProvider db={pglite}>{children}</PGliteProvider>
        ) : (
            children
        );
    }, [pglite, children]);

    return (
        <PGliteContext.Provider value={contextValue}>
            {providerContent}
        </PGliteContext.Provider>
    );
}

// PGliteコンテキストを使用するカスタムフック
export function useGlobalPGlite() {
    return useContext(PGliteContext);
} 