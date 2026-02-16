import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENFLASYON_SECRET_KEY || "MySuperSecretKey123!";

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
