const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// On utilise la mémoire vive (RAM) plutôt que le disque dur pour stocker temporairement l'image
const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  // On vérifie si le type MIME du fichier envoyé est bien dans notre liste autorisée
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error("Format de fichier non supporté"), false);
  }
};

module.exports = multer({ storage: storage, fileFilter: fileFilter }).single(
  "image",
);
