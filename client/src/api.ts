export const API_URL = "http://localhost:3001/api";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : "",
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Do NOT set Content-Type if it's FormData, let the browser handle it
  if (!(options?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Eroare la comunicarea cu backend-ul");
  }

  return res.json();
}