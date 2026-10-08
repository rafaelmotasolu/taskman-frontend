import { useOutletContext } from 'react-router-dom';

export interface LayoutContextType {
  openSidebar: () => void;
  openChat: () => void;
}

export const useLayout = () => useOutletContext<LayoutContextType>();

