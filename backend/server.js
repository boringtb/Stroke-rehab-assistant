
const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const ExerReqHandler = require('./ExerReqHandler'); // Import the function from handleRequest.js

const app = express();

// Add this after initializing your app and before any routes
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware to assign or read a unique user ID
app.use((req, res, next) => {
    if (!req.cookies.userId) {
      const userId = uuid.v4(); // Generate a new UUID
      res.cookie('userId', userId); // Store it in a cookie
      req.userId = userId;
    } else {
      req.userId = req.cookies.userId;
    }
    next();
  });

// GET endpoint to fetch exercise summary
app.get('/api/summary/:userId', (req, res) => {
    const userId = req.params.userId;
    const summary = exerciseSummaries[userId];
    if (summary) {
      res.json(summary);
    } else {
      res.status(404).json({ message: 'Summary not found' });
    }
  });

// POST endpoint to store exercise summary
app.post('/api/summary', (req, res) => {
    const userId = req.userId;
    const summary = req.body;
    exerciseSummaries[userId] = summary;
    res.json({ message: 'Summary saved', userId });
  });
  

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
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/airehab.sbmi.uth.edu/airehab.sbmi.uth.edu_2023.key"),
  cert: fs.readFileSync("/etc/letsencrypt/live/airehab.sbmi.uth.edu/airehab.sbmi.uth.edu_2023.crt")
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log("HTTPS server running on port 3000");
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

app.get('/api/homeworkouts.json', (req, res) => {
  res.status(200).json({
    "workouts": [
      {
      "name": "Shoulder-Abduction",
      "description": "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
      "videoURL" : "https://www.uth.edu/index/hero-video.mp4"
      },
      {
      "name": "Chest-press",
      "description": "Chest-press description two lines two lines Chest-press description two lines",
      "videoURL" : null
      },
      {
      "name": "Eccentic-sits",
      "description": "Chest-press description two lines two lines Chest-press description two lines",
      "videoURL" : "https://www.uth.edu/index/hero-video.mp4"
      },
      {
      "name": "Elbow-Flexion-Extension",
      "description": "Elbow-Flexion-Extension description two lines two lines Elbow-Flexion-Extension description two lines",
      "videoURL" : null
      },
      {
      "name": "Marching",
      "description": "Marching description two lines two lines Marching description two lines",
      "videoURL" : "https://www.uth.edu/index/hero-video.mp4"
      },
      {
      "name": "Overhead-press",
      "description": "Overhead-press description two lines two lines Overhead-press description two lines",
      "videoURL" : "https://www.uth.edu/index/hero-video.mp4"
      }
      ],
      "workoutDurations": [
      {
      "timeInt": 1,
      "timeUnit": "minutes",
      "timeUnitShort": "min"
      },
      {
      "timeInt": 3,
      "timeUnit": "minutes",
      "timeUnitShort": "min"
      },
      {
      "timeInt": 5,
      "timeUnit": "minutes",
      "timeUnitShort": "min"
      },
      {
      "timeInt": 7,
      "timeUnit": "minutes",
      "timeUnitShort": "min"
      }]
  }); // This route is for handling any other unrecognized requests
})