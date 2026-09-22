import { useRef, useState } from "react";
import {
    ArrowRight,
    BellRing,
    Camera,
    LockKeyhole,
    Menu,
    Mail,
    ScanFace,
    ShieldCheck,
    X,
    ChevronDown
} from "lucide-react";
import securityCameraImage from "../assets/hero.png";
import aboutImage from "../assets/about.jpg";
import faqImage from "../assets/FAQ.jpg";

function FeatureCard({ icon, title, description, tone }) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    function handleMouseMove(event) {
        const bounds = cardRef.current?.getBoundingClientRect();

        if (bounds) {
            setPosition({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top
            });
        }
    }

    return (
        <div
            ref={cardRef}
            className={`security-feature feature-hover-card feature-hover-${tone}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {visible && (
                <div
                    className="feature-cursor-glow"
                    style={{
                        left: position.x - 120,
                        top: position.y - 120
                    }}
                />
            )}
            <div className="feature-card-content">
                <div className="security-feature-icon">{icon}</div>
                <div>
                    <h5>{title}</h5>
                    <p>{description}</p>
                </div>
            </div>
        </div>
    );
}

function LandingPage({ onOpenAuth }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            question: "What does Smart CCTV detect?",
            answer: "Smart CCTV analyzes camera activity to detect people, classify security events, and support face recognition when identity data is available."
        },
        {
            question: "Can I monitor my camera live?",
            answer: "Yes. After signing in, the dashboard provides a live camera view, recording controls, and access to the latest captured image."
        },
        {
            question: "How are security alerts delivered?",
            answer: "Alerts are recorded privately in your dashboard. High-severity events can also trigger email notifications, with delivery status and cooldown results retained in history."
        },
        {
            question: "Can I manage multiple CCTV devices?",
            answer: "Yes. Your profile area lists the CCTV devices associated with your account and lets you activate or deactivate available devices."
        },
        {
            question: "Is my security data protected?",
            answer: "Dashboard and device data are protected behind authenticated access. Each user sees their own alert history and connected security information."
        }
    ];

    function openAuth(mode) {
        setMenuOpen(false);
        onOpenAuth(mode);
    }

    function scrollTo(id) {
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    return (
        <main className="login-page landing-page">
            <div className="auth-layout">
                <section className="login-hero landing-section">
                    <header className="hero-nav">
                        <button
                            className="hero-brand"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            type="button"
                        >
                            <span className="hero-brand-icon">🛡</span>
                            <span>
                                <strong>Smart CCTV</strong>
                                <small>Security System</small>
                            </span>
                        </button>

                        <nav className={`hero-links ${menuOpen ? "hero-links-open" : ""}`} aria-label="Landing page navigation">
                            <button onClick={() => scrollTo("features-section")} type="button">Features</button>
                            <button onClick={() => scrollTo("faq-section")} type="button">FAQ</button>
                            <button onClick={() => scrollTo("about-section")} type="button">How it works</button>
                            <button onClick={() => openAuth("login")} type="button">Login</button>
                            <button className="hero-signup-mobile" onClick={() => openAuth("signup")} type="button">Sign up</button>
                            <button className="hero-close-menu" onClick={() => setMenuOpen(false)} type="button" aria-label="Close menu">
                                <X size={20} />
                            </button>
                        </nav>

                        <div className="hero-actions">
                            <button className="hero-login-link" onClick={() => openAuth("login")} type="button">Login</button>
                            <button className="hero-signup-link" onClick={() => openAuth("signup")} type="button">Sign up</button>
                        </div>

                        <button
                            className="hero-menu-button"
                            onClick={() => setMenuOpen(current => !current)}
                            type="button"
                            aria-expanded={menuOpen}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                        >
                            {menuOpen ? <X size={21} /> : <Menu size={21} />}
                        </button>
                    </header>

                    <div className="hero-content">
                        <div className="hero-copy">
                            <span className="eyebrow">INTELLIGENT PROPERTY PROTECTION</span>
                            <h1>See more. Know sooner. <span>Stay protected.</span></h1>
                            <p>
                                Smart CCTV combines live camera monitoring, AI-powered detection, face recognition,
                                and actionable alerts for the people and places you care about.
                            </p>
                            <button className="dashboard-button dashboard-button-primary hero-cta" onClick={() => openAuth("signup")} type="button">
                                Create your secure account
                                <ArrowRight size={17} />
                            </button>
                        </div>
                        <div className="hero-image-wrap">
                            <img src={securityCameraImage} alt="Smart CCTV camera monitoring a property" />
                            <div className="hero-live-badge"><span></span> Live protection</div>
                        </div>
                    </div>
                </section>

                <section id="about-section" className="security-info auth-card landing-section">
                    <div className="security-info-layout">
                        <div className="security-image-panel">
                            <img
                                src={aboutImage}
                                alt="Smart CCTV security camera monitoring a property"
                            />
                            <div className="security-image-caption">
                                <ShieldCheck size={15} />
                                <span>Intelligent property protection</span>
                            </div>
                        </div>

                        <div className="security-info-content">
                            <div className="security-info-intro">
                                <div className="security-visual">
                                    <ShieldCheck size={30} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <span className="eyebrow">SMART SECURITY PLATFORM</span>
                                    <h4>Protect what matters</h4>
                                    <p>
                                        Our AI-powered CCTV platform upgrades traditional surveillance into a proactive,
                                        automated security hub for residential and commercial properties.
                                    </p>
                                    <ul className="about-points">
                                        <li><strong>See everything clearly:</strong> High-definition live streams with real-time frame processing and multi-camera overview layouts.</li>
                                        <li><strong>Understand instantly:</strong> Smart detection identifies motion, distinguishes key subjects, and filters routine noise.</li>
                                        <li><strong>Respond swiftly:</strong> Immediate alerts help you review incidents and act on safety threats without delay.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features-section" className="features-section auth-card landing-section">
                    <div className="features-heading">
                        <span className="eyebrow">BUILT FOR AWARENESS</span>
                        <h2>Security intelligence that works for you</h2>
                        <p>One connected platform for understanding activity, monitoring cameras, and responding to important events.</p>
                    </div>

                    <div className="security-features">
                        <FeatureCard
                            icon={<ScanFace size={20} />}
                            title="AI-powered detection"
                            description="Identify people and classify events with confidence and face recognition."
                            tone="violet"
                        />
                        <FeatureCard
                            icon={<Camera size={20} />}
                            title="Live camera monitoring"
                            description="View your camera feed, manage recording, and review the latest capture."
                            tone="green"
                        />
                        <FeatureCard
                            icon={<BellRing size={20} />}
                            title="Actionable alerts"
                            description="Keep a private history of threats, safe events, and notification outcomes."
                            tone="orange"
                        />
                    </div>
                </section>

                <section id="faq-section" className="faq-section auth-card landing-section">
                    <div className="faq-image-panel">
                        <img src={faqImage} alt="Smart CCTV camera protecting a property" />
                    </div>

                    <div className="faq-content">
                        <span className="eyebrow">FAQS</span>
                        <h2>Questions about Smart CCTV?</h2>
                        <p className="faq-intro">
                            Find clear answers about monitoring, detection, notifications, and account security.
                        </p>

                        <div className="faq-list">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;

                                return (
                                    <div className={`faq-item ${isOpen ? "faq-item-open" : ""}`} key={faq.question}>
                                        <button
                                            className="faq-question"
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                            type="button"
                                            aria-expanded={isOpen}
                                        >
                                            <span>{faq.question}</span>
                                            <ChevronDown size={18} />
                                        </button>
                                        <div className="faq-answer" aria-hidden={!isOpen}>
                                            <p>{faq.answer}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <footer className="landing-footer auth-card landing-section">
                    <div className="footer-main">
                        <div className="footer-brand-block">
                            <button className="footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} type="button">
                                <span className="footer-brand-icon">🛡</span>
                                <span>
                                    <strong>Smart CCTV</strong>
                                    <small>Security System</small>
                                </span>
                            </button>
                            <p>
                                Intelligent camera monitoring, AI-powered detection, and secure event history
                                for homes and businesses.
                            </p>
                        </div>

                        <div className="footer-column">
                            <h3>Explore</h3>
                            <button onClick={() => scrollTo("about-section")} type="button">How it works</button>
                            <button onClick={() => scrollTo("features-section")} type="button">Features</button>
                            <button onClick={() => scrollTo("faq-section")} type="button">FAQs</button>
                        </div>

                        <div className="footer-column">
                            <h3>Account</h3>
                            <button onClick={() => openAuth("login")} type="button">Sign in</button>
                            <button onClick={() => openAuth("signup")} type="button">Create account</button>
                        </div>

                        <div className="footer-column footer-contact">
                            <h3>Security first</h3>
                            <p><LockKeyhole size={15} /> Authenticated dashboard access</p>
                            <p><Camera size={15} /> Live camera and device controls</p>
                            <p><Mail size={15} /> Notification-ready monitoring</p>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <span>© 2026 Smart CCTV Security System</span>
                        <span>Built for safer homes and businesses.</span>
                    </div>
                </footer>
            </div>
        </main>
    );
}

export default LandingPage;
