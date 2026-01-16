import { create } from "zustand";

type LightboxState = {
	isOpen: boolean;
	currentIndex: number;
	images: string[];
	open: (images: string[], index: number) => void;
	close: () => void;
	next: () => void;
	prev: () => void;
	goTo: (index: number) => void;
};

export const useLightboxStore = create<LightboxState>((set, get) => ({
	isOpen: false,
	currentIndex: 0,
	images: [],
	open: (images: string[], index: number) =>
		set({ isOpen: true, images, currentIndex: index }),
	close: () => set({ isOpen: false }),
	next: () => {
		const { currentIndex, images } = get();
		if (currentIndex < images.length - 1) {
			set({ currentIndex: currentIndex + 1 });
		}
	},
	prev: () => {
		const { currentIndex } = get();
		if (currentIndex > 0) {
			set({ currentIndex: currentIndex - 1 });
		}
	},
	goTo: (index: number) => {
		const { images } = get();
		if (index >= 0 && index < images.length) {
			set({ currentIndex: index });
		}
	},
}));
