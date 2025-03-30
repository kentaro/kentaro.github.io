import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import SearchModal from './SearchModal';

/**
 * 検索モーダルをポータル経由で表示するラッパーコンポーネント
 * React Portalを使用して、モーダルをDOM階層の外側に配置し、親コンポーネントの再レンダリングから切り離す
 */
export default function SearchModalWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

    // モーダルを開く関数
    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    // モーダルを閉じる関数
    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    // ポータル要素の作成
    useEffect(() => {
        // すでに存在する場合は再利用
        let element = document.getElementById('search-modal-portal');

        if (!element) {
            element = document.createElement('div');
            element.id = 'search-modal-portal';
            document.body.appendChild(element);
        }

        setPortalElement(element);

        return () => {
            // コンポーネントのアンマウント時にクリーンアップ
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, []);

    return (
        <>
            {/* 検索アイコンボタン */}
            <button
                onClick={openModal}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                aria-label="検索"
                type="button"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </button>

            {/* Portalを使用してモーダルをDOMのルートレベルにレンダリング */}
            {portalElement && createPortal(
                <SearchModal
                    isOpen={isOpen}
                    onClose={closeModal}
                />,
                portalElement
            )}
        </>
    );
} 