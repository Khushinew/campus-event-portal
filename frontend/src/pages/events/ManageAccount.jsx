import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FacultySidebar from "../events/FacultySidebar";
import "./ManageAccount.css";

function ManageAccount() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const currentUser = JSON.parse(savedUser);

      if (currentUser.role !== "faculty") {
        navigate("/");
        return;
      }

      setUser(currentUser);

      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        department: currentUser.department || "",
      });
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      department: formData.department,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setUser(updatedUser);

    setMessage("Your account details have been updated successfully.");
  };

  if (!user) {
    return (
      <div className="manage-account-page">
        <FacultySidebar />

        <main className="manage-account-main">
          <div className="account-loading">
            Loading account...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="manage-account-page">
      <FacultySidebar />

      <main className="manage-account-main">

        {/* Header */}
        <header className="account-header">
          <div>
            <p className="account-label">FACULTY PORTAL</p>

            <h1>Manage Account</h1>

            <p className="account-subtitle">
              Update your account information and keep your faculty profile
              up to date.
            </p>
          </div>

          <button
            className="account-back-btn"
            onClick={() => navigate("/faculty-dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        {/* Account Card */}
        <section className="account-card">

          <div className="account-card-heading">
            <div>
              <p className="small-label">ACCOUNT SETTINGS</p>
              <h2>Personal Information</h2>
            </div>

            <div className="account-avatar">
              {formData.name
                ? formData.name.charAt(0).toUpperCase()
                : "F"}
            </div>
          </div>

          <form onSubmit={handleSave}>

            <div className="account-form-grid">

              {/* Name */}
              <div className="account-field">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div className="account-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Department */}
              <div className="account-field">
                <label htmlFor="department">
                  Department
                </label>

                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter your department"
                />
              </div>

              {/* Role */}
              <div className="account-field">
                <label>
                  Account Role
                </label>

                <input
                  type="text"
                  value="Faculty"
                  disabled
                />
              </div>

            </div>

            {message && (
              <div className="account-success">
                ✓ {message}
              </div>
            )}

            <div className="account-actions">

              <button
                type="button"
                className="account-cancel-btn"
                onClick={() => navigate("/faculty-dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="account-save-btn"
              >
                Save Changes
              </button>

            </div>

          </form>
        </section>

        {/* Security Card */}
        <section className="security-card">

          <div className="security-icon">
            🔒
          </div>

          <div>
            <p className="small-label">
              ACCOUNT SECURITY
            </p>

            <h2>Keep your account secure</h2>

            <p>
              Make sure your account information is accurate and
              only use your Campusphere account on trusted devices.
            </p>
          </div>

        </section>

      </main>
    </div>
  );
}

export default ManageAccount;