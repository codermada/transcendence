export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      body?.message || "An unexpected error occurred",
    );
    
    (error as Error & { status?: number }).status = response.status;

    throw error;
  }

  return body as T;
}

