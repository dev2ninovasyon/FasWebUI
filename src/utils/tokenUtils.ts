export const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

        // Check if we are in a browser environment ensuring window is defined
        if (typeof window === "undefined") return true;

        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        );

        const { exp } = JSON.parse(jsonPayload);
        if (!exp) return true;

        const currentTime = Date.now() / 1000;
        return exp < currentTime;
    } catch (error) {
        return true; // If decoding fails, treat as expired
    }
};
