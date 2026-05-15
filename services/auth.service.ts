import api from "./api";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data as { success: boolean; user?: AuthUser };
};

/** Returns the current user or null (does not throw on 401). */
export const fetchSession = async (): Promise<AuthUser | null> => {
  try {
    const data = await getCurrentUser();
    if (data?.success && data.user?.id) return data.user;
    return null;
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};
