
export default class DatasetHandler {
  constructor() {
    this.DBKeypoints = [
      [
        "nose_x",
        "nose_y",
        "left_eye_x",
        "left_eye_y",
        "right_eye_x",
        "right_eye_y",
        "left_ear_x",
        "left_ear_y",
        "right_ear_x",
        "right_ear_y",
        "left_shoulder_x",
        "left_shoulder_y",
        "right_shoulder_x",
        "right_shoulder_y",
        "left_elbow_x",
        "left_elbow_y",
        "right_elbow_x",
        "right_elbow_y",
        "left_wrist_x",
        "left_wrist_y",
        "right_wrist_x",
        "right_wrist_y",
        "left_hip_x",
        "left_hip_y",
        "right_hip_x",
        "right_hip_y",
        "left_knee_x",
        "left_knee_y",
        "right_knee_x",
        "right_knee_y",
        "left_ankle_x",
        "left_ankle_y",
        "right_ankle_x",
        "right_ankle_y",
      ],
    ];
  }

  addKeypoints = (keypoints) => {
    this.DBKeypoints.push(keypoints);
  };

  saveToCSV = () => {
    const csvContent = this.DBKeypoints.map((row) => row.join(",")).join("\n");
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a File object
    const file = new File([blob], "datasetX.csv", { type: 'text/csv' });
    
    console.log(file);
    // Upload the file to the server
    this.uploadFile(file);

    // Your existing code to download the CSV to user's local machine
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "datasetX.csv");
    document.body.appendChild(link);
    link.click();
    this.DBKeypoints = [this.DBKeypoints[0]]; // clear
    document.body.removeChild(link);
  };

  uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
        const response = await fetch('http://18.190.173.191:3000/upload', { // Assuming the backend server is running on port 3000
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('File uploaded successfully');
        } else {
            const text = await response.text();
            alert('File upload failed: ' + text);
        }
    } catch (error) {
        console.error('There was an error uploading the file:', error);
    }
  };

  

}

