import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should display login page', async ({ page }) => {
        // Wait for login page elements
        await expect(page.locator('input[name="kullaniciKodu"]')).toBeVisible()
        await expect(page.locator('input[name="sifre"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should login successfully with valid credentials', async ({ page }) => {
        // Fill in login form
        await page.fill('input[name="kullaniciKodu"]', 'test')
        await page.fill('input[name="sifre"]', 'test123')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for redirect to dashboard
        await page.waitForURL('**/AnaSayfa', { timeout: 10000 })

        // Verify user is logged in
        await expect(page.locator('[alt="ProfileImg"]')).toBeVisible()
    })

    test('should show error with invalid credentials', async ({ page }) => {
        // Fill in login form with invalid credentials
        await page.fill('input[name="kullaniciKodu"]', 'invalid')
        await page.fill('input[name="sifre"]', 'wrong')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for error message
        await expect(page.locator('text=Kullanıcı adı veya şifre hatalı')).toBeVisible()
    })

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.fill('input[name="kullaniciKodu"]', 'test')
        await page.fill('input[name="sifre"]', 'test123')
        await page.click('button[type="submit"]')
        await page.waitForURL('**/AnaSayfa')

        // Click on profile
        await page.click('[alt="ProfileImg"]')

        // Click logout button
        await page.click('text=Çıkış')

        // Should redirect to login
        await page.waitForURL('**/login', { timeout: 10000 })
        await expect(page.locator('input[name="kullaniciKodu"]')).toBeVisible()
    })
})
