import { Page, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    // Gercek projede bu locatorlarin data-testid vs gibi sabit olmasi iyidir,
    // simdilik projedeki olasi input yapilarina gore esnek tutulmustur.
    readonly emailInput = '#username';
    readonly passwordInput = '#password';
    readonly loginButton = 'button[type="submit"]';

    constructor(page: Page) {
        this.page = page;
    }

    async navigate() {
        console.log('Navigating to root (login) page...');
        await this.page.goto('/', { waitUntil: 'networkidle' });
        
        // Eğer loader varsa (CircularProgress) onun gitmesini veya inputun gelmesini bekle
        console.log('Waiting for login form (#username)...');
        await this.page.waitForSelector(this.emailInput, { state: 'visible', timeout: 30000 });
    }

    async login(email: string, pass: string) {
        console.log(`Filling credentials for: ${email}`);
        await this.page.fill(this.emailInput, email);
        await this.page.fill(this.passwordInput, pass);
       //Hata  Burada olabilir, eger ReCAPTCHA varsa buton aktif olmayabilir, bu durumda butonun aktif olmasini beklemek gerekir. 
        const btn = this.page.locator(this.loginButton);
        // Butonun aktif olmasini bekle (ReCAPTCHA yuklenmis olmali)
        await expect(btn).toBeEnabled({ timeout: 20000 });
        
        await btn.click();
        console.log('Login button clicked, waiting for navigation...');
    }
}
