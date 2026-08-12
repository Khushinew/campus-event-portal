import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Home Page</h1>

            <Link to="/login">
                <button>Login</button>
            </Link>

            <Link to="/register">
                <button>Register</button>
            </Link>
        </div>
    );
}

export default Home;