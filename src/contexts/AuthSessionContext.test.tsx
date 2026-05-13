import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSessionProvider, useAuthSession } from "./AuthSessionContext";

const {
  apiFetchMock,
  dispatchMock,
  readStoredAuthTokensMock,
  userStateMock,
} = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
  dispatchMock: vi.fn(),
  readStoredAuthTokensMock: vi.fn(),
  userStateMock: vi.fn(),
}));

vi.mock("@/api/apiBase", () => ({
  apiFetch: apiFetchMock,
}));

vi.mock("@/store/hooks", () => ({
  useDispatch: () => dispatchMock,
  useSelector: () => userStateMock(),
}));

vi.mock("@/store/user/UserSlice", () => ({
  resetToNull: vi.fn((payload) => ({ type: "user/resetToNull", payload })),
  setUserData: vi.fn((payload) => ({ type: "user/setUserData", payload })),
}));

vi.mock("@/utils/authSession", () => ({
  clearClientAuthStorage: vi.fn(),
  mapAuthPayloadToUserData: vi.fn(() => ({ token: "", refreshToken: "" })),
  persistSessionTokens: vi.fn(),
  readStoredAuthTokens: readStoredAuthTokensMock,
  syncSelectionStorageFromUserData: vi.fn(),
}));

vi.mock("@/utils/sessionConfig", () => ({
  LOGOUT_REASON_KEY: "fas_logout_reason",
  LogoutReason: {
    SERVER_EXPIRED: "server_expired",
  },
}));

const Probe = () => {
  const { status } = useAuthSession();
  return <div data-testid="status">{status}</div>;
};

describe("AuthSessionProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userStateMock.mockReturnValue({ mail: "", token: "" });
    readStoredAuthTokensMock.mockReturnValue({
      accessToken: "stored-access-token",
      refreshToken: "stored-refresh-token",
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost:3000/maintenance",
        pathname: "/maintenance",
        search: "",
      },
    });
  });

  it("does not bootstrap auth requests on maintenance route", async () => {
    render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    );

    await waitFor(() => {
      expect(readStoredAuthTokensMock).toHaveBeenCalled();
    });

    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});
