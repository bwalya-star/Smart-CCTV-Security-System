import { useEffect, useMemo, useState } from "react";
import { ImagePlus, ShieldCheck, Trash2, UserRoundPlus } from "lucide-react";
import { enrollPerson, getEnrolledPeople, unenrollPerson } from "../Services/api";

const MINIMUM_PHOTOS = 5;
const MAXIMUM_PHOTOS = 10;
const MAXIMUM_IMAGE_SIZE = 4 * 1024 * 1024;
const MAXIMUM_TOTAL_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function EnrolledPeople({ token }) {
    const [people, setPeople] = useState([]);
    const [name, setName] = useState("");
    const [relationship, setRelationship] = useState("");
    const [notes, setNotes] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const selectedImagePreviews = useMemo(
        () => images.map(file => ({ file, url: URL.createObjectURL(file) })),
        [images]
    );

    useEffect(() => () => {
        // Release browser-managed preview URLs when the selection changes or the component unmounts.
        selectedImagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    }, [selectedImagePreviews]);

    useEffect(() => {
        let cancelled = false;

        async function loadPeople() {
            try {
                const data = await getEnrolledPeople(token);
                if (!cancelled) {
                    setPeople(data.people || []);
                    setError("");
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError.message || "Unable to load enrolled people.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPeople();
        return () => {
            cancelled = true;
        };
    }, [token]);

    function handleImageSelection(event) {
        const selected = Array.from(event.target.files || []);
        event.target.value = "";
        setError("");
        setNotice("");

        const nextImages = [...images];
        for (const file of selected) {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError(`${file.name} is not a JPEG, PNG, or WebP image.`);
                return;
            }
            if (file.size > MAXIMUM_IMAGE_SIZE) {
                setError(`${file.name} is larger than 4 MB.`);
                return;
            }
            if (nextImages.some(existing => existing.name === file.name &&
                existing.size === file.size && existing.lastModified === file.lastModified)) {
                setError(`${file.name} is already selected.`);
                return;
            }
            nextImages.push(file);
            if (nextImages.length > MAXIMUM_PHOTOS) {
                setError(`You can upload at most ${MAXIMUM_PHOTOS} images.`);
                return;
            }
        }

        const totalSize = nextImages.reduce((total, file) => total + file.size, 0);
        if (totalSize > MAXIMUM_TOTAL_SIZE) {
            setError("The selected images together must be 20 MB or smaller.");
            return;
        }
        setImages(nextImages);
    }

    function removeSelectedImage(imageToRemove) {
        setImages(current => current.filter(image => image !== imageToRemove));
    }

    async function handleEnrollment(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        if (images.length < MINIMUM_PHOTOS) {
            setError(`Select at least ${MINIMUM_PHOTOS} different images.`);
            return;
        }
        if (new Set(images.map(image => `${image.name}:${image.size}:${image.lastModified}`)).size !== images.length) {
            setError("Each selected image must be different.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("relationship", relationship);
        formData.append("notes", notes);
        images.forEach(image => formData.append("images", image));

        setSaving(true);
        try {
            const data = await enrollPerson(token, formData);
            setPeople(current => [...current, data.person].sort((left, right) => left.name.localeCompare(right.name)));
            setName("");
            setRelationship("");
            setNotes("");
            setImages([]);
            setNotice(`${data.person.name} was enrolled with ${data.person.photo_count} verified face images.`);
        } catch (saveError) {
            setError(saveError.message || "Unable to enroll this person.");
        } finally {
            setSaving(false);
        }
    }

    async function handleUnenroll(person) {
        if (!window.confirm(`Unenroll ${person.name}? Their saved face images will be removed and they will no longer be recognized.`)) {
            return;
        }

        setRemovingId(person.id);
        setError("");
        setNotice("");
        try {
            await unenrollPerson(token, person.id);
            setPeople(current => current.filter(item => item.id !== person.id));
            setNotice(`${person.name} was unenrolled.`);
        } catch (removeError) {
            setError(removeError.message || "Unable to unenroll this person.");
        } finally {
            setRemovingId(null);
        }
    }

    return (
        <section className="section-block enrolled-people-section">
            <div className="section-heading">
                <div>
                    <span className="eyebrow">FACE RECOGNITION</span>
                    <h2>Enrolled people</h2>
                </div>
                <span className="muted-label">{people.length} enrolled</span>
            </div>

            <p className="enrollment-intro">
                Enroll trusted household members, staff, and other known people. Provide at least five distinct photos of the same person, each showing one clear face in good lighting.
            </p>

            {error && <p className="enrollment-feedback error" role="alert">{error}</p>}
            {notice && <p className="enrollment-feedback success" role="status">{notice}</p>}

            <form className="enrollment-form" onSubmit={handleEnrollment}>
                <div className="enrollment-fields">
                    <label>
                        Full name
                        <input
                            value={name}
                            onChange={event => setName(event.target.value)}
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                            required
                            disabled={saving}
                            placeholder="Person's full name"
                        />
                    </label>
                    <label>
                        Relationship / role
                        <input
                            value={relationship}
                            onChange={event => setRelationship(event.target.value)}
                            minLength={2}
                            maxLength={60}
                            required
                            disabled={saving}
                            placeholder="For example, family, staff, or visitor"
                        />
                    </label>
                    <label className="enrollment-notes-field">
                        Notes <span>(optional)</span>
                        <textarea
                            value={notes}
                            onChange={event => setNotes(event.target.value)}
                            maxLength={1000}
                            rows={3}
                            disabled={saving}
                            placeholder="Optional details to help identify this person"
                        />
                    </label>
                </div>

                <div className="enrollment-upload">
                    <div>
                        <strong><ImagePlus size={17} /> Face photos</strong>
                        <p>{images.length} of {MINIMUM_PHOTOS} minimum selected · up to {MAXIMUM_PHOTOS} JPEG, PNG, or WebP photos, 4 MB each. Use different angles and lighting.</p>
                    </div>
                    <label className="enrollment-file-button">
                        Choose images
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleImageSelection}
                            disabled={saving || images.length >= MAXIMUM_PHOTOS}
                        />
                    </label>
                </div>

                {selectedImagePreviews.length > 0 && (
                    <div className="enrollment-photo-grid">
                        {selectedImagePreviews.map(({ file, url }) => (
                            <div className="enrollment-photo" key={`${file.name}-${file.lastModified}-${file.size}`}>
                                <img src={url} alt={`Selected enrollment photo: ${file.name}`} />
                                <span title={file.name}>{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSelectedImage(file)}
                                    disabled={saving}
                                    aria-label={`Remove ${file.name}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button className="dashboard-button dashboard-button-primary enrollment-submit" type="submit" disabled={saving}>
                    <UserRoundPlus size={16} />
                    {saving ? "Checking photos and enrolling..." : "Enroll person"}
                </button>
            </form>

            <div className="enrolled-people-list">
                <h3><ShieldCheck size={17} /> Registered identities</h3>
                {loading ? (
                    <p className="enrollment-empty">Loading enrolled people...</p>
                ) : people.length === 0 ? (
                    <p className="enrollment-empty">No people are enrolled yet.</p>
                ) : (
                    <ul>
                        {people.map(person => (
                            <li className="enrolled-person-row" key={person.id}>
                                <span className="enrolled-person-avatar">{person.name.charAt(0).toUpperCase()}</span>
                                <span className="enrolled-person-details">
                                    <strong>{person.name}</strong>
                                    <small>{person.relationship}{person.notes ? ` · ${person.notes}` : ""}</small>
                                    <small>{person.photo_count} face photos</small>
                                </span>
                                <button
                                    className="unenroll-button"
                                    type="button"
                                    onClick={() => handleUnenroll(person)}
                                    disabled={removingId === person.id}
                                    aria-label={`Unenroll ${person.name}`}
                                >
                                    <Trash2 size={15} />
                                    {removingId === person.id ? "Removing..." : "Unenroll"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default EnrolledPeople;
