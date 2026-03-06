"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/api/apiBase";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { resetToNull, setUserData } from "@/store/user/UserSlice";
import {
  buildRefreshRequestBody,
  clearClientAuthStorage,
  mapAuthPayloadToUserData,
  persistSessionTokens,
  readStoredAuthTokens,
  syncSelectionStorageFromUserData,
} from "@/utils/authSession";

type AuthSessionStatus = "loading" | "authenticated" | "unauthenticated";

interface RefreshSessionOptions {
  forceRefresh?: boolean;
}

interface AuthSessionContextValue {
  status: AuthSessionStatus;
  refreshSession: (options?: RefreshSessionOptions) => Promise<boolean>;
  clearSession: () => void;
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
        mail: user.mail,
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
      const refreshResponse = await apiFetch("/Auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildRefreshRequestBody(currentRefreshToken),
        ignoreCustomHeaders: true,
        suppressErrorLog: true,
      });

      if (!refreshResponse.ok) {
        return {
          ok: false,
          accessToken: "",
          refreshToken: currentRefreshToken || "",
        };
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
      const nextRefreshToken =
        refreshedUserData.refreshToken || currentRefreshToken || "";

      persistSessionTokens(nextAccessToken, nextRefreshToken);

      return {
        ok: true,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      };
    },
    [user.mail]
  );

  const clearSession = useCallback(() => {
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
        setStatus("loading");

        try {
          let { accessToken, refreshToken } = readStoredAuthTokens();
          const tryLoadSession = async () => {
            const sessionResponse = await apiFetch("/Auth/session", {
              method: "GET",
              ignoreCustomHeaders: true,
              suppressErrorLog: true,
            });

            if (!sessionResponse.ok) {
              return false;
            }

            const sessionPayload = await sessionResponse.json().catch(() => null);
            if (!sessionPayload) {
              return false;
            }

            if (!accessToken) {
              const refreshedTokens = await refreshTokens(refreshToken);
              if (refreshedTokens.ok) {
                accessToken = refreshedTokens.accessToken || accessToken;
                refreshToken = refreshedTokens.refreshToken || refreshToken;
              }
            }

            applyAuthenticatedSession(sessionPayload, accessToken, refreshToken);
            return true;
          };

          if (!forceRefresh) {
            const hasActiveSession = await tryLoadSession();
            if (hasActiveSession) {
              return true;
            }
          }

          if (forceRefresh || !accessToken || refreshToken) {
            const refreshedTokens = await refreshTokens(refreshToken);
            if (refreshedTokens.ok) {
              accessToken = refreshedTokens.accessToken || accessToken;
              refreshToken = refreshedTokens.refreshToken || refreshToken;
            }
          }

          const hasSessionAfterRefresh = await tryLoadSession();
          if (!hasSessionAfterRefresh) {
            clearSession();
            return false;
          }

          return true;
        } catch {
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
    [applyAuthenticatedSession, clearSession, refreshTokens]
  );

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }

    if (user?.token) {
      setStatus("authenticated");
      return;
    }

    if (status === "authenticated") {
      return;
    }

    if (!activeBootstrapPromiseRef.current) {
      setStatus("unauthenticated");
    }
  }, [hasBootstrapped, status, user?.token]);

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
