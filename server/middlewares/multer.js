import multer from "multer";
import path from 'path';
import fs from 'fs';

// creating multer middleware for parsing formdata 
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage=multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, uploadDir);
    },
    filename:function(req,file,callback){
        callback(null,`${Date.now()}_${file.originalname}`) 
    }
})

const upload=multer({storage});

export default upload;