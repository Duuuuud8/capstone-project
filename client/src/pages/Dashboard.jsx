import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState("");

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

    return (
        <div>
            <h1>My Notes</h1>

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

                        <p>{note.content}</p>

                        <Link to={`/edit/${note._id}`}>
                            <button>Edit</button>
                        </Link>
                    </div>
                ))
            )}
        </div>
    );
}

export default Dashboard;