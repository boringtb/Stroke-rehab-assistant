const cors = require('cors');

const express = require('express');
const multer  = require('multer');

const app = express();

// Add this after initializing your app and before any routes
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './storage/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.status(200).send('File uploaded successfully');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});