const CAMPUS_DOMAIN = "gsfcuniversity.ac.in";

export function getCampusRole(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const studentEmail = new RegExp(
    `^\\d{2}(?:bba|bio|mba|bb|bc|bt)\\d+@${CAMPUS_DOMAIN.replaceAll(".", "\\.")}$`
  );
  const facultyEmail = new RegExp(
    `^[a-z]+(?:\\.[a-z]+)+@${CAMPUS_DOMAIN.replaceAll(".", "\\.")}$`
  );

  if (studentEmail.test(normalizedEmail)) return "student";
  if (facultyEmail.test(normalizedEmail)) return "faculty";
  return null;
}

export function getStoredUser() {
  if (!localStorage.getItem("token")) return null;

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && ["student", "faculty"].includes(user.role) ? user : null;
  } catch {
    return null;
  }
}

export function getDashboardPath(role) {
  return role === "faculty" ? "/faculty-dashboard" : "/student-dashboard";
}