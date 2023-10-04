
const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const PORT = 3000;
const https = require('https');
const fs = require('fs');

const httpdata = fs.readFileSync('/home/ubuntu/httpsOptions.json','utf8');
const httppath = JSON.parse(httpdata);
const httpsOptions = {
        key: fs.readFileSync(httppath.key),
        cert: fs.readFileSync(httppath.cert)
}

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log("HTTPS server running on port 3000");
});


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

  function generateUniqueSerial() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${timestamp}-${randomNum}`;
  }
  

// POST endpoint to store exercise summary
app.post('/api/summary', (req, res) => {
    const summary = req.body;
    // Generate a unique serial number
    const serialNumber = generateUniqueSerial();

    // Insert the summary and serial number into the SQLite database
    const insertSQL = `INSERT INTO records (serial, summary) VALUES (?, ?)`;
    db.run(insertSQL, [serialNumber, JSON.stringify(summary)], function(err) {
        if (err) {
            console.error("Error storing summary in database:", err);
            return res.status(500).json({ message: 'Error storing summary' });
        }
        
        // Send back the serial number in the response
        res.json({ message: 'Summary saved', serialNumber, summary});
      });
  });

app.post('/api/jsonjump', (req, res) => {
  const nameWorkout = req.body.nameWorkout;
  const duration = req.body.duration;
  const newURL = `https://www.airehabs.com/main/player?nameWorkout=${nameWorkout}&duration=${duration}`;
  res.redirect(newURL);
});

app.get('/main/player*', (req, res) => {
    res.sendFile('/var/www/html/public/main.html');
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

// Add a GET API endpoint to provide exercise data
app.post('/api/:workoutName/:duration', (req, res) => {
  const workoutName = req.params.workoutName;
  const duration = req.params.duration;

  res.status(200).json({
    "Workout": workoutName,
    "duration": duration
  });

});

//Overall exercise summary from backend
app.get('/api/homeworkouts', (req, res) => {
  res.status(200).json({
    "workouts": [
      {
      "name": "Shoulder-Abduction",
      "description": "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
      "videoURL" : null
      },
      {
      "name": "Chest-press",
      "description": "Chest-press description two lines two lines Chest-press description two lines",
      "videoURL" : "https://airehab.sbmi.uth.edu:3000/api/example_videos/Chest-press.mp4"
      },
      {
      "name": "Eccentic-sits",
      "description": "Start standing, slowly sit using leg muscles. Control descent, ensuring smooth movement down, and then go up",
      "videoURL" : "https://airehab.sbmi.uth.edu:3000/api/example_videos/Eccentic-Sits.mp4"
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

app.post('/api/example_videos/:exercise_name', (req, res) => {
  const exerciseName = req.params.exercise_name;
  const videoPath = `/var/www/html/example_videos/${exerciseName}`;  // Use backticks for string interpolation

  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');  // Allow all origins (consider using a specific domain for better security)
  res.header('Access-Control-Allow-Methods', 'POST');  // Allow only POST method for this route
  res.header('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header (optional, but can be useful)
  
  res.sendFile(videoPath);
})

app.get('/api/example_videos/:exercise_name', (req, res) => {
  const exerciseName = req.params.exercise_name;
  const videoPath = `/var/www/html/example_videos/${exerciseName}`;  // Use backticks for string interpolation

  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');  // Allow all origins (consider using a specific domain for better security)
  res.header('Access-Control-Allow-Methods', 'GET');  // Allow only GET method for this route
  res.header('Access-Control-Allow-Headers', 'Content-Type');  // Allow Content-Type header (optional, but can be useful)
  
  res.sendFile(videoPath);
});