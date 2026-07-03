import multer from "multer";
import os from 'os';

// Use the OS temp directory — works both locally and on serverless (Vercel/AWS Lambda)
// where the filesystem is read-only except for /tmp
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, os.tmpdir());
    },
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

export default upload;