import { createContext, useContext, useState, type ReactNode } from 'react';

type MenuState = { open: boolean; openMenu: () => void; closeMenu: () => void };

const MenuContext = createContext<MenuState | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MenuContext.Provider
      value={{ open, openMenu: () => setOpen(true), closeMenu: () => setOpen(false) }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used inside MenuProvider');
  return ctx;
}
