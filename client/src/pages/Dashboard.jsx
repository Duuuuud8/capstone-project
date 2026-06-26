import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import ReactMarkdown from "react-router-dom";


function Dashboard() {
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [error, setError] = useState("");

    const [shareData, setShareData] = useState({
        noteId: "",
        login: "",
        permission: "view"
    });

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await API.get("/notes");
                setNotes(res.data.notes);
            } catch (err) {
                setError("Failed to load notes.");
            }
        };

        fetchNotes();
    }, []);

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notes/${id}`);

            setNotes(notes.filter((note) => note._id !== id));
        } catch (err) {
            setError("Failed to delete note.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

// ========================
// Share

    const handleShareChange = (e) => {
        setShareData({
            ...shareData,
            [e.target.name]: e.target.value
        });
    };

    const handleShare = async (e) => {
        e.preventDefault();

        try {
            await API.patch(`/notes/${shareData.noteId}/share`, {
                login: shareData.login,
                permission: shareData.permission
            });

            setShareData({
                noteId: "",
                login: "",
                permission: "view"
            });

            alert("Note shared successfully.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to share note.");
        }
    };
// ======================

    return (
        <div>
            <h1>My Notes</h1>

            <button onClick={handleLogout}>
                Logout
            </button>

            <Link to="/create">
                <button>Create Note</button>
            </Link>

            <hr />

            {error && <p>{error}</p>}

            {notes.length === 0 ? (
                <p>No notes yet.</p>
            ) : (
                notes.map((note) => (
                    <div
                        key={note._id}
                        style={{
                            border: "1px solid gray",
                            padding: "10px",
                            marginBottom: "10px"
                        }}
                    >
                        <h2>
                            {note.mood} {note.title}
                        </h2>

                        <ReactMarkdown>
                            {note.content}
                        </ReactMarkdown>

                        <Link to={`/edit/${note._id}`}>
                            <button>Edit</button>
                        </Link>

                            <button onClick={() => handleDelete(note._id)}>
                                    Delete
                            </button>

                            <button
                                onClick={() =>
                                    setShareData({
                                        ...shareData,
                                        noteId: note._id
                                    })
                                }
                            >
                                Share
                            </button>

                            {shareData.noteId === note._id && (
                                <form onSubmit={handleShare}>
                                    <input
                                        type="text"
                                        name="login"
                                        placeholder="Username or Email to share with"
                                        value={shareData.login}
                                        onChange={handleShareChange}
                                    />

                                    <select
                                        name="permission"
                                        value={shareData.permission}
                                        onChange={handleShareChange}
                                    >
                                        <option value="view">View</option>
                                        <option value="edit">Edit</option>
                                    </select>

                                    <button type="submit">Confirm Share</button>
                                </form>
                            )}
                    </div>
                ))
            )}
        </div>
    );
}

export default Dashboard;