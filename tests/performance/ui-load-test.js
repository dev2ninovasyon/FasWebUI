import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const BASE_URL = (__ENV.FASWEBUI_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const K6_REPORT_PATH = __ENV.K6_REPORT_PATH || '../../../TestResults/FasWebUI_Performance/ui-k6/index.html';

export const options = {
    scenarios: {
        ui_load_performance: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },
                { duration: '1m', target: 50 }, // 50 kullanıcı
                { duration: '30s', target: 0 },
            ],
            exec: 'testPageLoad',
        },
    },
    thresholds: {
        'http_req_duration{scenario:ui_load_performance}': ['p(95)<3000'], // Yeni hedef 3sn (daha çok asset olduğu için)
        'http_req_failed{scenario:ui_load_performance}': ['rate<0.02'],
    },
};

// UI testinde de gerçek kullanıcı girişini simüle ediyoruz
export function setup() {
    // API adresi üzerinden giriş yapıp token (veya cookie) alıyoruz
    const API_URL = (__ENV.FASWEBAPI_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    
    // Kullanıcının sağladığı aktif test hesapları listesi
    const testUsers = [
        { email: 'test1@2ninovasyon.com', password: 'bwI#B]WJhj' },
        { email: 'test2@2ninovasyon.com', password: 'bwI#B]WJhj' },
        { email: 'test3@2ninovasyon.com', password: 'bwI#B]WJhj' },
        { email: 'test4@2ninovasyon.com', password: 'bwI#B]WJhj' },
        { email: 'test5@2ninovasyon.com', password: 'bwI#B]WJhj' }
    ];

    // Rastgele bir test kullanıcısı seç
    const selectedUser = testUsers[Math.floor(Math.random() * testUsers.length)];

    const payload = JSON.stringify({
        email: selectedUser.email,
        password: selectedUser.password,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    
    let token = '';
    try {
        const res = http.post(`${API_URL}/api/Auth/Login`, payload, params);
        if (res.status === 200) {
            token = res.json().token;
        }
    } catch(e) { /* API ayakta degilse yoksay */ }
    
    return { token: token };
}

export function testPageLoad(data) {
    // Next.js (SSR) tarafı genelde Authorization header veya Cookie kullanır
    const params = { 
        responseCallback: http.expectedStatuses(200, 302, 301),
        headers: data.token ? { 'Authorization': `Bearer ${data.token}` } : {}
    };

    group('Genel Ziyaret ve Oturum Acma', function () {
        // 1. Ana Sayfa Yüklemesi
        const homeRes = http.get(`${BASE_URL}/`, params);
        check(homeRes, { 'home-page is loaded': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 2 + 1); // 1-3 saniye sayfayı incele

        // 2. Login Sayfası
        const loginPageRes = http.get(`${BASE_URL}/giris`, params);
        check(loginPageRes, { 'login-page is loaded': (r) => r.status === 200 });
        sleep(Math.random() * 3 + 1); // 1-4 saniye form doldurma süresi simülasyonu
    });

    group('Uygulama İçi Menü Gezintisi (Sıralı)', function () {
        // Menülere tıklanması ve yüklenmesi (Next.js SSR/Static)
        
        let res = http.get(`${BASE_URL}/Arsiv`, params);
        check(res, { 'Arsiv menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 3 + 1); // Listeye baktı
        
        res = http.get(`${BASE_URL}/Veri`, params);
        check(res, { 'Veri menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 2 + 1);
        
        res = http.get(`${BASE_URL}/Hesaplamalar`, params);
        check(res, { 'Hesaplamalar menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 4 + 1); // Hesaplamalar sekmesi kritiktir, daha uzun süre kalır
        
        res = http.get(`${BASE_URL}/Raporlar`, params);
        check(res, { 'Raporlar menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 3 + 1);
        
        res = http.get(`${BASE_URL}/Kys`, params);
        check(res, { 'Kys menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 2 + 1);
        
        res = http.get(`${BASE_URL}/Enflasyon`, params);
        check(res, { 'Enflasyon menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 2 + 1);

        res = http.get(`${BASE_URL}/HesapAyarlari`, params);
        check(res, { 'Ayarlar menu OK': (r) => [200, 302, 301].includes(r.status) });
        sleep(Math.random() * 1 + 1);
    });
}

export function handleSummary(data) {
    return {
        [K6_REPORT_PATH]: htmlReport(data),
        stdout: `ui k6 summary: iterations=${data.metrics.iterations?.count ?? 0}`,
    };
}
