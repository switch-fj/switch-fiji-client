export type AuthStorage = {
  getToken: () => string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const defaultAuthStorage: AuthStorage = {
  getToken: () => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("access_token");
  },
  setToken: (token: string) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("access_token", token);
  },
  clearToken: () => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem("access_token");
  },
};
