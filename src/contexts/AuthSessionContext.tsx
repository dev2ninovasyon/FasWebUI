"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/api/apiBase";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { resetToNull, setUserData } from "@/store/user/UserSlice";
import {
  clearClientAuthStorage,
  mapAuthPayloadToUserData,
  persistSessionTokens,
  readStoredAuthTokens,
  syncSelectionStorageFromUserData,
} from "@/utils/authSession";
import { LOGOUT_REASON_KEY, LogoutReason } from "@/utils/sessionConfig";

type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated";

interface RefreshSessionOptions {
  forceRefresh?: boolean;
}

interface AuthSessionContextValue {
  status: AuthSessionStatus;
  refreshSession: (options?: RefreshSessionOptions) => Promise<boolean>;
  clearSession: (reason?: LogoutReason) => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.userReducer);
  const [status, setStatus] = useState<AuthSessionStatus>("loading");
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const activeBootstrapPromiseRef = useRef<Promise<boolean> | null>(null);

  const applyAuthenticatedSession = useCallback(
    (payload: Record<string, any> | null | undefined, accessToken?: string | null, refreshToken?: string | null) => {
      const userData = mapAuthPayloadToUserData(payload, {
        accessToken,
        refreshToken,
        mail: user.mail || payload?.mail || payload?.Mail,
      });

      persistSessionTokens(userData.token, userData.refreshToken);
      syncSelectionStorageFromUserData(userData);
      dispatch(setUserData(userData));
      setStatus("authenticated");
    },
    [dispatch, user.mail]
  );

  const refreshTokens = useCallback(
    async (currentRefreshToken?: string | null) => {
      if (!currentRefreshToken) {
        return { ok: false, accessToken: "", refreshToken: "" };
      }

      try {
        const refreshResponse = await apiFetch("/Auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: currentRefreshToken,
            RefreshToken: currentRefreshToken,
          }),
          ignoreCustomHeaders: true,
          suppressErrorLog: true,
        });

        if (!refreshResponse || !refreshResponse.ok) {
          return { ok: false, accessToken: "", refreshToken: currentRefreshToken || "" };
        }

        const refreshPayload = await refreshResponse.json().catch(() => null);
        const refreshedUserData = mapAuthPayloadToUserData(refreshPayload, {
          accessToken: refreshPayload?.token || refreshPayload?.Token,
          refreshToken:
            refreshPayload?.refreshToken ||
            refreshPayload?.RefreshToken ||
            currentRefreshToken,
          mail: user.mail,
        });

        const nextAccessToken = refreshedUserData.token || "";
        const nextRefreshToken = refreshedUserData.refreshToken || currentRefreshToken || "";

        persistSessionTokens(nextAccessToken, nextRefreshToken);

        return {
          ok: true,
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        };
      } catch (err) {
        console.error("AuthSessionContext: refreshTokens error", err);
        return { ok: false, accessToken: "", refreshToken: currentRefreshToken || "" };
      }
    },
    [user.mail]
  );

  const clearSession = useCallback((reason?: LogoutReason) => {
    if (typeof window !== "undefined" && reason) {
      window.sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
    }
    clearClientAuthStorage();
    dispatch(resetToNull(""));
    setHasBootstrapped(true);
    setStatus("unauthenticated");
  }, [dispatch]);

  const refreshSession = useCallback(
    async ({ forceRefresh = false }: RefreshSessionOptions = {}) => {
      if (activeBootstrapPromiseRef.current) {
        return activeBootstrapPromiseRef.current;
      }

      const bootstrapPromise = (async () => {
        // Zaten otantikasyon varsa ve zorunlu değilse loading'e çekmeye gerek yok (UI flickersız geçiş)
        if (status !== "authenticated") {
          setStatus("loading");
        }

        try {
          let { accessToken, refreshToken } = readStoredAuthTokens();

          // Eğer token hiç yoksa doğrudan girişe atılabilir
          if (!accessToken && !refreshToken) {
            clearSession();
            return false;
          }

          const tryLoadSession = async () => {
            try {
              const sessionResponse = await apiFetch("/Auth/session", {
                method: "GET",
                ignoreCustomHeaders: true,
                suppressErrorLog: true,
              });

              if (!sessionResponse || !sessionResponse.ok) return false;

              const sessionPayload = await sessionResponse.json().catch(() => null);
              if (!sessionPayload) return false;

              applyAuthenticatedSession(sessionPayload, accessToken, refreshToken);
              return true;
            } catch {
              return false;
            }
          };

          const hasActiveSession = await tryLoadSession();
          if (hasActiveSession) return true;

          // Session load başarısızsa refresh dene
          if (forceRefresh || refreshToken) {
            const refreshedTokens = await refreshTokens(refreshToken);
            if (refreshedTokens.ok) {
              accessToken = refreshedTokens.accessToken || accessToken;
              refreshToken = refreshedTokens.refreshToken || refreshToken;

              const hasSessionAfterRefresh = await tryLoadSession();
              if (!hasSessionAfterRefresh) {
                clearSession(LogoutReason.SERVER_EXPIRED);
                return false;
              }
              return true;
            } else {
              // Refresh de başarısızsa oturum bitmiştir
              clearSession(LogoutReason.SERVER_EXPIRED);
              return false;
            }
          }

          clearSession();
          return false;
        } catch (err) {
          console.error("AuthSessionContext: Bootstrap error", err);
          clearSession();
          return false;
        } finally {
          setHasBootstrapped(true);
          activeBootstrapPromiseRef.current = null;
        }
      })();

      activeBootstrapPromiseRef.current = bootstrapPromise;
      return bootstrapPromise;
    },
    [status, applyAuthenticatedSession, clearSession, refreshTokens]
  );

  // Initial Bootstrapping
  useEffect(() => {
    if (!hasBootstrapped) {
      void refreshSession();
    }
  }, [hasBootstrapped, refreshSession]);

  // Sync status if user token changes manually (login)
  useEffect(() => {
    if (!hasBootstrapped) return;

    if (user?.token && status !== "authenticated") {
      setStatus("authenticated");
    } else if (!user?.token && status === "authenticated") {
      // Sadece Redux değil, localStorage da boşsa unauthenticated'a çek
      const { accessToken } = readStoredAuthTokens();
      if (!accessToken) {
        setStatus("unauthenticated");
      }
    }
  }, [hasBootstrapped, user?.token, status]);

  return (
    <AuthSessionContext.Provider
      value={{
        status,
        refreshSession,
        clearSession,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
}
