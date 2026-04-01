"use client";
import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    startTransition: (callback: () => void) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startReactTransition] = useTransition();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Sayfa değiştiğinde loading'i hemen kapat
        setIsLoading(false);
    }, [pathname, searchParams]);

    // Global popstate (geri/ileri butonları) dinleyicisi
    useEffect(() => {
        const handlePopState = () => setIsLoading(false);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // isPending durumunu loading state'ine bağla
    useEffect(() => {
        if (isPending) {
            setIsLoading(true);
        } else {
            // Transition bittiğinde kapat (fallback)
            setIsLoading(false);
        }
    }, [isPending]);

    // Güvenlik zaman aşımı: Hiçbir yükleme 15 saniyeden uzun sürmesin
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isLoading) {
            timeoutId = setTimeout(() => {
                setIsLoading(false);
            }, 15000); // 15 saniye fallback
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isLoading]);

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    const startTransition = (callback: () => void) => {
        setIsLoading(true);
        startReactTransition(() => {
            callback();
        });
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, startTransition }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}
