import { useCallback, useEffect, useState } from "react";
import {
    createManagedUser,
    deleteManagedUser,
    getAccountRequests,
    getManagedUsers,
    reviewAccountRequest,
    updateManagedUser
} from "../Services/api";

const emptyNewUser = {
    name: "",
    email: "",
    password: "",
    contact_phone: "",
    property_type: "",
    property_information: "",
    role: "user"
};

function AdminUsers({ token, user }) {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [edits, setEdits] = useState({});
    const [newUser, setNewUser] = useState(emptyNewUser);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const loadAdminData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [nextRequests, nextUsers] = await Promise.all([
                getAccountRequests(token),
                getManagedUsers(token)
            ]);
            setRequests(nextRequests);
            setUsers(nextUsers);
            setEdits(Object.fromEntries(nextUsers.map(item => [item.id, {
                name: item.name,
                email: item.email,
                contact_phone: item.contact_phone || "",
                property_type: item.property_type || "",
                property_information: item.property_information || "",
                role: item.role
            }])));
        } catch (loadError) {
            setError(loadError.message || "Unable to load administrator data.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    async function decideRequest(request, decision) {
        setSaving(`request-${request.id}`);
        setError("");
        setNotice("");
        setOpenMenu(null);
        try {
            const result = await reviewAccountRequest(token, request.id, decision);
            setRequests(current => current.filter(item => item.id !== request.id));
            if (decision === "approved" && result.userId) {
                const refreshedUsers = await getManagedUsers(token);
                setUsers(refreshedUsers);
                setEdits(Object.fromEntries(refreshedUsers.map(item => [item.id, {
                    name: item.name,
                    email: item.email,
                    contact_phone: item.contact_phone || "",
                    property_type: item.property_type || "",
                    property_information: item.property_information || "",
                    role: item.role
                }])));
            }
            setNotice(result.message);
        } catch (reviewError) {
            setError(reviewError.message || "Unable to review request.");
        } finally {
            setSaving("");
        }
    }

    async function submitNewUser(event) {
        event.preventDefault();
        setSaving("new-user");
        setError("");
        setNotice("");
        try {
            await createManagedUser(token, newUser);
            setNewUser(emptyNewUser);
            setNotice("User created.");
            await loadAdminData();
        } catch (createError) {
            setError(createError.message || "Unable to create user.");
        } finally {
            setSaving("");
        }
    }

    async function saveUser(userId) {
        setSaving(`user-${userId}`);
        setError("");
        setNotice("");
        try {
            const result = await updateManagedUser(token, userId, edits[userId]);
            setUsers(current => current.map(item => item.id === userId ? result.user : item));
            setNotice("User details updated.");
        } catch (updateError) {
            setError(updateError.message || "Unable to update user.");
        } finally {
            setSaving("");
        }
    }

    async function removeUser(target) {
        if (!window.confirm(`Delete the account for ${target.name}?`)) return;
        setSaving(`user-${target.id}`);
        setError("");
        setNotice("");
        try {
            await deleteManagedUser(token, target.id);
            setUsers(current => current.filter(item => item.id !== target.id));
            setNotice("User deleted.");
        } catch (deleteError) {
            setError(deleteError.message || "Unable to delete user.");
        } finally {
            setSaving("");
        }
    }

    function updateEdit(userId, field, value) {
        setEdits(current => ({ ...current, [userId]: { ...current[userId], [field]: value } }));
    }

    if (loading) return <div className="page-loading">Loading user management...</div>;

    return (
        <div className="page-stack admin-users-page">
            <section className="page-intro">
                <div>
                    <span className="eyebrow">ADMINISTRATION</span>
                    <h2>Manage users</h2>
                    <p>Review account applications and manage registered user access.</p>
                </div>
            </section>

            {error && <p className="admin-feedback error" role="alert">{error}</p>}
            {notice && <p className="admin-feedback success" role="status">{notice}</p>}

            <section className="profile-card admin-section">
                <div className="admin-section-heading">
                    <div><span className="eyebrow">REQUIRES REVIEW</span><h2>Account Requests</h2></div>
                    <span className="admin-count">{requests.length} pending</span>
                </div>
                {requests.length === 0 ? <p className="admin-empty">No account requests awaiting review.</p> : (
                    <ul className="admin-list">
                        {requests.map(request => (
                            <li className="admin-list-row" key={request.id}>
                                <div className="admin-row-main">
                                    <strong>{request.name}</strong>
                                    <span>{request.email} · {request.contact_phone}</span>
                                    <small>{request.property_type}{request.property_information ? ` · ${request.property_information}` : ""}</small>
                                    <time>{new Date(request.created_at).toLocaleString()}</time>
                                </div>
                                <div className="admin-action-menu">
                                    <button className="admin-action-trigger" type="button" aria-haspopup="menu" aria-expanded={openMenu === `request-${request.id}`} onClick={() => setOpenMenu(current => current === `request-${request.id}` ? null : `request-${request.id}`)}>
                                        Actions <span aria-hidden="true">⌄</span>
                                    </button>
                                    {openMenu === `request-${request.id}` && <div className="admin-action-options" role="menu">
                                        <button className="admin-menu-button admin-approve" role="menuitem" type="button" disabled={saving === `request-${request.id}`} onClick={() => decideRequest(request, "approved")}>Approve</button>
                                        <button className="admin-menu-button admin-reject" role="menuitem" type="button" disabled={saving === `request-${request.id}`} onClick={() => decideRequest(request, "rejected")}>Reject</button>
                                    </div>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="profile-card admin-section">
                <div className="admin-section-heading">
                    <div><span className="eyebrow">ACCOUNT DIRECTORY</span><h2>Registered Users</h2></div>
                    <span className="admin-count">{users.length} accounts</span>
                </div>
                <ul className="admin-list admin-user-list">
                    {users.map(account => {
                        const edit = edits[account.id] || {};
                        return (
                            <li className="admin-user-item" key={account.id}>
                                <details className="admin-user-details">
                                    <summary><span><strong>{account.name}</strong><small>{account.email}</small></span><span className={`admin-role ${account.role}`}>{account.role}</span></summary>
                                    <form className="admin-user-form" onSubmit={event => { event.preventDefault(); saveUser(account.id); }}>
                                        <label>Name<input required maxLength={100} value={edit.name || ""} onChange={event => updateEdit(account.id, "name", event.target.value)} /></label>
                                        <label>Email<input required type="email" value={edit.email || ""} onChange={event => updateEdit(account.id, "email", event.target.value)} /></label>
                                        <label>Contact phone<input value={edit.contact_phone || ""} onChange={event => updateEdit(account.id, "contact_phone", event.target.value)} /></label>
                                        <label>Property type<select value={edit.property_type || ""} onChange={event => updateEdit(account.id, "property_type", event.target.value)}><option value="">Not specified</option><option value="Business">Business</option><option value="House">House</option></select></label>
                                        <label className="admin-wide-field">Property information<textarea rows={2} value={edit.property_information || ""} onChange={event => updateEdit(account.id, "property_information", event.target.value)} /></label>
                                        <label>Account role<select value={edit.role || "user"} onChange={event => updateEdit(account.id, "role", event.target.value)}><option value="user">User</option><option value="admin">Admin</option></select></label>
                                        <div className="admin-user-actions"><button className="dashboard-button dashboard-button-primary" type="submit" disabled={saving === `user-${account.id}`}>{saving === `user-${account.id}` ? "Saving..." : "Save changes"}</button><button className="dashboard-button dashboard-button-danger" type="button" disabled={account.id === user.id || saving === `user-${account.id}`} onClick={() => removeUser(account)}>Delete user</button></div>
                                    </form>
                                </details>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className="profile-card admin-section">
                <div className="admin-section-heading"><div><span className="eyebrow">ADMIN ACTION</span><h2>Create User</h2></div></div>
                <form className="admin-create-form" onSubmit={submitNewUser}>
                    <label>Name<input required maxLength={100} value={newUser.name} onChange={event => setNewUser(current => ({ ...current, name: event.target.value }))} /></label>
                    <label>Email<input required type="email" value={newUser.email} onChange={event => setNewUser(current => ({ ...current, email: event.target.value }))} /></label>
                    <label>Temporary password<input required type="password" minLength={8} maxLength={16} value={newUser.password} onChange={event => setNewUser(current => ({ ...current, password: event.target.value }))} /></label>
                    <label>Contact phone<input required value={newUser.contact_phone} onChange={event => setNewUser(current => ({ ...current, contact_phone: event.target.value }))} /></label>
                    <label>Property type<select required value={newUser.property_type} onChange={event => setNewUser(current => ({ ...current, property_type: event.target.value }))}><option value="" disabled>Select type</option><option value="Business">Business</option><option value="House">House</option></select></label>
                    <label>Account role<select value={newUser.role} onChange={event => setNewUser(current => ({ ...current, role: event.target.value }))}><option value="user">User</option><option value="admin">Admin</option></select></label>
                    <label className="admin-wide-field">Property information<textarea rows={2} value={newUser.property_information} onChange={event => setNewUser(current => ({ ...current, property_information: event.target.value }))} /></label>
                    <button className="dashboard-button dashboard-button-primary" type="submit" disabled={saving === "new-user"}>{saving === "new-user" ? "Creating..." : "Create user"}</button>
                </form>
            </section>
        </div>
    );
}

export default AdminUsers;
