export function getStoredUser() {
  try {
    const token = sessionStorage.getItem("token");
    const serializedUser = sessionStorage.getItem("user");

    if (!token || !serializedUser) {
      clearAuthSession();
      return null;
    }

    const tokenParts = token.split(".");
    const encodedPayload = tokenParts[1];

    if (!encodedPayload) {
      clearAuthSession();
      return null;
    }

    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(
      atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "="))
    );

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      clearAuthSession();
      return null;
    }

    const user = JSON.parse(serializedUser);
    if (user && ["student", "faculty"].includes(user.role)) return user;

    clearAuthSession();
    return null;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function getSessionToken() {
  return getStoredUser() ? sessionStorage.getItem("token") : null;
}

export function saveAuthSession(user, token) {
  sessionStorage.setItem("user", JSON.stringify(user));
  sessionStorage.setItem("token", token);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function clearAuthSession() {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function getDashboardPath(role) {
  return role === "faculty" ? "/faculty-dashboard" : "/student-dashboard";
}