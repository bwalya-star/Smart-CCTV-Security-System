import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import DevicePanel from "../components/DevicePanel";

const MotionSection = motion.section;

function Profile({ user, token }) {
    const profilePhoto = user?.profile_photo || user?.avatar_url;

    return (
        <div className="page-stack">
            <section className="page-intro">
                <div>
                    <span className="eyebrow">ACCOUNT</span>
                    <h2>Profile & property</h2>
                    <p>Manage your account identity and the security setup connected to it.</p>
                </div>
            </section>

            <MotionSection
                className="profile-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="profile-card profile-identity-card">
                    {profilePhoto ? (
                        <img
                            className="profile-avatar profile-photo"
                            src={profilePhoto}
                            alt={`${user?.name || "User"} profile`}
                        />
                    ) : (
                        <div className="profile-avatar">
                            {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <span className="eyebrow">SIGNED IN AS</span>
                        <h2>{user?.name || "User"}</h2>
                        <p>{user?.email}</p>
                        <span className="role-badge">{user?.role || "user"}</span>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card-icon">
                        <Building2 size={18} />
                    </div>
                    <span className="eyebrow">BUSINESS / HOUSE</span>
                    <h3>Primary security site</h3>
                    <div className="profile-detail"><span>Property type</span><strong>Business / House</strong></div>
                    <div className="profile-detail"><span>Monitoring</span><strong className="detail-online">Active 24/7</strong></div>
                    <div className="profile-detail"><span>Alert access</span><strong>Private to your account</strong></div>
                </div>
            </MotionSection>

            <DevicePanel token={token} />
        </div>
    );
}

export default Profile;
