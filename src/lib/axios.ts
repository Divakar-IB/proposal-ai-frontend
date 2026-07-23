import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

export interface ApiError {
  message: string;
  detail?: string | { msg: string; type: string }[];
  status: number;
}

const COOKIE_OPTIONS = { expires: 7, secure: true, sameSite: "strict" } as const;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Refresh token queue ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (err: unknown, token: string | null) => {
  failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  failedQueue = [];
};

const clearSession = () => {
  Cookies.remove("a_token");
  Cookies.remove("r_token");
  Cookies.remove("role");
  window.location.href = "/auth/login";
};

// --- Request: attach access token ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("a_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Response: handle 401 with token refresh ---
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthEndpoint = /\/auth\//.test(original.url ?? "");

    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = Cookies.get("r_token");
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is in flight
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch(Promise.reject.bind(Promise));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ access_token: string; token_type: string }>(
        `${process.env.NEXT_PUBLIC_API_URL}/refresh`,
        { refresh_token: refreshToken },
      );

      const newToken = data.access_token;
      Cookies.set("a_token", newToken, COOKIE_OPTIONS);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      original.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
