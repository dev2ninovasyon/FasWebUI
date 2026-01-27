"use client";

import { usePathname } from "next/navigation";
import { breadcrumbConfig } from "@/config/breadcrumbConfig";

export interface BreadcrumbItem {
    to: string;
    title: string;
}

export const useBreadcrumb = () => {
    const pathname = usePathname();

    // Remove (Uygulama) from path if present
    const cleanPath = pathname.replace("/(Uygulama)", "");

    const items: BreadcrumbItem[] = [];
    const segments = cleanPath.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
        currentPath += `/${segment}`;
        const title = breadcrumbConfig[currentPath] || segment;
        items.push({
            to: currentPath,
            title: title,
        });
    }

    return {
        items,
        currentTitle: items[items.length - 1]?.title || "",
    };
};

