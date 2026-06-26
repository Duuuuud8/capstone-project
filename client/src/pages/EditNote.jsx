import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api";

function EditNote() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        mood: "📝"
    });

    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await API.get("/notes");

                const note = res.data.notes.find(
                    (n) => n._id === id
                );

                if (note) {
                    setFormData({
                        title: note.title,
                        content: note.content,
                        mood: note.mood || "📝"
                    });
                } else {
                    setError("Note not found.");
                }

            } catch (err) {
                setError("Failed to load note.");
            }
        };

        fetchNote();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.patch(`/notes/${id}`, formData);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.error || "Failed to update note."
            );
        }
    };

    return (
        <div>
            <h1>Edit Note</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="mood"
                    value={formData.mood}
                    onChange={handleChange}
                >
                    <option value="📝">📝 Notes</option>
                    <option value="💪">💪 Strong</option>
                    <option value="🔥">🔥 Fire</option>
                    <option value="🎉">🎉 Celebration</option>
                    <option value="✅">✅ Done</option>
                </select>

                <br /><br />

                <textarea
                    name="content"
                    rows="10"
                    cols="50"
                    value={formData.content}
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">
                    Save Changes
                </button>

            </form>

            <br />

            <Link to="/dashboard">
                Back to Dashboard
            </Link>

        </div>
    );
}

export default EditNote;