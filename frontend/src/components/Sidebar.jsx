function Sidebar({
    currentPage,
    setCurrentPage,
    onLogout,
    user
}) {

    const menuItems = [

        {
            id: "dashboard",
            icon: "🏠",
            label: "Dashboard"
        },

        {
            id: "alerts",
            icon: "🚨",
            label: "System Alerts"
        },

        {
            id: "people",
            icon: "👥",
            label: "Detected People"
        },

        {
            id: "statistics",
            icon: "📊",
            label: "Statistics"
        },

        {
            id: "profile",
            icon: "👤",
            label: "Profile"
        },

        {
            id: "settings",
            icon: "⚙️",
            label: "Settings"
        }

    ];


    return (

        <>

            {/* Invisible area that detects the mouse */}

            <div className="sidebar-trigger"></div>


            {/* Sidebar */}

            <aside className="sidebar">

                {/* Header */}

                <div className="sidebar-header">

                    <div className="sidebar-logo">
                        🛡️
                    </div>

                    <div>

                        <h2>
                            SMART CCTV
                        </h2>

                        <span>
                            Security System
                        </span>

                    </div>

                </div>


                {/* User */}

                <div className="sidebar-user">

                    <div className="sidebar-user-icon">
                        👤
                    </div>

                    <div>

                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.email || ""}
                        </span>

                    </div>

                </div>


                {/* Navigation */}

                <nav className="sidebar-navigation">

                    {menuItems.map(item => (

                        <button
                            key={item.id}
                            className={
                                `sidebar-item ${
                                    currentPage === item.id
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                setCurrentPage(item.id)
                            }
                        >

                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>

                        </button>

                    ))}

                </nav>


                {/* Logout */}

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-item logout-sidebar"
                        onClick={onLogout}
                    >

                        <span className="sidebar-icon">
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>

        </>

    );

}


export default Sidebar;