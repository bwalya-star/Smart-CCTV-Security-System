import { useState } from "react";
import { loginUser } from "../services/api";


function Login({ onLogin }) {

    const [mode, setMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    async function handleSubmit(event, requestedMode = mode) {

        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);


        try {

            // ==========================
            // LOGIN
            // ==========================

            if (requestedMode === "login") {

                const data =
                    await loginUser(
                        email,
                        password
                    );


                localStorage.setItem(
                    "token",
                    data.token
                );


                onLogin(data.user);

            }


            // ==========================
            // SIGN UP
            // ==========================

            else {

                if (!name || !email || !password) {

                    throw new Error(
                        "Please fill in all fields."
                    );

                }


                const response =
                    await fetch(
                        "http://localhost:5000/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Registration failed."
                    );

                }


                setSuccess(
                    "Account created successfully. You can now sign in."
                );


                // Switch back to login
                setMode("login");

                setName("");
                setPassword("");

            }

        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong."
            );

        } finally {

            setLoading(false);

        }
    }


    function clearMessages(nextMode) {
        setMode(nextMode);
        setError("");
        setSuccess("");
    }


    return (
        <main className="login-page">
            <div className="auth-layout">
                <section className="login-header auth-card">
                    <div className="login-shield">🛡</div>
                    <h1>Smart CCTV</h1>
                    <h2>Security System</h2>
                    <p>
                        Intelligent security monitoring for your home or business.
                    </p>
                </section>

                <section className="login-card auth-card auth-form-card">
                    <h3>{mode === "login" ? "Sign In" : "Create Account"}</h3>

                    {error && <div className="login-error">{error}</div>}

                    {success && <div className="login-success">{success}</div>}

                    <form onSubmit={(event) => handleSubmit(event, mode)}>
                        {mode === "signup" && (
                            <>
                                <label htmlFor="signup-name">Full Name</label>
                                <input
                                    id="signup-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Enter your name"
                                    required
                                />
                            </>
                        )}

                        <label htmlFor={`${mode}-email`}>Email</label>
                        <input
                            id={`${mode}-email`}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <label htmlFor={`${mode}-password`}>Password</label>
                        <input
                            id={`${mode}-password`}
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <span>
                            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                        </span>
                        <button
                            type="button"
                            onClick={() => clearMessages(mode === "login" ? "signup" : "login")}
                        >
                            {mode === "login" ? "Sign Up" : "Sign In"}
                        </button>
                    </div>
                </section>

                <section className="security-info auth-card">
                    <h4>🔒 About Smart CCTV</h4>
                    <p>
                        Smart CCTV combines motion detection, camera capture and
                        AI-based person detection to help monitor your property.
                    </p>
                    <p>Your account provides access to security alerts and your dashboard.</p>
                </section>

                <footer className="login-footer auth-card">
                    <p>Smart CCTV Security System</p>
                    <span>© 2026 • Final Year Project</span>
                </footer>
            </div>
        </main>
    );
}


export default Login;