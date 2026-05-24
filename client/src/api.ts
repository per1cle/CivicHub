export const API_URL = "http://localhost:3001/api";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error("Eroare la comunicarea cu backend-ul");
  }

  return res.json();
}