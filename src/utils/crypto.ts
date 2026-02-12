import CryptoJS from 'crypto-js';

// TODO: Bu anahtarı .env dosyasından almalısınız!
// Şimdilik backend ile aynı hardcoded anahtarı kullanıyoruz.
const SECRET_KEY = "MySuperSecretKey123!";

export const generateSignature = (
    username: string,
    denetciId: string,
    kullaniciId: string,
    denetlenenId: string,
    yil: string
): string => {
    const payload = `${username}|${denetciId}|${kullaniciId}|${denetlenenId}|${yil}`;
    const signature = CryptoJS.HmacSHA256(payload, SECRET_KEY).toString(CryptoJS.enc.Base64);
    return signature;
};
