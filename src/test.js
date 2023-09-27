import PoseHandler from "./handlers/poseHandler";
import TimerHandler from "./handlers/timerHandler";
import ScoreHandler from "./handlers/scoreHandler";
import SettingsHandler from "./handlers/settingsHandler";

import adapter from 'webrtc-adapter';
window.adapter = adapter; // Make it globally available
import Janus from 'janus-gateway';

let janusInstance;
let janusVideoRoomHandle;

// Function to send a POST request to the server and get a response
async function postExerciseSelection(workoutName, duration) {
  const dur = duration.split(" ")[0];
  const response = await fetch(`https://airehab.sbmi.uth.edu:3000/api/${workoutName}/${dur}`, {
    method: 'POST'
  });
  const data = await response.json();

  if (response.status === 200) {
    // Update the URL to move to the next view
    const newURL = `${window.location.protocol}//${window.location.host}/main/player?nameWorkout=${workoutName}&duration=${dur}`;
    window.history.pushState({ path: newURL }, '', newURL);
    
    // Do additional logic here to handle the next view
  }
}

if (Janus && typeof Janus.init === 'function') {
    console.log("Attempting to initialize Janus...");
    Janus.init({
        debug: "all",
        callback: function() {
            if (!Janus.isWebrtcSupported()) {
                console.error("No WebRTC support...");
                return;
            }
            janusInstance = new Janus({
                server: "wss://wss.airehab.sbmi.uth.edu:8989",
                success: function() {
                    console.log("Connected to Janus");
                    janusInstance.attach({
                        plugin: "janus.plugin.videoroom",
                        success: function(pluginHandle) {
                            janusVideoRoomHandle = pluginHandle;
                            console.log("VideoRoom plugin attached");

                            // Join the existing video room with room number 1234
                            const joinRoomData = {
                                request: "join",
                                room: 1234,
                                ptype: "publisher",
                                display: "Demo User"
                            };

                            janusVideoRoomHandle.send({
                                message: joinRoomData,
                                success: function(joinResponse) {
                                    console.log("Joined the video room!");
                                }
                            });
                        },
                        error: function(error) {
                            console.error("Error attaching Video Room plugin:", error);
                        }
                    });
                },
                error: function(error) {
                    console.error("Janus error:", error);
                },
                destroyed: function() {
                    console.log("Janus session destroyed");
                }
            });
        }
    });
} else {
    console.error("Janus is not initialized or the init method is missing.");
}

