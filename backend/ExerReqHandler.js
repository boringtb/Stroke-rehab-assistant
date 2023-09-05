// handleRequest.js
module.exports = function handleRequest(req, res) {
    // Parse the JSON payload
    const { exertype } = req.params.workoutName;
  
    let responseJson = {};
  
    switch (exertype) {
      case 'Shoulder-Abduction':
        responseJson = { name: "Shoulder-Abduction",
        description: "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
        videoURL : "https://www.uth.edu/index/hero-video.mp4" };
        break;

      case 'Marching':
        responseJson = { name: "Marching",
        description: "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
        videoURL : "https://www.uth.edu/index/hero-video.mp4" };
        break;

      case 'Chest-press':
        responseJson = { name: "Chest-press",
        description: "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
        videoURL : "https://www.uth.edu/index/hero-video.mp4" };
        break;

      case 'Elbow-Flexion-Extension':
        responseJson = { name: "Elbow-Flexion-Extension",
        description: "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
        videoURL : "https://www.uth.edu/index/hero-video.mp4" };
        break;

      case 'Eccentic-sits':
        responseJson = { name: "Eccentic-sits",
        description: "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
        videoURL : "https://www.uth.edu/index/hero-video.mp4" };
        break;

      case 'Overhead-press':
        responseJson = { name: "Overhead-press",
        description: "Shoulder-Abduction description two lines Shoulder-Abduction description two lines",
        videoURL : "https://www.uth.edu/index/hero-video.mp4" };
        break;       
    }
  
    res.json(responseJson);
  };
  
  
  
  