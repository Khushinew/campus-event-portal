export function getStoredUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const payload = token.split(".")[1];

        if (!payload) {
            return null;
        }

        const decodedPayload = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );

        if (!decodedPayload.exp || decodedPayload.exp * 1000 <= Date.now()) {
            return null;
        }

        const user = JSON.parse(localStorage.getItem("user"));

        return user &&
            ["student", "faculty"].includes(user.role) &&
            user.role === decodedPayload.role &&
            String(user.id) === String(decodedPayload.userId)
            ? user
            : null;

    } catch {

        return null;
    }
}

export function getDashboardPath(role) {

    return role === "faculty"
        ? "/faculty-dashboard"
        : "/student-dashboard";
}