document.addEventListener("DOMContentLoaded", async () => {
  let webcamElem = document.getElementById("webcamBox");
  const cnvPoseElem = document.getElementById("cnvPoseBox");
  const parentWebcamElem = document.getElementById("parentWebcamBox");

  const loaderElem = document.getElementById("loaderBox");
  const fpsElem = document.getElementById("fpsBox");
  const countElem = document.getElementById("countBox");
  const timerElem = document.getElementById("timerBox");
  const delayElem = document.getElementById("delayBox");
  const pauseBtnElem = document.getElementById("pauseBtn");
  const resumeBtnElem = document.getElementById("resumeBtn");
  const accessCamBtnElem = document.getElementById("accessCamBtn");

  const chooseWOElem = document.getElementById("chooseWOBox");
  const formChooseWOElem = document.getElementById("formChooseWOBox");
  const accessCamElem = document.getElementById("accessCamBox");
  const titleWOElem = document.getElementById("titleWOBox");
  const confidenceElem = document.getElementById("confidenceBox");
  const resultElem = document.getElementById("resultBox");
  const resultRepElem = document.getElementById("resultRepBox");
  const resultTitleElem = document.getElementById("resultTitleBox");
  const resultOKBtnElem = document.getElementById("resultOKBtn");
  const uploadVideoBtnElem = document.getElementById("uploadVideoBtn");
  const goWebcamBtnElem = document.getElementById("goWebcamBtn");

  const settingsBtnElem = document.getElementById("settingsBtn");
  const settingsElem = document.getElementById("settingsBox");
  const saveSettingsBtnElem = document.getElementById("saveSettingsBtn");
  const cancelSettingsBtnElem = document.getElementById("cancelSettingsBtn");
  const segSettingsWOBtnElem = document.getElementById("segSettingsWOBtn");
  const segSettingsAdvBtnElem = document.getElementById("segSettingsAdvBtn");
  const bodySettingsWOElem = document.getElementById("bodySettingsWOBox");
  const bodySettingsAdvElem = document.getElementById("bodySettingsAdvBox");

  const helpElem = document.getElementById("helpBox");
  const helpBtnElem = document.getElementById("helpBtn");
  const segHowToUseBtnElem = document.getElementById("segHowToUseBtn");
  const segAboutBtnElem = document.getElementById("segAboutBtn");
  const bodyHowToUseElem = document.getElementById("bodyHowToUseBox");
  const bodyAboutElem = document.getElementById("bodyAboutBox");
  const helpOKBtnElem = document.getElementById("helpOKBtn");

  const dismissalBtnElem = document.getElementById("dismissalBtn");
  const dismissalElem = document.getElementById("dismissalBox");
  const dismissalOKBtnElem = document.getElementById("dismissalOKBtn");
  const dismissalcancelBtnElem = document.getElementById("canceldismissalBtn");

  const developerModeElem = document.getElementById("developerModeBox");
  const imgDirectionSignElem = document.getElementById("imgDirectionSignBox");
  const goAdviceBtnElem = document.getElementById("goAdviceBtn");
  const adviceWrapElem = document.getElementById("adviceWrapBox");
  const sliderAdviceElem = document.getElementById("sliderAdviceBox");
  const sliderCameraElem = document.getElementById("sliderCameraBox");
  const recordKeypointsBtnElem = document.getElementById("recordKeypointsBtn");
  const pingRecordElem = document.getElementById("pingRecordBox");
  const restartBtnElem = document.getElementById("restartBtn");

  let isFirstPlay = true;
  let isWebcamSecPlay = false;
  let widthRealVideo = 640;
  let heightRealVideo = 360;
  let widthResult = 0;
  let heightResult = 0;
  const KNOWN_RATIOS = [
    { h: 9, w: 16, name: "landscape" },  //Phone rate
    { h: 4, w: 3, name: "portrait" }, //ipad rate
    { h: 23, w: 16, name: "young"}, //ipad-air rate
    { h: 19.5, w: 9, name: "pro"}, //ipad-pro rate
    { h: 3, w: 4, name: "air-hor"}, //ipad-air-hor rate
  ];

  const getClosestAspectRatio = (width, height) => {
    let minDifference = Infinity;
    let closestRatio = null;

    for (const ratio of KNOWN_RATIOS) {
      const difference = Math.abs((width / height) - (ratio.w / ratio.h));
      if (difference < minDifference) {
        minDifference = difference;
        closestRatio = ratio;
      }
    }  return closestRatio;
  };

  const WOPose = new PoseHandler(webcamElem, cnvPoseElem);
  const WOTimer = new TimerHandler();
  const WOScore = new ScoreHandler();
  const WOSettings = new SettingsHandler();

  WOPose.additionalElem = {
    fpsElem,
    countElem,
    adviceWrapElem,
    confidenceElem,
    imgDirectionSignElem,
  };

  // eslint-disable-next-line no-underscore-dangle
  WOPose.camHandler._addVideoConfig = {
    width: widthRealVideo,
    height: heightRealVideo,
  };
 
  const resizeHandler = () => {
    const browserWidth = window.innerWidth;
    const browserHeight = window.innerHeight;
    let widthResult = 0;
    let heightResult = 0;
    const closestRatio = getClosestAspectRatio(browserWidth, browserHeight);

    if (browserWidth > browserHeight) {
      if (browserWidth / browserHeight < 16 / 9) {
        widthResult = browserWidth > 1280 ? 1280 : browserWidth;
        heightResult = Math.floor(widthResult * (9 / 16));
      }
      else {
        heightResult = browserHeight > 720 ? 720 : browserHeight;
        widthResult = Math.floor(heightResult * (16 / 9));
      }
      WOPose.scaler = {
        w: widthResult / widthRealVideo,
        h: heightResult / heightRealVideo,
      };
    }
    else {
      if (browserHeight / browserWidth < 16 / 9) {
        heightResult = browserHeight > 1280 ? 1280 : browserHeight;
        widthResult = Math.floor(heightResult * (9 / 16));
      }
      else {
        widthResult = browserWidth > 720 ? 720 : browserWidth;
        heightResult = Math.floor(widthResult * (16 / 9));
      }
      WOPose.scaler = {
        w: widthResult / heightRealVideo,
        h: heightResult / widthRealVideo,
      };
    }

    parentWebcamElem.setAttribute(
      "style",
      `width:${widthResult}px;height:${heightResult}px`
    );

    for (let i = 0; i < parentWebcamElem.children.length; i += 1) {
      const element = parentWebcamElem.children[i];
      if (element.tagName === "CANVAS") {
        cnvPoseElem.width = widthResult;
        cnvPoseElem.height = heightResult;
      } else {
        element.style.width = `${widthResult}px`;
        element.style.height = `${heightResult}px`;
      }
    }

  };

  // First run to auto adjust screen
  resizeHandler();

  window.addEventListener("resize", () => {
    resizeHandler();
  });

  // Ask to get permission to access camera
  const getAccessCam = async () => {
    if (!webcamElem.paused && WOPose.isLoop) return;
    loaderElem.style.display = "flex";
    // Try get permission as well as stream
    await WOPose.camHandler
      .start()
      .then(() => {
        // Save settings if got access camera to use in future (reload)
        WOSettings.change({
          isAccessCamera: true,
        });
        loaderElem.style.display = "none";
        accessCamElem.style.display = "none";
      })
      .catch((err) => {
        console.log("Permission Denied: Webcam Access is Not Granted");
        console.error(err);
        // eslint-disable-next-line no-alert
        // alert("Webcam Access is Not Granted, Try to Refresh Page");
      });
  };

  accessCamBtnElem.addEventListener("click", async () => {
    await getAccessCam();
  });

  // Update and show current time
  const setCurrTime = () => {
    const currTime = WOTimer.getCurrTime();
    timerElem.innerHTML = `${`0${currTime.minutes}`.slice(
      -2
    )}:${`0${currTime.seconds}`.slice(-2)}`;
  };

  // Get configuration
  const setupChangeWO = async (path) => {
    await fetch(path)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTPS error${resp.status}`);
        }
        return resp.json();
      })
      .then(async (data) => {
        WOPose.counter.setup(data.rulesCountConfig);
        const title = `${data.rulesCountConfig.nameWorkout} - ${WOSettings.DBWOSettings.currDuration}`;
        postExerciseSelection(data.rulesCountConfig.nameWorkout, WOSettings.DBWOSettings.currDuration);
        titleWOElem.innerText = title;
        resultTitleElem.innerText = title;

        // Setup timer to first play
        WOTimer.remove();
        WOTimer.setup({
          interval: 1000,
          duration: WOPose.isVideoMode
            ? Math.floor(webcamElem.duration)
            : 60 * +WOSettings.DBWOSettings.currDuration.split(" ")[0],
          type: "DEC",
          firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
        });
        WOTimer.isFirstDelay = !WOPose.isVideoMode;
        setCurrTime();

        // Setup and load pose detector (movenet or other)
        await WOPose.setup(data.poseDetectorConfig)
          .then(() => {
            console.log("Detector Loaded");
          })
          .catch((e) => {
            console.error(e);
          });

        // Setup and load classifier (tfjs model)
        await WOPose.classifier
          .setup(data.classifierConfig, {
            width: widthRealVideo,
            height: heightRealVideo,
          })
          .then(async () => {
            console.log("Classifier Ready to Use");
            chooseWOElem.style.display = "none";
            if (WOSettings.DBWOSettings.isAccessCamera) {
              // It still try to get access (auto) to check if disabled
              if (!WOPose.isVideoMode) await getAccessCam();
            } else {
              loaderElem.style.display = "none";
              accessCamElem.style.display = "flex";
            }
          })
          .catch((e) => {
            console.error(e);
          });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const chooseWOmodel = async() => {
    // Get the sub-route from the URL
    const subRoute = window.location.href.split('/player?')[1];
    const quests = subRoute.split('&');
    const exerciseName = quests[0].split('=')[1];
    const exerciseDuration = quests[1].split('=')[1];

    WOSettings.DBWOSettings.currDuration = exerciseDuration;
  await setupChangeWO(`./rules/${exerciseName}.json`);
  };

  await chooseWOmodel();

  helpBtnElem.addEventListener("click", () => {
    helpElem.style.display = "flex";
  });

  helpOKBtnElem.addEventListener("click", () => {
    helpElem.style.display = "none";
  });

  segHowToUseBtnElem.addEventListener("click", () => {
    if (bodyHowToUseElem.style.display !== "none") return;
    bodyAboutElem.style.display = "none";
    bodyHowToUseElem.style.display = "flex";
    segAboutBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segAboutBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segHowToUseBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segHowToUseBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  segAboutBtnElem.addEventListener("click", () => {
    if (bodyAboutElem.style.display !== "none") return;
    bodyHowToUseElem.style.display = "none";
    bodyAboutElem.style.display = "flex";
    segHowToUseBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segHowToUseBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segAboutBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segAboutBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  restartBtnElem.addEventListener("click", () => {
    loaderElem.style.display = "flex";
    delayElem.innerText = "";

    WOTimer.setup({
      interval: 1000,
      duration: WOPose.isVideoMode
        ? Math.floor(webcamElem.duration)
        : 60 * +WOSettings.DBWOSettings.currDuration.split(" ")[0],
      type: "DEC",
      firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
    });

    WOPose.counter.resetCount();
    countElem.innerText = "0";

    WOTimer.isFirstDelay = !WOPose.isVideoMode;
    if (WOPose.isVideoMode && webcamElem.currentTime !== 0) {
      webcamElem.currentTime = 0;
      webcamElem.load();
    }

    setCurrTime();
    WOTimer.pause();
    webcamElem.pause();
    WOPose.isLoop = false;
    isFirstPlay = true;
    isWebcamSecPlay = true;
    WOPose.counter.lastStage = {};
    WOPose.counter.nextStage = {};

    // Clear screen
    imgDirectionSignElem.style.display = "none";
    adviceWrapElem.style.display = "none";
    resumeBtnElem.style.display = "flex";
    restartBtnElem.style.display = "none";
    pauseBtnElem.style.display = "none";
    loaderElem.style.display = "none";
  });

  recordKeypointsBtnElem.addEventListener("click", () => {
    // Toggler for start and stop extract keypoints each frame
    WOPose.isExtractKeypoints = !WOPose.isExtractKeypoints;
    if (WOPose.isExtractKeypoints) {
      pingRecordElem.classList.remove("bg-gray-500");
      pingRecordElem.classList.add("bg-red-500");
      pingRecordElem.children[0].style.display = "block";
    } else {
      pingRecordElem.classList.remove("bg-red-500");
      pingRecordElem.classList.add("bg-gray-500");
      pingRecordElem.children[0].style.display = "none";
      WOPose.DBHandler.saveToCSV();
    }
  });

  segSettingsWOBtnElem.addEventListener("click", () => {
    // Show body settings (choose WO) element
    if (bodySettingsWOElem.style.display !== "none") return;
    bodySettingsAdvElem.style.display = "none";
    bodySettingsWOElem.style.display = "block";
    segSettingsAdvBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segSettingsAdvBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segSettingsWOBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segSettingsWOBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  segSettingsAdvBtnElem.addEventListener("click", () => {
    // Show body advance settings element
    if (bodySettingsAdvElem.style.display !== "none") return;
    bodySettingsWOElem.style.display = "none";
    bodySettingsAdvElem.style.display = "block";
    segSettingsWOBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segSettingsWOBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segSettingsAdvBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segSettingsAdvBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  settingsBtnElem.addEventListener("click", () => {
    // Show modal / pop up settings element (choose WO & advance settings)
    settingsElem.style.display = "flex";
    // Get and show current settings
    document.querySelector(
      `input[value="${WOSettings.DBWOSettings.currWorkout}"][name="settingsNameWO"]`
    ).checked = true;
    document.querySelector(
      `input[value="${WOSettings.DBWOSettings.currDuration}"][name="settingsDurationWO"]`
    ).checked = true;
    document.querySelector('input[name="settingsAEBox"]').checked =
      WOSettings.DBWOSettings.isAudioEffect !== undefined
        ? WOSettings.DBWOSettings.isAudioEffect
        : true; // Default setting Audio Effect
    document.querySelector('input[name="settingsFSBox"]').checked =
      WOSettings.DBWOSettings.isFullscreen !== undefined
        ? WOSettings.DBWOSettings.isFullscreen
        : false; // Default setting Full Screen
    document.querySelector('input[name="settingsFCBox"]').checked =
      WOSettings.DBWOSettings.isFlipCamera !== undefined
        ? WOSettings.DBWOSettings.isFlipCamera
        : false; // Default setting Flip Camera
    document.querySelector('input[name="settingsDSBox"]').checked =
      WOSettings.DBWOSettings.isDirectionSign !== undefined
        ? WOSettings.DBWOSettings.isDirectionSign
        : true; // Default setting Direction Sign
    document.querySelector('input[name="settingsDMBox"]').checked =
      WOSettings.DBWOSettings.isDeveloperMode !== undefined
        ? WOSettings.DBWOSettings.isDeveloperMode
        : false; // Default setting Developer Mode
  });

  const actionSettings = {
    currWorkoutDuration: async (data) => {
      loaderElem.style.display = "flex";
      delayElem.innerText = "";
      webcamElem.pause();
      WOPose.isLoop = false;
      isFirstPlay = true;
      isWebcamSecPlay = true;
      WOPose.counter.lastStage = {};
      WOPose.counter.nextStage = {};

      if (data.durationWO.isChange) {
        WOTimer.setup({
          interval: 1000,
          duration: WOPose.isVideoMode
            ? Math.floor(webcamElem.duration)
            : 60 * +data.durationWO.value.split(" ")[0],
          type: "DEC",
          firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
        });

        setCurrTime();
        const title = `${WOPose.counter.rules.nameWorkout} - ${data.durationWO.value}`;
        titleWOElem.innerText = title;
        resultTitleElem.innerText = title;
      }
      if (data.nameWO.isChange) {
        await setupChangeWO(`./rules/${data.nameWO.value}.json`);
      }

      WOTimer.isFirstDelay = !WOPose.isVideoMode;
      if (WOPose.isVideoMode && webcamElem.currentTime !== 0) {
        webcamElem.currentTime = 0;
        webcamElem.load();
      }

      WOTimer.pause();
      // Clear screen
      imgDirectionSignElem.style.display = "none";
      adviceWrapElem.style.display = "none";
      resumeBtnElem.style.display = "flex";
      restartBtnElem.style.display = "none";
      pauseBtnElem.style.display = "none";
      loaderElem.style.display = "none";
    },
    isAudioEffect: (data) => {
      WOPose.counter.isPlayAudStage = data;
      WOTimer.isPlayAudTimer = data;
    },
    isFullscreen: (data) => {
      if (data && !document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (
        !data &&
        document.exitFullscreen &&
        document.fullscreenElement
      ) {
        document.exitFullscreen();
      }
    },
    isFlipCamera: (data) => {
      // Default (user for webcam) and auto change to "environment" if video
      const facingMode = data ? "environment" : "user";
      WOPose.camHandler.flip(facingMode);
    },
    isDirectionSign: (data) => {
      // Toggler to show direction sign
      WOPose.isShowDirectionSign = data;
      if (WOPose.isClassify) {
        imgDirectionSignElem.style.display = data ? "block" : "none";
      }
    },
    isDeveloperMode: (data) => {
      // Toggler to show developer mode element
      developerModeElem.style.display = data ? "flex" : "none";
    },
  };

  saveSettingsBtnElem.addEventListener("click", () => {
    // Get newest data settings
    const currWorkout = document.querySelector(
      'input[name="settingsNameWO"]:checked'
    ).value;
    const currDuration = document.querySelector(
      'input[name="settingsDurationWO"]:checked'
    ).value;
    const isAudioEffect = document.querySelector(
      'input[name="settingsAEBox"]'
    ).checked;
    const isFullscreen = document.querySelector(
      'input[name="settingsFSBox"]'
    ).checked;
    const isFlipCamera = document.querySelector(
      'input[name="settingsFCBox"]'
    ).checked;
    const isDirectionSign = document.querySelector(
      'input[name="settingsDSBox"]'
    ).checked;
    const isDeveloperMode = document.querySelector(
      'input[name="settingsDMBox"]'
    ).checked;

    // Send newest settings to check and get change
    WOSettings.change(
      {
        currWorkout,
        currDuration,
        isAudioEffect,
        isFullscreen,
        isFlipCamera,
        isDirectionSign,
        isDeveloperMode,
      },
      actionSettings
    );
    settingsElem.style.display = "none";
  });

  cancelSettingsBtnElem.addEventListener("click", () => {
    settingsElem.style.display = "none";
  });

  // Just for initial (once run)
  // It will be remove when replaced by new webcamElem
  // Check: uploadVideoBtnElem
  webcamElem.addEventListener("loadeddata", () => {
    
    if (!WOPose.isVideoMode) {
      if (WOPose.isClassify) {
        WOPose.isClassify = false;
      }
      WOPose.isLoop = true;
      sliderCameraElem.checked = true;
      if (isWebcamSecPlay) {
        isWebcamSecPlay = false;
      }
      delayElem.innerText = "";
      WOTimer.pause();
      WOPose.counter.resetCount();
      WOPose.drawPose();
    }
  });

  // Callback to update and show delay time
  const delayCB = (time) => {
    delayElem.innerText = time;
  };
  // Callback when delay time is finished
  const finishDelayCB = () => {
    delayElem.innerText = "";
  };
  // Callback to update and show current time
  const timerCB = (time) => {
    timerElem.innerText = `${`0${time.minutes}`.slice(
      -2
    )}:${`0${time.seconds}`.slice(-2)}`;
  };
  // Callback when timer is finished
  const finishTimerCB = async () => {
    // Only save when not video mode
    if (!WOPose.isVideoMode) {
      WOScore.addNewData({
        id: +new Date(),
        nameWorkout: WOPose.counter.rules.nameWorkout,
        duration: WOSettings.DBWOSettings.currDuration,
        repetition: WOPose.counter.count,
        date: new Date().toLocaleString(),
      });
    }
    setCurrTime();
    WOTimer.isFirstDelay = !WOPose.isVideoMode;
    resultRepElem.innerText = WOPose.counter.count;
    WOTimer.start(delayCB, finishDelayCB, timerCB, finishTimerCB);
    WOTimer.pause();
    webcamElem.pause();
    
    //summary
    jsonSummary = {
        nameWorkout: WOPose.counter.rules.nameWorkout,
        duration: WOSettings.DBWOSettings.currDuration,
        repetition: WOPose.counter.count,
        date: new Date().toLocaleString()
    };

    try {
    //send summary to server
    const response = await fetch(`https://airehab.sbmi.uth.edu:3000/api/summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonSummary)
    });
    const receiveddata = await response.json();
    // Extract the summary from the response data
    const receivedSummary = receiveddata.summary;
    // Handle the response data here if necessary
    } catch (error) {
        console.error("Error sending data to server:", error);
    }


    isFirstPlay = true;
    WOPose.isLoop = false;
    WOPose.counter.resetCount();
    WOPose.counter.lastStage = {};
    WOPose.counter.nextStage = {};
    resultElem.style.display = "flex";
    resumeBtnElem.style.display = "flex";
    restartBtnElem.style.display = "none";
    pauseBtnElem.style.display = "none";
    imgDirectionSignElem.style.display = "none";
    adviceWrapElem.style.display = "none";

    const fullURL = window.location.href;
    const newfinishedURL = fullURL + '/workoutSuccess';
    window.history.pushState({ path: newfinishedURL }, '', newfinishedURL);
  };

  // Fired when timer is finished and try to restart with OK btn
  resultOKBtnElem.addEventListener("click", () => {
    resultElem.style.display = "none";
    if (isFirstPlay && WOPose.isVideoMode) {
      webcamElem.pause();
      webcamElem.currentTime = 0;
      webcamElem.load();
    } else {
      WOTimer.reset();
      setCurrTime();
    }
  });

  // Pause webcam or video
  pauseBtnElem.addEventListener("click", () => {
    WOTimer.pause();
    webcamElem.pause();
    WOPose.isLoop = false;
    resumeBtnElem.style.display = "flex";
    restartBtnElem.style.display = "flex";
    pauseBtnElem.style.display = "none";

    if (!janusVideoRoomHandle) {
      console.error("Janus VideoRoom handle not available.");
      return;
    }

    const unpublish = {
        request: "unpublish"
    };
    janusVideoRoomHandle.send({
        message: unpublish,
        success: function(response) {
            console.log("Stream paused successfully!");
        },
        error: function(error) {
            console.error("Error pausing the stream:", error);
        }
    });

  });

  // Play or resume button for video and webcam
  resumeBtnElem.addEventListener("click", () => {
    if (!isFirstPlay && !webcamElem.paused && WOPose.isLoop) return;
    pauseBtnElem.style.display = "flex";
    restartBtnElem.style.display = "none";
    resumeBtnElem.style.display = "none";
    const firstPlay = isFirstPlay;

    if (isFirstPlay) {
      isFirstPlay = false;
      WOPose.isClassify = true;
      WOTimer.start(delayCB, finishDelayCB, timerCB, finishTimerCB);
    }

    WOTimer.resume();
    WOPose.isLoop = true;

    if (!janusVideoRoomHandle) {
      console.error("Janus VideoRoom handle not available.");
      return;
  }

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
      // Display the local video stream on a video element in the webpage

      /* webcamBox.play(); */

      janusVideoRoomHandle.createOffer({
          media: { audioSend: true, videoSend: true },
          stream: stream,
          success: function(jsep) {
              const publish = {
                  request: "publish",
                  audio: true,
                  video: true
              };
              janusVideoRoomHandle.send({
                  message: publish,
                  jsep: jsep
              });
          },
          error: function(error) {
              console.error("WebRTC error:", error);
          }
      });
  })
  .catch(error => {
      console.error('Could not get user media', error);
  });

  janusVideoRoomHandle.onmessage = function(msg, jsep) {
      if(jsep) {
          janusVideoRoomHandle.handleRemoteJsep({ jsep: jsep });
      }
  };

  if (!isWebcamSecPlay && firstPlay && !WOPose.isVideoMode) {
        console.log("It run?");
        isWebcamSecPlay = true;
        // Return to stop redraw again (first play)
        return;
      }
      
  WOPose.drawPose();
  });

  uploadVideoBtnElem.addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) {
      // Stop webcam first before replace with video
      WOPose.camHandler.stop();
      WOPose.isClassify = true;
      WOPose.isLoop = false;
      WOPose.isVideoMode = true;
      webcamElem.pause();
      // Remove current webcamElem to fix error pose detector
      // during transition source webcam to video (it's async, not directly changing)
      webcamElem.remove();

      const newWebcamElem = document.createElement("video");
      newWebcamElem.setAttribute("id", "webcamBox");
      newWebcamElem.setAttribute("class", "bg-gray-200 z-10");
      newWebcamElem.setAttribute(
        "style",
        `width: ${widthResult}px; height: ${heightResult}px`
      );
      newWebcamElem.muted = true;

      parentWebcamElem.insertBefore(newWebcamElem, parentWebcamElem.firstChild);

      newWebcamElem.setAttribute(
        "src",
        URL.createObjectURL(event.target.files[0])
      );
      newWebcamElem.load();
      newWebcamElem.play();
      // When first time upload video, the facingMode is always "environment"
      // So we need to flip true ("environment" mode) to draw canvas properly
      WOSettings.change(
        { isFlipCamera: true },
        { isFlipCamera: actionSettings.isFlipCamera }
      );

      newWebcamElem.addEventListener("loadeddata", () => {
        if (WOPose.isVideoMode) {
          webcamElem = newWebcamElem;
          WOPose.webcamElem = newWebcamElem;
          // This is for prepare when to switch to webcam again
          // eslint-disable-next-line no-underscore-dangle
          WOPose.camHandler._webcamElement = newWebcamElem;
        }
        WOPose.counter.resetCount();
        countElem.innerText = "0";
        delayElem.innerText = "";
        WOTimer.setup({
          interval: 1000,
          duration: WOPose.isVideoMode
            ? Math.floor(webcamElem.duration)
            : 60 * +WOSettings.DBWOSettings.currDuration.split(" ")[0],
          type: "DEC",
          firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
        });
        WOTimer.isFirstDelay = !WOPose.isVideoMode;
        WOTimer.pause();
        setCurrTime();
        webcamElem.pause();
        WOPose.counter.lastStage = {};
        WOPose.counter.nextStage = {};
        if (widthRealVideo !== 0 && WOPose.isVideoMode) {
          heightRealVideo = newWebcamElem.videoHeight;
          widthRealVideo = newWebcamElem.videoWidth;
        }
        WOPose.scaler = {
          w: widthResult / widthRealVideo,
          h: heightResult / heightRealVideo,
        };
        WOPose.classifier.stdConfig = {
          width: widthRealVideo,
          height: heightRealVideo,
        };
        resumeBtnElem.style.display = "flex";
        restartBtnElem.style.display = "none";
        pauseBtnElem.style.display = "none";
        imgDirectionSignElem.style.display = "none";
        adviceWrapElem.style.display = "none";
        sliderCameraElem.checked = !WOPose.isVideoMode;
      });
    }
  });

  // Advice auto show when classifier is running
  goAdviceBtnElem.addEventListener("click", (event) => {
    event.preventDefault();
    WOPose.isShowAdvice = !WOPose.isShowAdvice;
    sliderAdviceElem.checked = WOPose.isShowAdvice;
    if (WOPose.isClassify) {
      adviceWrapElem.style.display = WOPose.isShowAdvice ? "flex" : "none";
    }
  });

  goWebcamBtnElem.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!WOPose.isVideoMode) return;
    widthRealVideo = 640;
    heightRealVideo = 360;
    // Constraint settings for webcam
    // eslint-disable-next-line no-underscore-dangle
    WOPose.camHandler._addVideoConfig = {
      width: widthRealVideo,
      height: heightRealVideo,
    };
    WOPose.classifier.stdConfig = {
      width: widthRealVideo,
      height: heightRealVideo,
    };
    WOPose.isLoop = false;
    isWebcamSecPlay = true;
    sliderCameraElem.checked = true;
    WOPose.isVideoMode = false;
    await WOPose.camHandler.start();

  });
  console.log("Hello World!");

  dismissalBtnElem.addEventListener("click", () => {
    dismissalElem.style.display = "flex";
    const fullURL = window.location.href;
    const leavingURL = fullURL + '/leaving';
    window.history.pushState({ path: leavingURL }, '', leavingURL);
  });
  
  dismissalOKBtnElem.addEventListener("click", () => {
    document.body.style.display = 'none';    
    const fullURL = window.location.href;
    const leftURL = fullURL.slice(0, -8) + '/left';
    window.history.pushState({ path: leftURL }, '', leftURL);
  });

  dismissalcancelBtnElem.addEventListener("click", () => {
    dismissalElem.style.display = "none";    
    const fullURL = window.location.href;
    const cancelURL = fullURL.slice(0, -8);
    window.history.pushState({ path: cancelURL }, '', cancelURL);
  });
});


