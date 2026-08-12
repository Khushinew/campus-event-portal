import { Link } from "react-router-dom";

function Login() {
    return (
        <div>
            <h1>Login Page</h1>

            <Link to="/register">
                <button>Create an Account</button>
            </Link>

            <Link to="/">
                <button>Back to Home</button>
            </Link>
        </div>
    );
}

export default Login;