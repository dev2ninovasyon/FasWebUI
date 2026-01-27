"use client";
import React from "react";
import NextLink from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { usePathname } from "next/navigation";

interface LoadingLinkProps extends React.ComponentProps<typeof NextLink> {
    children: React.ReactNode;
}

export default function LoadingLink({
    href,
    children,
    onClick,
    ...props
}: LoadingLinkProps) {
    const { setLoading } = useLoading();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Farklı bir sayfaya gidiyorsa loading göster
        const targetPath = typeof href === 'string' ? href : href?.pathname || '';
        if (targetPath && pathname !== targetPath) {
            setLoading(true);
        }

        // Orijinal onClick varsa çağır
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <NextLink href={href} onClick={handleClick} {...props}>
            {children}
        </NextLink>
    );
}
