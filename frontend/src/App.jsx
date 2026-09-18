import { useEffect, useState } from "react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import "./App.css";


function App() {

    const [user, setUser] = useState(null);

    const [checkingAuth, setCheckingAuth] =
        useState(true);


    // ==========================================
    // CHECK EXISTING LOGIN
    // ==========================================

    useEffect(() => {

        async function checkAuthentication() {

            const token =
                localStorage.getItem("token");


            if (!token) {

                setCheckingAuth(false);

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/auth/me",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Invalid token"
                    );

                }


                const data =
                    await response.json();


                setUser(
                    data.user
                );


            } catch (error) {

                console.error(
                    "Authentication check failed:",
                    error
                );

                localStorage.removeItem(
                    "token"
                );

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

        localStorage.removeItem(
            "token"
        );

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

        return (

            <Login
                onLogin={handleLogin}
            />

        );

    }


    // ==========================================
    // DASHBOARD
    // ==========================================

    return (

        <Dashboard
            user={user}
            token={localStorage.getItem("token")}
            onLogout={handleLogout}
        />

    );

}


export default App;