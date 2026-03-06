"use client";

export const SESSION_ACCESS_TOKEN_KEY = "fas_token";
export const SESSION_REFRESH_TOKEN_KEY = "fas_refreshToken";
export const LEGACY_SESSION_ACCESS_TOKEN_KEY = "fas_session_token";
export const LEGACY_SESSION_REFRESH_TOKEN_KEY = "fas_session_refreshToken";
export const LOGOUT_INTENT_KEY = "fas_logout_intent";

type AuthPayload = Record<string, any> | null | undefined;

const getFirstDefined = <T = any>(payload: AuthPayload, ...keys: string[]): T | undefined => {
  if (!payload) {
    return undefined;
  }

  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }

  return undefined;
};

const normalizeString = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue === "undefined" || trimmedValue === "null") {
    return "";
  }

  return trimmedValue;
};

const shouldPersistRefreshTokenInLocalStorage =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

export const readStoredAuthTokens = () => {
  if (typeof window === "undefined") {
    return {
      accessToken: "",
      refreshToken: "",
    };
  }

  const accessToken = normalizeString(
    window.sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY) ||
      window.sessionStorage.getItem(LEGACY_SESSION_ACCESS_TOKEN_KEY)
  );

  const refreshToken = normalizeString(
    window.sessionStorage.getItem(SESSION_REFRESH_TOKEN_KEY) ||
      window.sessionStorage.getItem(LEGACY_SESSION_REFRESH_TOKEN_KEY) ||
      window.localStorage.getItem(SESSION_REFRESH_TOKEN_KEY)
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const persistSessionTokens = (accessToken?: string | null, refreshToken?: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedAccessToken = normalizeString(accessToken);
  const normalizedRefreshToken = normalizeString(refreshToken);

  const syncToken = (storageKey: string, value: string) => {
    if (value) {
      window.sessionStorage.setItem(storageKey, value);
      return;
    }

    window.sessionStorage.removeItem(storageKey);
  };

  syncToken(SESSION_ACCESS_TOKEN_KEY, normalizedAccessToken);
  syncToken(LEGACY_SESSION_ACCESS_TOKEN_KEY, normalizedAccessToken);
  syncToken(SESSION_REFRESH_TOKEN_KEY, normalizedRefreshToken);
  syncToken(LEGACY_SESSION_REFRESH_TOKEN_KEY, normalizedRefreshToken);

  // Production'da source-of-truth cookie. Dev/test'te localhost cookie sorunlarina karsi
  // yeni sekme restore fallback'i olarak refresh token localStorage'da tutulur.
  if (normalizedRefreshToken && shouldPersistRefreshTokenInLocalStorage) {
    window.localStorage.setItem(SESSION_REFRESH_TOKEN_KEY, normalizedRefreshToken);
    return;
  }

  if (!normalizedRefreshToken || !shouldPersistRefreshTokenInLocalStorage) {
    window.localStorage.removeItem(SESSION_REFRESH_TOKEN_KEY);
  }
};

export const clearClientAuthStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  [
    SESSION_ACCESS_TOKEN_KEY,
    SESSION_REFRESH_TOKEN_KEY,
    LEGACY_SESSION_ACCESS_TOKEN_KEY,
    LEGACY_SESSION_REFRESH_TOKEN_KEY,
  ].forEach((key) => {
    window.sessionStorage.removeItem(key);
  });

  window.localStorage.removeItem(SESSION_REFRESH_TOKEN_KEY);
};

export const getRequestAccessToken = (preferredToken?: string | null) => {
  const normalizedPreferredToken = normalizeString(preferredToken);
  if (normalizedPreferredToken) {
    return normalizedPreferredToken;
  }

  return readStoredAuthTokens().accessToken;
};

export const createAuthorizedHeaders = (
  headers: Record<string, string> = {},
  preferredToken?: string | null
) => {
  const normalizedHeaders = { ...headers };
  const accessToken = getRequestAccessToken(preferredToken);

  if (!accessToken) {
    return normalizedHeaders;
  }

  return {
    ...normalizedHeaders,
    Authorization: `Bearer ${accessToken}`,
  };
};

export const createAuthorizedAxiosConfig = (
  config: Record<string, any> = {},
  preferredToken?: string | null
) => {
  return {
    ...config,
    withCredentials: config.withCredentials ?? true,
    headers: createAuthorizedHeaders((config.headers as Record<string, string>) || {}, preferredToken),
  };
};

export const buildRefreshRequestBody = (refreshToken?: string | null) => {
  const normalizedRefreshToken = normalizeString(refreshToken);

  if (!normalizedRefreshToken) {
    return undefined;
  }

  return JSON.stringify({
    refreshToken: normalizedRefreshToken,
    RefreshToken: normalizedRefreshToken,
  });
};

