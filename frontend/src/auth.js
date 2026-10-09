export function getStoredUser() {

    if (!localStorage.getItem("token")) {
        return null;
    }

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        return user &&
            ["student", "faculty"].includes(user.role)
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