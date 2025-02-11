const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl); // Check if it's loading correctly
type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type ApiResponse<T> = Promise<T>;
type ApiBody = Record<string, any> | FormData;

async function apiCall<T = any>(
  path: string,
  body: ApiBody = {},
  method: ApiMethod = "GET"
): ApiResponse<T> {
  const options: RequestInit = {
    method,
    headers: {} as Record<string, string>, // ✅ Explicitly cast headers
  };

  if (method !== "GET") {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
      (options.headers as Record<string, string>)["Content-Type"] =
        "application/json"; // ✅ Fix TypeScript error
    }
  }

  try {
    const res = await fetch(apiUrl + path, options);
    const result: T = await res.json();
    if (res.ok) return result;
    throw result;
  } catch (error) {
    throw error;
  }
}

const getFetch = <T>(path: string) => apiCall<T>(path);
const postFetch = <T>(path: string, body: ApiBody) =>
  apiCall<T>(path, body, "POST");
const patchFetch = <T>(path: string, body: ApiBody) =>
  apiCall<T>(path, body, "PATCH");
const putFetch = <T>(path: string, body: ApiBody) =>
  apiCall<T>(path, body, "PUT");
const deleteFetch = <T>(path: string, body?: ApiBody) =>
  apiCall<T>(path, body, "DELETE");

export { getFetch, postFetch, patchFetch, putFetch, deleteFetch };
