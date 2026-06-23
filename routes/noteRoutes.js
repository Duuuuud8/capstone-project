const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");


const { createNote, shareNote, viewNotes, updateNote, deleteNote } = require("../controllers/noteController");


router.post(
    "/",
    authMiddleware,
    createNote
);

router.patch(
    "/:id/share",
    authMiddleware,
    shareNote
)

router.get(
    "/",
    authMiddleware,
    viewNotes
);

router.patch(
    "/:id",
    authMiddleware,
    updateNote
);

router.delete(
    "/:id/",
    authMiddleware,
    deleteNote
);

module.exports = router;