const cors = require('cors');

const express = require('express');
const multer  = require('multer');

const app = express();

// Add this after initializing your app and before any routes
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/home/ubuntu/rehab_videos/')
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

// Add a GET API endpoint to provide exercise data
app.post('/api/:workoutName/:duration', (req, res) => {
  const workoutName = req.params.workoutName;
  const duration = req.params.duration;

  res.status(200).json({
    "Workout": workoutName,
    "duration": duration
  });

});

// New POST endpoint for exercise selection
app.post('/api/:workoutName/:duration', (req, res) => {
  const workoutName = req.params.workoutName;
  const duration = req.params.duration;

  // You can add logic here to validate the workoutName and duration

  // Send a 200 OK status with a JSON response
  res.status(200).json({
    "Workout": workoutName,
    "duration": duration
  });
});
