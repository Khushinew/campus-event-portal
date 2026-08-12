import { Link } from "react-router-dom";

function Register() {
    return (
        <div>
            <h1>Registration Page</h1>

            <Link to="/login">
                <button>Already have an account? Login</button>
            </Link>

            <Link to="/">
                <button>Back to Home</button>
            </Link>
        </div>
    );
}

export default Register;