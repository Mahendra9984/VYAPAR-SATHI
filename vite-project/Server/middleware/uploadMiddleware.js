import multer from "multer";
import path from "path";
import fs from "fs";

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "documents"
);

// Automatically create folder
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const originalName = path
            .basename(
                file.originalname,
                extension
            )
            .replace(/[^a-zA-Z0-9-_]/g, "_");

        const uniqueName =
            `${originalName}-${Date.now()}-${Math.round(
                Math.random() * 1000000000
            )}${extension}`;

        cb(null, uniqueName);
    },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
    ];

    const allowedExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(extension)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PDF, JPG, JPEG and PNG files are allowed."
            ),
            false
        );
    }
};

// =====================================================
// MULTER
// =====================================================

const upload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

export default upload;