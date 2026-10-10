import { useEffect, useState } from "react";

import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import AppShell from "./components/AppShell";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {

    const [user, setUser] = useState(null);

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [authView, setAuthView] = useState(() =>
        new URLSearchParams(window.location.search).has("resetToken")
            ? "auth"
            : "landing"
    );
    const [authMode, setAuthMode] = useState("login");

    // ==========================================
    // CHECK EXISTING LOGIN
    // ==========================================

    useEffect(() => {

        async function checkAuthentication() {

            if (new URLSearchParams(window.location.search).has("resetToken")) {
                setCheckingAuth(false);
                return;
            }

            const token = localStorage.getItem("token");

            if (!token) {

                setCheckingAuth(false);

                return;

            }


            try {

                const response = await fetch(
                    `${API_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    }
                );


                if (!response.ok) {

                    throw new Error("Invalid token");

                }


                const data = await response.json();

                setUser(data.user);


            } catch (error) {

                console.error(
                    "Authentication check failed:",
                    error
                );

                localStorage.removeItem("token");

                setUser(null);


            } finally {

                setCheckingAuth(false);

            }

        }


        checkAuthentication();

    }, []);


    // ==========================================
    // LOGIN
    // ==========================================

    function handleLogin(loggedInUser) {

        setUser(loggedInUser);

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    function handleLogout() {

        localStorage.removeItem("token");

        setUser(null);

    }


    // ==========================================
    // CHECKING AUTHENTICATION
    // ==========================================

    if (checkingAuth) {

        return (

            <div className="auth-loading">

                <div className="auth-loading-icon">
                    🛡
                </div>

                <p>
                    Checking security session...
                </p>

            </div>

        );

    }


    // ==========================================
    // LOGIN PAGE
    // ==========================================

    if (!user) {
        if (authView === "auth") {
            return (
                <Login
                    initialMode={authMode}
                    onLogin={handleLogin}
                    onBackToLanding={() => setAuthView("landing")}
                />
            );
        }

        return (
            <LandingPage
                onOpenAuth={mode => {
                    setAuthMode(mode);
                    setAuthView("auth");
                }}
            />
        );

    }


    // ==========================================
    // MAIN APPLICATION
    // ==========================================

    return (
        <AppShell
            user={user}
            token={localStorage.getItem("token")}
            onLogout={handleLogout}
        />
    );

}


export default App;

