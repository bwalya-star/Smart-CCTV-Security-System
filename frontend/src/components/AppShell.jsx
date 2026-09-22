import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    ShieldAlert,
    UserRound,
    X
} from "lucide-react";
import useAlerts from "../hooks/useAlerts";
import Dashboard from "../pages/Dashboard";
import AlertLogs from "../pages/AlertLogs";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";

const MotionNav = motion.nav;
const MotionDiv = motion.div;

const navigationItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "alerts", label: "Alerts", icon: ShieldAlert },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: UserRound }
];

function AppShell({ user, token, onLogout }) {
    const [activePage, setActivePage] = useState("overview");
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
    const { alerts, loading, liveAlert } = useAlerts(user?.id);

    useEffect(() => {
        function closeMenuOnEscape(event) {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setLogoutPromptOpen(false);
            }
        }

        window.addEventListener("keydown", closeMenuOnEscape);

        return () => {
            window.removeEventListener("keydown", closeMenuOnEscape);
        };
    }, []);

    function handleLogout() {
        setMenuOpen(false);
        setLogoutPromptOpen(true);
    }

    function navigateTo(page) {
        setActivePage(page);
        setMenuOpen(false);
    }

    const pageProps = {
        alerts,
        loading,
        liveAlert,
        user,
        token,
        onNavigate: navigateTo
    };

    return (
        <div className="app-shell">
            <MotionNav
                className="cctv-nav"
                aria-label="Primary navigation"
                initial={{ y: -18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <div className="cctv-brand">
                    <div className="brand-icon">
                        <Shield size={19} strokeWidth={2.2} />
                    </div>
                    <div>
                        <strong>Smart CCTV</strong>
                        <span>Security System</span>
                    </div>
                </div>

                <div className={`cctv-nav-links ${menuOpen ? "menu-open" : ""}`}>
                    {navigationItems.map(item => (
                        <button
                            className={activePage === item.id ? "active" : ""}
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            aria-current={activePage === item.id ? "page" : undefined}
                            type="button"
                        >
                            <item.icon size={16} strokeWidth={2} />
                            {item.label}
                            {item.id === "alerts" && alerts.length > 0 && (
                                <span className="nav-count">{alerts.length}</span>
                            )}
                        </button>
                    ))}
                    <div className="mobile-nav-actions">
                        <div className="nav-system-status">
                            <span className="nav-status-dot"></span>
                            System Online
                        </div>
                        <button className="nav-logout" onClick={handleLogout} type="button">
                            <LogOut size={15} strokeWidth={2} />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="cctv-nav-actions">
                    <div className="nav-system-status">
                        <span className="nav-status-dot"></span>
                        System Online
                    </div>
                    <button className="nav-logout" onClick={handleLogout} type="button">
                        <LogOut size={15} strokeWidth={2} />
                        Logout
                    </button>
                </div>

                <button
                    className="nav-menu-button"
                    onClick={() => setMenuOpen(current => !current)}
                    type="button"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </MotionNav>

            <main className="shell-main">
                <header className="shell-header">
                    <div>
                        <span className="eyebrow">SECURITY OPERATIONS</span>
                        <h1>{navigationItems.find(item => item.id === activePage)?.label}</h1>
                    </div>
                    <div className="header-status">
                        <span className="connection-dot"></span>
                        Live monitoring
                    </div>
                </header>

                <MotionDiv
                    className="shell-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
                >
                    {activePage === "overview" && <Dashboard {...pageProps} />}
                    {activePage === "alerts" && <AlertLogs {...pageProps} />}
                    {activePage === "notifications" && <Notifications {...pageProps} />}
                    {activePage === "profile" && <Profile {...pageProps} />}
                </MotionDiv>
            </main>

            {logoutPromptOpen && (
                <div
                    className="logout-modal-backdrop"
                    role="presentation"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            setLogoutPromptOpen(false);
                        }
                    }}
                >
                    <div
                        className="logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-modal-title"
                    >
                        <div className="logout-modal-icon">
                            <LogOut size={20} />
                        </div>
                        <h2 id="logout-modal-title">Log out of Smart CCTV?</h2>
                        <p>Your monitoring session will end on this device.</p>
                        <div className="logout-modal-actions">
                            <button
                                className="dashboard-button"
                                onClick={() => setLogoutPromptOpen(false)}
                                type="button"
                            >
                                Stay signed in
                            </button>
                            <button
                                className="dashboard-button dashboard-button-danger"
                                onClick={onLogout}
                                type="button"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppShell;
