const express = require("express");
const { authenticate } = require("../middleware/auth");
const noteController = require("../controllers/noteController");

const router = express.Router();

router.use(authenticate);

router.get("/", noteController.getAllNotes.bind(noteController));
router.get("/trash/all", noteController.getDeletedNotes.bind(noteController));
router.get("/:id", noteController.getNoteById.bind(noteController));
router.post("/", noteController.createNote.bind(noteController));
router.put("/:id", noteController.updateNote.bind(noteController));
router.delete("/:id", noteController.deleteNote.bind(noteController));
router.post("/:id/restore", noteController.restoreNote.bind(noteController));
router.delete("/:id/permanent", noteController.permanentlyDeleteNote.bind(noteController));
router.get("/:id/versions", noteController.getNoteVersions.bind(noteController));
router.post(
  "/:id/versions/:versionId/restore",
  noteController.restoreVersion.bind(noteController)
);

module.exports = router;
