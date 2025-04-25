import toast from "react-hot-toast";
import { apiUrl } from "../config";

if (!apiUrl) {
  throw new Error("API URL is missing. Check your environment variables.");
}
const SUCCESS_TOAST_ID = "success-toast";

type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type ApiResponse<T> = Promise<T>;
type ApiBody = Record<string, any> | FormData;

async function apiCall<T = any>(
  path: string,
  body: ApiBody = {},
  method: ApiMethod = "GET",
  language?: string // pass in the language here
): ApiResponse<T> {
  const url = `${apiUrl}${path}`;

  // Initialize options with credentials included
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      ...(language && { language }),
    } as Record<string, string>,
  };

  if (method !== "GET") {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
    }
  }

  const token = localStorage.getItem("token");
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const res = await fetch(url, options);

    // Handle 204 No Content responses safely
    if (res.status === 204) {
      toast.success("Request completed successfully (no content)", {
        id: SUCCESS_TOAST_ID,
      });
      console.log("Received 204 No Content");
      return {} as T;
    }

    const result = await res.json().catch((err) => {
      console.error("Failed to parse JSON response:", err);
      toast.error("Failed to parse server response.");
      return null;
    });

    if (!res.ok) {
      const errorMessage =
        result && typeof result === "object" && "message" in result
          ? (result.message as string)
          : `API Error: ${res.status} ${res.statusText}`;
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }

    const raw = result?.message || "Success";
    const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);

    toast.success(formatted, { id: SUCCESS_TOAST_ID });
    return result;
  } catch (error: any) {
    const errorMessage =
      error?.message || "An error occurred. Please try again later.";
    console.error("Network or API Error:", error);
    toast.error(errorMessage);
    throw error;
  }
}

// Utility functions for specific HTTP methods
const getFetch = <T>(path: string) => apiCall<T>(path);
const postFetch = <T>(path: string, body: ApiBody) =>
  apiCall<T>(path, body || {}, "POST");
const patchFetch = <T>(path: string, body: ApiBody) =>
  apiCall<T>(path, body, "PATCH");
const putFetch = <T>(path: string, body: ApiBody) =>
  apiCall<T>(path, body, "PUT");
const deleteFetch = <T>(path: string, body?: ApiBody) =>
  apiCall<T>(path, body, "DELETE");

export { getFetch, postFetch, patchFetch, putFetch, deleteFetch };
