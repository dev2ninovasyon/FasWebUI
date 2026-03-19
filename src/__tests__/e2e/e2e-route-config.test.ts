import { describe, expect, test } from 'vitest';
import { AppRoutes } from '@/../tests/e2e/test-data/constants';

describe('E2E route configuration', () => {
    test('login route matches the application entry page', () => {
        expect(AppRoutes.login).toBe('/');
    });

    test('protected routes stay relative for preview and local environments', () => {
        expect(AppRoutes.dashboard.startsWith('/')).toBe(true);
        expect(AppRoutes.kullaniciListe.startsWith('/')).toBe(true);
    });
});
