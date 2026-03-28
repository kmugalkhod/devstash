"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { ItemDrawer } from "./ItemDrawer";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerContextValue {
  openDrawer: (itemId: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) {
    throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  }
  return ctx;
}

export function ItemDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const activeRequestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeController.current?.abort();
    };
  }, []);

  const openDrawer = useCallback((itemId: string) => {
    activeRequestId.current += 1;
    const requestId = activeRequestId.current;

    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    setOpen(true);
    setLoading(true);
    setItem(null);

    fetch(`/api/items/${itemId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (activeRequestId.current === requestId) {
          setItem(data);
        }
      })
      .catch(() => {
        if (activeRequestId.current === requestId) {
          setItem(null);
        }
      })
      .finally(() => {
        if (activeRequestId.current === requestId) {
          setLoading(false);
        }
      });
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      activeRequestId.current += 1;
      activeController.current?.abort();
      activeController.current = null;
      setItem(null);
      setLoading(false);
    }
  }, []);

  const handleItemUpdated = useCallback((updated: ItemDetail) => {
    setItem(updated);
  }, []);

  const handleItemDeleted = useCallback(() => {
    setOpen(false);
    setItem(null);
    router.refresh();
  }, [router]);

  return (
    <ItemDrawerContext.Provider value={{ openDrawer }}>
      {children}
      <ItemDrawer
        item={item}
        loading={loading}
        open={open}
        onOpenChange={handleOpenChange}
        onItemUpdated={handleItemUpdated}
        onItemDeleted={handleItemDeleted}
      />
    </ItemDrawerContext.Provider>
  );
}
