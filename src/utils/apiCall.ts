import toast from "react-hot-toast";
import { apiUrl } from "../config";

if (!apiUrl) {
  throw new Error("API URL is missing. Check your environment variables.");
}
const SUCCESS_TOAST_ID = "success-toast";

type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type ApiResponse<T> = Promise<T>;
type ApiBody = Record<string, any> | FormData;

interface ApiOptions {
  language?: string;
  showToast?: boolean; // New option to control toast display
  skipAuth?: boolean; // Add this
}

async function apiCall<T = any>(
  path: string,
  body: ApiBody = {},
  method: ApiMethod = "GET",
  options: ApiOptions = {}
): ApiResponse<T> {
  const { language, showToast = true, skipAuth } = options;
  const url = `${apiUrl}${path}`;

  // Initialize options with credentials included
  const fetchOptions: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...(language && { language }),
    } as Record<string, string>,
  };

  if (method !== "GET") {
    if (body instanceof FormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "Content-Type": "application/json",
      };
    }
  }

  const token = localStorage.getItem("token");
  if (token && !skipAuth) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const res = await fetch(url, fetchOptions);

    // Handle 204 No Content responses safely
    if (res.status === 204) {
      if (showToast) {
        toast.success("Request completed successfully (no content)", {
          id: SUCCESS_TOAST_ID,
        });
      }
      console.log("Received 204 No Content");
      return {} as T;
    }

    const result = await res.json().catch((err) => {
      console.error("Failed to parse JSON response:", err);
      if (showToast) {
        toast.error("Failed to parse server response.");
      }
      return null;
    });

    if (result?.message === "Invalid or expired token") {
      // Always show error toasts for auth issues
      toast.error("Session expired. Please log in again.");

      localStorage.removeItem("token");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
      return Promise.reject(new Error("Session expired"));
    }

    if (!res.ok) {
      const errorMessage =
        result && typeof result === "object" && "message" in result
          ? result.message
          : `API Error: ${res.status} ${res.statusText}`;

      // Still show toast (optional)
      if (showToast) {
        toast.error(errorMessage);
      }

      // Return the result object with error info for caller to inspect
      return result;
    }

    // Only show success toast if showToast is true
    if (showToast) {
      const raw = result?.message || "Success";
      const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
      toast.success(formatted, { id: SUCCESS_TOAST_ID });
    }

    return result;
  } catch (error: any) {
    const errorMessage =
      error?.message || "An error occurred. Please try again later.";
    console.error("Network or API Error:", error);

    // Always show error toasts (you can make this conditional too if needed)
    if (showToast) {
      toast.error(errorMessage);
    }
    throw error;
  }
}

// Updated utility functions with toast control
const getFetch = <T>(path: string, options?: ApiOptions) =>
  apiCall<T>(path, {}, "GET", options);

const postFetch = <T>(path: string, body: ApiBody, options?: ApiOptions) =>
  apiCall<T>(path, body || {}, "POST", options);

const patchFetch = <T>(path: string, body: ApiBody, options?: ApiOptions) =>
  apiCall<T>(path, body, "PATCH", options);

const putFetch = <T>(path: string, body: ApiBody, options?: ApiOptions) =>
  apiCall<T>(path, body, "PUT", options);

const deleteFetch = <T>(path: string, body?: ApiBody, options?: ApiOptions) =>
  apiCall<T>(path, body, "DELETE", options);

export { getFetch, postFetch, patchFetch, putFetch, deleteFetch };
