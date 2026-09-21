import { useEffect, useState } from "react";

import Login from "./pages/Login";
import AppShell from "./components/AppShell";

import "./App.css";


function App() {

    const [user, setUser] = useState(null);

    const [checkingAuth, setCheckingAuth] = useState(true);

    const [currentPage, setCurrentPage] = useState("dashboard");


    // ==========================================
    // CHECK EXISTING LOGIN
    // ==========================================

    useEffect(() => {

        async function checkAuthentication() {

            const token = localStorage.getItem("token");

            if (!token) {

                setCheckingAuth(false);

                return;

            }


            try {

                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
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

        setCurrentPage("dashboard");

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    function handleLogout() {

        localStorage.removeItem("token");

        setUser(null);

        setCurrentPage("dashboard");

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

        return (

            <Login
                onLogin={handleLogin}
            />

        );

    }


    // ==========================================
    // PAGE RENDERING
    // ==========================================

    function renderPage() {

        switch (currentPage) {

            case "dashboard":

                return (
                    <Dashboard
                        user={user}
                        onLogout={handleLogout}
                    />
                );


            case "alerts":

                return (
                    <div className="page-placeholder">

                        <h1>
                            🚨 System Alerts
                        </h1>

                        <p>
                            System alerts page coming next.
                        </p>

                    </div>
                );


            case "people":

                return (
                    <div className="page-placeholder">

                        <h1>
                            👥 Detected People
                        </h1>

                        <p>
                            Detected people page coming next.
                        </p>

                    </div>
                );


            case "statistics":

                return (
                    <div className="page-placeholder">

                        <h1>
                            📊 Statistics
                        </h1>

                        <p>
                            Statistics page coming next.
                        </p>

                    </div>
                );


            case "profile":

                return (
                    <div className="page-placeholder">

                        <h1>
                            👤 Profile
                        </h1>

                        <p>
                            Profile page coming next.
                        </p>

                    </div>
                );


            case "settings":

                return (
                    <div className="page-placeholder">

                        <h1>
                            ⚙️ Settings
                        </h1>

                        <p>
                            Settings page coming next.
                        </p>

                    </div>
                );


            default:

                return (
                    <Dashboard
                        user={user}
                        onLogout={handleLogout}
                    />
                );

        }

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

