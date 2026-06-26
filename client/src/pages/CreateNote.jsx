import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function CreateNote() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        mood: "📝"
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.post("/notes", formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create note.");
        }
    };

    return (
        <div>
            <h1>Create Note</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Note title"
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
                    placeholder="Write your note here..."
                    value={formData.content}
                    onChange={handleChange}
                    rows="10"
                    cols="50"
                />

                <br /><br />

                <button type="submit">Create Note</button>
            </form>

            <br />

            <Link to="/dashboard">Back to Dashboard</Link>
        </div>
    );
}

export default CreateNote;