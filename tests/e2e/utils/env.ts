export const Env = {
    // UI_BASE_URL: process.env.UI_BASE_URL || 'http://localhost:3000', config'den asilir.
    TEST_USER: process.env.UI_TEST_USER || 'test1@2ninovasyon.com',
    TEST_PASS: process.env.UI_TEST_PASSWORD || 'bwI#B]WJhj',
    
    // Testler boyunca beklenecek standart sureler
    timeouts: {
        short: 3000,
        medium: 10000,
        long: 30000,
    }
};
