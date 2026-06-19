import multer from "multer";
import path   from "path";
import fs     from "fs";

// ── Storage config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/misc";

    if (file.fieldname === "profilePhoto") folder = "uploads/profiles";
    if (file.fieldname === "faceImages")   folder = "uploads/faces";
    if (file.fieldname === "selfie")       folder = "uploads/selfies";

    // Folder exist na kare toh banao
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const unique   = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

// ── File filter — sirf images ──────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

// ── Multer instance ────────────────────────────────────────────────────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ── Helper: file path → URL ────────────────────────────────────────────────────
// "uploads/profiles/file.jpg" → "http://localhost:8080/uploads/profiles/file.jpg"
export const fileUrl = (filePath) => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/"); // Windows fix
  return `${process.env.BASE_URL || "http://localhost:8080"}/${normalized}`;
};

// ── Helper: delete file ────────────────────────────────────────────────────────
export const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch {
    // File already deleted — ignore
  }
};