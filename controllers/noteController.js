const Note = require("../models/Note");


const createNote = async (req, res) => {
    try{
        const { title, content } = req.body;
        const newNote = await Note.create({
            title,
            content,
            owner: req.user.id || req.user._id
        });
        return res.status(201).json({
            message: "Note created successfully",
            note: newNote
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const shareNote = async (req, res) => {
    try{
        const { userId, permission } = req.body;
        const note = await Note.findById(req.params.id);

        if(!note) {
            return res.status(404).json({
                error: "Note not found."
            });
        }

        if(note.owner.toString() !== req.user.id) {
            return res.status(403).json({
                error: "Only the owner can share this note."
            });
        }

        if(!["view", "edit"].includes(permission)) {
            return res.status(400).json({
                error: "Must have `view` or `edit` permission to access."
            });
        }

        const existingShare = note.sharedWith.find(
            share => share.user.toString() === userId
        );

        if(existingShare) {
            existingShare.permission = permission;
        } else {
            note.sharedWith.push({
                user: userId,
                permission
            });
        }

        await note.save();

        return res.json({
            message: "Note shared successfully.",
            note
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


const viewNotes = async (req, res) => {
    // User requests notes
    try{
        const { 
            page = 1,
            limit = 10,
        } = req.query;
            // sets up pagination
            // read page and limit (from url)

        const skip = (Number(page) -1) * Number(limit);
            // don't skip any pages if page is 1 etc.
            // calculate how many notes to skip
        
        const notes = await Note.find({
            $or: [
                {
                    owner: req.user.id
                    // show notes if owner = user
                },
                {
                    "sharedWith.user": req.user.id
                    // show notes if note was shared with user
                },
                {
                    visibility: "public-view"
                    // show notes if note is public view
                },
                {
                    visibility: "public-edit"
                    // show notes if note is public edit
                },
            ]
        })
        // find notes by logged in user
                                .skip(skip)
                                // skip previous pages
                                .limit(Number(limit));
                                // only return current page/limit results
        
        return res.json({
            notes
        });
        // send back notes
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


const updateNote = async (req, res) => {
    try{
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({
                error: "Note not found"
            });
        }

        const isOwner = note.owner.toString() === req.user.id;
        const sharedUser = note.sharedWith.find(
            share => share.user.toString() === req.user.id
        );
        const canEdit = sharedUser && sharedUser.permission === "edit";
        const publicEditor = note.visibility === "public-edit";

        if(!isOwner && !canEdit && !publicEditor) {
            return res.status(403).json({
                error: "You do not have permission to edit this note."
            });
        }

        const { title, content } = req.body;
            // fields to be updated
        if (title !== undefined) {
            note.title = title;
        }
        if (content !== undefined) {
            note.content = content;
        }
        
        await note.save();

        return res.json({
            message: "Note updated successfully",
            note
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


const deleteNote = async (req, res) => {
    try{
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({
                error: "Note not found."
            });
        }
        if (note.owner.toString() !== req.user.id) {
            return res.status(403).json({
                error: "You can only delete your own notes."
            });
        }
        
        await note.deleteOne();
        return res.json({
            message: "Note deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


module.exports = {
    createNote, 
    shareNote,
    viewNotes,
    updateNote,
    deleteNote
};