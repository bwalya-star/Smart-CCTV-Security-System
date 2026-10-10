import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../Services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ initialMode = "login", onLogin, onBackToLanding }) {
    const [resetToken, setResetToken] = useState(() =>
        new URLSearchParams(window.location.search).get("resetToken") || ""
    );
    const [mode, setMode] = useState(() => resetToken ? "reset-confirm" : initialMode);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [propertyInformation, setPropertyInformation] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [loading, setLoading] = useState(false);
    const [checkingResetLink, setCheckingResetLink] = useState(Boolean(resetToken));
    const [resetLinkValid, setResetLinkValid] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [accountRequestSubmitted, setAccountRequestSubmitted] = useState(false);
    const [adminNotificationSent, setAdminNotificationSent] = useState(true);
    const [applicantEmailSent, setApplicantEmailSent] = useState(true);

    useEffect(() => {
        if (!resetToken) return undefined;

        let active = true;
        fetch(`${API_URL}/api/auth/reset-password/${encodeURIComponent(resetToken)}`)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "This reset link is invalid or has expired.");
                if (active) setResetLinkValid(true);
            })
            .catch(linkError => {
                if (active) setError(linkError.message || "This reset link is invalid or has expired.");
            })
            .finally(() => {
                if (active) setCheckingResetLink(false);
            });

        return () => { active = false; };
    }, [resetToken]);

    function clearMessages(nextMode) {
        setMode(nextMode);
        setError("");
        setSuccess("");
        setAccountRequestSubmitted(false);
    }

    function togglePasswordVisibility(field) {
        setVisiblePasswords(current => ({
            ...current,
            [field]: !current[field]
        }));
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
            } else if (mode === "signup") {
                if (password !== confirmPassword) throw new Error("Passwords do not match.");

                const response = await fetch(
                    `${API_URL}/api/auth/register`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name,
                            email,
                            password,
                            contactPhone,
                            propertyType,
                            propertyInformation
                        })
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Registration failed.");
                }

                setAccountRequestSubmitted(true);
                setAdminNotificationSent(data.adminEmailSent !== false);
                setApplicantEmailSent(data.applicantEmailSent !== false);
                setConfirmPassword("");
            } else if (mode === "forgot") {
                const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || "Unable to send a reset link.");
                setSuccess(data.message);
            } else {
                if (!resetLinkValid) throw new Error("This password reset link is invalid or has expired.");
                if (password !== confirmPassword) throw new Error("Passwords do not match.");

                const response = await fetch(
                    `${API_URL}/api/auth/reset-password/${encodeURIComponent(resetToken)}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ password, confirmPassword })
                    }
                );
                const data = await response.json();

                if (!response.ok) throw new Error(data.error || "Unable to update your password.");

                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.delete("resetToken");
                window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
                setResetToken("");
                setResetLinkValid(false);
                setPassword("");
                setConfirmPassword("");
                setMode("login");
                setSuccess(data.message);
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
            <section id="login-section" className={`login-card auth-card auth-form-card ${mode === "signup" ? "auth-signup-card" : ""}`}>
                <button className="auth-back-button" onClick={onBackToLanding} type="button">
                    <ArrowLeft size={16} />
                    Back to Smart CCTV
                </button>

                {!accountRequestSubmitted && <div className="auth-form-heading">
                    <span className="eyebrow">SECURE ACCESS</span>
                    <h1>{mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : mode === "forgot" ? "Forgot password?" : "Set a new password"}</h1>
                    <p>{mode === "login" ? "Sign in to continue monitoring your property." : mode === "signup" ? "Set up your private Smart CCTV security workspace." : mode === "forgot" ? "Enter your account email and we will send you a secure reset link." : "Choose a new password for your account."}</p>
                </div>}

                {!accountRequestSubmitted && error && <div className="login-error">{error}</div>}
                {!accountRequestSubmitted && success && <div className="login-success">{success}</div>}

                {checkingResetLink && <div className="login-success">Checking your password reset link...</div>}

                {!accountRequestSubmitted && <form className={mode === "signup" ? "signup-form" : ""} onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <>
                            <label htmlFor="signup-name">Full Name <span className="required-mark">Required</span></label>
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

                    {(mode === "login" || mode === "signup" || mode === "forgot") && (
                        <>
                            <label htmlFor={`${mode}-email`}>Email {mode === "signup" && <span className="required-mark">Required</span>}</label>
                            <input
                                id={`${mode}-email`}
                                type="email"
                                value={email}
                                onChange={event => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />
                        </>
                    )}

                    {mode === "signup" && (
                        <>
                            <label htmlFor="signup-phone">Contact phone <span className="required-mark">Required</span></label>
                            <input
                                id="signup-phone"
                                type="tel"
                                value={contactPhone}
                                onChange={event => setContactPhone(event.target.value)}
                                placeholder="Enter your phone number"
                                autoComplete="tel"
                                maxLength={40}
                                required
                            />
                            <label htmlFor="signup-property-type">Property type <span className="required-mark">Required</span></label>
                            <select
                                id="signup-property-type"
                                value={propertyType}
                                onChange={event => setPropertyType(event.target.value)}
                                required
                            >
                                <option value="" disabled>Select Business or House</option>
                                <option value="Business">Business</option>
                                <option value="House">House</option>
                            </select>
                            <label htmlFor="signup-property-information">Additional property information <span className="optional-mark">Optional</span></label>
                            <textarea
                                id="signup-property-information"
                                value={propertyInformation}
                                onChange={event => setPropertyInformation(event.target.value)}
                                placeholder="Address, entry points, or other relevant details"
                                maxLength={2000}
                                rows={3}
                            />
                        </>
                    )}

                    {(mode === "login" || mode === "signup" || mode === "reset-confirm") && (
                        <>
                            <label htmlFor={`${mode}-password`}>{mode === "reset-confirm" ? "New password" : "Password"} {mode === "signup" && <span className="required-mark">Required</span>}</label>
                            <div className="password-input-wrap">
                                <input
                                    id={`${mode}-password`}
                                    type={visiblePasswords.password ? "text" : "password"}
                                    value={password}
                                    onChange={event => setPassword(event.target.value)}
                                    placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    minLength={mode === "login" ? undefined : 8}
                                    maxLength={mode === "login" ? undefined : 16}
                                    required
                                />
                                <button
                                    className="password-visibility-button"
                                    type="button"
                                    onClick={() => togglePasswordVisibility("password")}
                                    aria-label={visiblePasswords.password ? "Hide password" : "Show password"}
                                    aria-pressed={Boolean(visiblePasswords.password)}
                                >
                                    {visiblePasswords.password ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {(mode === "signup" || mode === "reset-confirm") && (
                                <p className="password-policy">8-16 characters, including uppercase and lowercase letters, a number, and a special symbol such as ! @ # $ %.</p>
                            )}
                        </>
                    )}

                    {mode === "signup" && (
                        <>
                            <label htmlFor="signup-confirm-password">Confirm password <span className="required-mark">Required</span></label>
                            <input
                                id="signup-confirm-password"
                                type={visiblePasswords.confirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={event => setConfirmPassword(event.target.value)}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={16}
                                required
                            />
                        </>
                    )}

                    {mode === "reset-confirm" && (
                        <>
                            <label htmlFor="confirm-password">Confirm new password</label>
                            <div className="password-input-wrap">
                                <input
                                    id="confirm-password"
                                    type={visiblePasswords.confirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={event => setConfirmPassword(event.target.value)}
                                    placeholder="Re-enter your new password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    maxLength={16}
                                    required
                                />
                                <button
                                    className="password-visibility-button"
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirmPassword")}
                                    aria-label={visiblePasswords.confirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    aria-pressed={Boolean(visiblePasswords.confirmPassword)}
                                >
                                    {visiblePasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </>
                    )}

                    {mode === "login" && (
                        <button className="auth-forgot-button" type="button" onClick={() => clearMessages("forgot")}>
                            Forgot password?
                        </button>
                    )}

                    <button className="dashboard-button dashboard-button-primary auth-submit-button" type="submit" disabled={loading || checkingResetLink || (mode === "reset-confirm" && !resetLinkValid)}>
                        {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send reset link" : "Update password"}
                    </button>
                </form>}

                {!accountRequestSubmitted && <div className="auth-switch">
                    <span>{mode === "login" ? "Don't have an account?" : mode === "signup" ? "Already have an account?" : "Remembered your password?"}</span>
                    <button type="button" onClick={() => clearMessages(mode === "login" ? "signup" : "login")}>
                        {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                </div>}
            </section>
            {accountRequestSubmitted && (
                <div className="account-request-backdrop" role="presentation">
                    <section className="account-request-modal" role="dialog" aria-modal="true" aria-labelledby="account-request-title">
                        <span className="account-request-icon"><CheckCircle2 size={26} /></span>
                        <span className="eyebrow">REQUEST SUBMITTED</span>
                        <h2 id="account-request-title">Awaiting approval</h2>
                        <p>Your account request has been submitted. You cannot sign in until it is approved.</p>
                        {!adminNotificationSent && <p className="login-error">The request is saved for administrator review, but the notification email could not be delivered.</p>}
                        {!applicantEmailSent && <p className="login-error">Your request is saved, but we could not send the confirmation email. Check that your email address is correct or contact the administrator.</p>}
                        <p>We’ll email you at <strong>{email}</strong> when a decision is made. If approved, your account will be created and ready to use.</p>
                        <button className="dashboard-button dashboard-button-primary" type="button" onClick={onBackToLanding}>
                            <ArrowLeft size={16} />
                            Back to Smart CCTV
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}

export default Login;
