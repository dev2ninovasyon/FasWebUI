import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { SonIslemlerKartlari } from './SonIslemlerKartlari';
import { renderWithProviders } from '@/test/test-utils';
import { getUserRecentActions } from '@/api/AnaSayfa/AnaSayfa';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock API
vi.mock('@/api/AnaSayfa/AnaSayfa', () => ({
    getUserRecentActions: vi.fn(),
}));

const mockActions: any[] = [
    {
        id: 1,
        userId: 123,
        title: 'İşlem 1',
        friendlyTitle: 'Dost Başlık 1',
        friendlyMessage: 'Dost Mesaj 1',
        httpMethod: 'POST',
        statusCode: 200,
        isError: false,
        clientUrl: '/test-url-1',
        createdAt: '2026-02-08T00:00:00Z',
    },
    {
        id: 2,
        userId: 123,
        title: 'Hatalı İşlem',
        httpMethod: 'GET',
        statusCode: 500,
        isError: true,
        clientUrl: '/test-url-2',
        createdAt: '2026-02-08T01:00:00Z',
    }
];

const preloadedState = {
    userReducer: {
        token: 'fake-token',
        denetlenenId: 1,
        yil: 2024,
        id: 123
    }
};

describe('SonIslemlerKartlari Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading spinner initially', () => {
        vi.mocked(getUserRecentActions).mockReturnValue(new Promise(() => { }));

        renderWithProviders(<SonIslemlerKartlari />, { preloadedState });

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render actions after successful API fetch', async () => {
        vi.mocked(getUserRecentActions).mockResolvedValue(mockActions);

        renderWithProviders(<SonIslemlerKartlari />, { preloadedState });

        await waitFor(() => {
            expect(screen.getByText('Dost Başlık 1')).toBeInTheDocument();
            expect(screen.getByText('Dost Mesaj 1')).toBeInTheDocument();
            expect(screen.getByText('Hatalı İşlem')).toBeInTheDocument();
        });
    });

    it('should show status chips correctly', async () => {
        vi.mocked(getUserRecentActions).mockResolvedValue(mockActions);

        renderWithProviders(<SonIslemlerKartlari />, { preloadedState });

        await waitFor(() => {
            expect(screen.getByText('Başarılı')).toBeInTheDocument();
            expect(screen.getByText('Hata')).toBeInTheDocument();
        });
    });

    it('should handle navigation on card click', async () => {
        vi.mocked(getUserRecentActions).mockResolvedValue(mockActions);

        renderWithProviders(<SonIslemlerKartlari />, { preloadedState });

        await waitFor(() => {
            const card = screen.getByText('Dost Başlık 1');
            fireEvent.click(card);
            expect(mockPush).toHaveBeenCalledWith('/test-url-1');
        });
    });

    it('should show error message on API failure', async () => {
        vi.mocked(getUserRecentActions).mockRejectedValue(new Error('API Hatası'));

        renderWithProviders(<SonIslemlerKartlari />, { preloadedState });

        await waitFor(() => {
            expect(screen.getByText('API Hatası')).toBeInTheDocument();
        });
    });

    it('should show empty message when no actions found', async () => {
        vi.mocked(getUserRecentActions).mockResolvedValue([]);

        renderWithProviders(<SonIslemlerKartlari />, { preloadedState });

        await waitFor(() => {
            expect(screen.getByText(/kaydedilmiş bir işleminiz bulunmuyor/i)).toBeInTheDocument();
        });
    });
});
