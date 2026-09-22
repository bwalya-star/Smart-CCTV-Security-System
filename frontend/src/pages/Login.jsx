import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loginUser } from "../Services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ initialMode = "login", onLogin, onBackToLanding }) {
    const [mode, setMode] = useState(initialMode);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function clearMessages(nextMode) {
        setMode(nextMode);
        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "login") {
                const data = await loginUser(email, password);
                localStorage.setItem("token", data.token);
                onLogin(data.user);
            } else {
                if (!name || !email || !password) {
                    throw new Error("Please fill in all fields.");
                }

                const response = await fetch(
                    `${API_URL}/api/auth/register`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, email, password })
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Registration failed.");
                }

                setSuccess("Account created successfully. You can now sign in.");
                setMode("login");
                setName("");
                setPassword("");
            }
        } catch (submitError) {
            console.error("Authentication error:", submitError);
            setError(submitError.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page auth-only-page">
            <section id="login-section" className="login-card auth-card auth-form-card">
                <button className="auth-back-button" onClick={onBackToLanding} type="button">
                    <ArrowLeft size={16} />
                    Back to Smart CCTV
                </button>

                <div className="auth-form-heading">
                    <span className="eyebrow">SECURE ACCESS</span>
                    <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
                    <p>{mode === "login" ? "Sign in to continue monitoring your property." : "Set up your private Smart CCTV security workspace."}</p>
                </div>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <>
                            <label htmlFor="signup-name">Full Name</label>
                            <input
                                id="signup-name"
                                type="text"
                                value={name}
                                onChange={event => setName(event.target.value)}
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
                        onChange={event => setEmail(event.target.value)}
                        placeholder="Enter your email"
                        required
                    />

                    <label htmlFor={`${mode}-password`}>Password</label>
                    <input
                        id={`${mode}-password`}
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                        required
                    />

                    <button className="dashboard-button dashboard-button-primary auth-submit-button" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>{mode === "login" ? "Don't have an account?" : "Already have an account?"}</span>
                    <button type="button" onClick={() => clearMessages(mode === "login" ? "signup" : "login")}>
                        {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Login;
