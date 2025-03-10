import { apiUrl } from "../config";

if (!apiUrl) {
  throw new Error("API URL is missing. Check your environment variables.");
}

type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type ApiResponse<T> = Promise<T>;
type ApiBody = Record<string, any> | FormData;

async function apiCall<T = any>(
  path: string,
  body: ApiBody = {},
  method: ApiMethod = "GET"
): ApiResponse<T> {
  const url = `${apiUrl}${path}`;

  // Initialize options with credentials included
  const options: RequestInit = {
    method,
    credentials: "include", // This is critical - it must be at the top level
    headers: {} as Record<string, string>,
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
    console.log(`API Call: ${method} ${url}`, {
      withCredentials: true,
      hasToken: !!token,
    });

    const res = await fetch(url, options);

    // Handle 204 No Content responses safely
    if (res.status === 204) return {} as T;

    const result = await res.json().catch(() => null); // Handle cases where JSON parsing fails

    if (!res.ok) {
      const errorMessage =
        result && typeof result === "object" && "message" in result
          ? (result.message as string)
          : `API Error: ${res.status} ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network or API error occurred."
    );
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