export const mapAuthPayloadToUserData = (
  payload: AuthPayload,
  overrides: {
    accessToken?: string | null;
    refreshToken?: string | null;
    mail?: string | null;
  } = {}
) => {
  const currentAccessToken =
    normalizeString(overrides.accessToken) ||
    normalizeString(getFirstDefined<string>(payload, "token", "Token"));
  const currentRefreshToken =
    normalizeString(overrides.refreshToken) ||
    normalizeString(getFirstDefined<string>(payload, "refreshToken", "RefreshToken"));

  const selectedCompanyId = getFirstDefined<number>(
    payload,
    "denetlenenId",
    "DenetlenenId",
    "sonSecilenDenetlenenId",
    "SonSecilenDenetlenenId"
  );
  const selectedYear = getFirstDefined<number>(
    payload,
    "yil",
    "Yil",
    "sonSecilenYil",
    "SonSecilenYil"
  );
  const selectedCompanyName = getFirstDefined<string>(
    payload,
    "denetlenenFirmaAdi",
    "DenetlenenFirmaAdi",
    "sonSecilenDenetlenenFirmaAdi",
    "SonSecilenDenetlenenFirmaAdi"
  );
  const selectedAuditType = getFirstDefined<string>(
    payload,
    "denetimTuru",
    "DenetimTuru",
    "sonSecilenDenetimTuru",
    "SonSecilenDenetimTuru"
  );
  const selectedBobimi = getFirstDefined<boolean>(
    payload,
    "bobimi",
    "Bobimi",
    "sonSecilenBobimi",
    "SonSecilenBobimi"
  );
  const selectedTfrsmi = getFirstDefined<boolean>(
    payload,
    "tfrsmi",
    "Tfrsmi",
    "sonSecilenTfrsmi",
    "SonSecilenTfrsmi"
  );
  const selectedEnflasyonmu = getFirstDefined<boolean>(
    payload,
    "enflasyonmu",
    "Enflasyonmu",
    "sonSecilenEnflasyonmu",
    "SonSecilenEnflasyonmu"
  );
  const selectedKonsolidemi = getFirstDefined<boolean>(
    payload,
    "konsolidemi",
    "Konsolidemi",
    "sonSecilenKonsolidemi",
    "SonSecilenKonsolidemi"
  );

  return {
    token: currentAccessToken,
    refreshToken: currentRefreshToken,
    id:
      getFirstDefined<number>(payload, "userId", "UserId", "kullaniciId", "KullaniciId", "id", "Id") ??
      0,
    denetciId: getFirstDefined<number>(payload, "denetciId", "DenetciId") ?? 0,
    denetciFirmaAdi: getFirstDefined<string>(payload, "denetciFirmaAdi", "DenetciFirmaAdi") ?? "",
    yetki: getFirstDefined<string>(payload, "yetki", "Yetki") ?? "",
    rol: getFirstDefined<string[] | undefined>(payload, "rol", "Rol"),
    kullaniciAdi: getFirstDefined<string>(payload, "kullaniciAdi", "KullaniciAdi") ?? "",
    unvan: getFirstDefined<string>(payload, "unvan", "Unvan") ?? "",
    mail: overrides.mail ?? getFirstDefined<string>(payload, "mail", "Mail") ?? "",
    kurulumTamamlandi:
      getFirstDefined<boolean>(payload, "kurulumTamamlandi", "KurulumTamamlandi") ?? false,
    kurulumAdimi: getFirstDefined<number>(payload, "kurulumAdimi", "KurulumAdimi") ?? 0,
    setupWizardProgress:
      getFirstDefined<string>(payload, "setupWizardProgress", "SetupWizardProgress") ?? "",
    sonSecilenDenetlenenId:
      getFirstDefined<number>(payload, "sonSecilenDenetlenenId", "SonSecilenDenetlenenId") ?? 0,
    sonSecilenYil: getFirstDefined<number>(payload, "sonSecilenYil", "SonSecilenYil") ?? 0,
    sonSecilenDenetlenenFirmaAdi:
      getFirstDefined<string>(payload, "sonSecilenDenetlenenFirmaAdi", "SonSecilenDenetlenenFirmaAdi") ??
      "",
    sonSecilenDenetimTuru:
      getFirstDefined<string>(payload, "sonSecilenDenetimTuru", "SonSecilenDenetimTuru") ?? "",
    sonSecilenBobimi:
      getFirstDefined<boolean>(payload, "sonSecilenBobimi", "SonSecilenBobimi") ?? false,
    sonSecilenTfrsmi:
      getFirstDefined<boolean>(payload, "sonSecilenTfrsmi", "SonSecilenTfrsmi") ?? false,
    sonSecilenEnflasyonmu:
      getFirstDefined<boolean>(payload, "sonSecilenEnflasyonmu", "SonSecilenEnflasyonmu") ?? false,
    sonSecilenKonsolidemi:
      getFirstDefined<boolean>(payload, "sonSecilenKonsolidemi", "SonSecilenKonsolidemi") ?? false,
    sonSecilenBddkmi:
      getFirstDefined<boolean>(payload, "sonSecilenBddkmi", "SonSecilenBddkmi") ?? false,
    turTamamlandi: getFirstDefined<boolean>(payload, "turTamamlandi", "TurTamamlandi") ?? false,
    bddkmi: getFirstDefined<boolean>(payload, "bddkmi", "Bddkmi") ?? false,
    denetlenenId: selectedCompanyId ?? 0,
    yil: selectedYear ?? 0,
    denetlenenFirmaAdi: selectedCompanyName ?? "",
    denetimTuru: selectedAuditType ?? "",
    bobimi: selectedBobimi ?? false,
    tfrsmi: selectedTfrsmi ?? false,
    enflasyonmu: selectedEnflasyonmu ?? false,
    konsolidemi: selectedKonsolidemi ?? false,
  };
};

export const syncSelectionStorageFromUserData = (userData: Record<string, any>) => {
  if (typeof window === "undefined") {
    return;
  }

  if (userData?.denetlenenId && userData?.yil) {
    window.localStorage.setItem("fas_denetlenenId", String(userData.denetlenenId));
    window.localStorage.setItem("fas_yil", String(userData.yil));
    return;
  }

  window.localStorage.removeItem("fas_denetlenenId");
  window.localStorage.removeItem("fas_yil");
};
