import { create } from 'zustand';

type ModalType = 'createScenario' | 'createIdea' | 'createRoadmap';
type TabType = string;

interface UiState {
  // Modal state
  type: ModalType | null;
  isOpen: boolean;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  // Tab state
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const useUiStore = create<UiState>((set) => ({
  // Modal state
  type: null,
  isOpen: false,
  openModal: (type) => set({ isOpen: true, type }),
  closeModal: () => set({ isOpen: false, type: null }),
  // Tab state
  activeTab: 'Overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
