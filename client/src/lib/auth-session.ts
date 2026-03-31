import { AuthUserType } from "@/types";

export const AUTH_COOKIE_NAME = "auth_session";

const encodeBase64Url = (value: string) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const decodeBase64Url = (value: string) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return atob(padded);
};

export const createAuthSessionValue = (user: AuthUserType) => {
  return encodeBase64Url(JSON.stringify(user));
};

export const parseAuthSessionValue = (cookieValue?: string) => {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(cookieValue));

    if (
      typeof parsed?.id !== "string" ||
      typeof parsed?.email !== "string" ||
      typeof parsed?.name !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
    } satisfies AuthUserType;
  } catch {
    return null;
  }
};
