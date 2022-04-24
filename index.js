import { Heartbeat } from "./heartbeat.js";

const OPENCV_URI = "https://docs.opencv.org/master/opencv.js";
const HAARCASCADE_URI = "haarcascade_frontalface_alt.xml";
let body = document.getElementsByTagName("body")[0];
let startBtnEl = document.getElementById("startBtn");
let statusContainerEl = document.getElementById("statusContainer");
let videoContainer = document.getElementById("videoContent");

let demo = new Heartbeat(
  "webcam",
  "canvas",
  HAARCASCADE_URI,
  30,
  6,
  250,
  () => {
    let btnContainer = document.getElementsByClassName("btnContainer")[0];
    let buttonEl = document.createElement("button");
    buttonEl.textContent = "Get Results";
    buttonEl.className = "btn orange wave";
    buttonEl.onclick = () => {
      stop();
      demo.stop();
      console.log(demo.freqValues);

      // SEE: Drawing Chart
      let dataChartEl = document.getElementById("dataChart");
      let freqChartEl = document.getElementById("freqChart");

      // Frequency Chart
      new Chart(freqChartEl, {
        type: "line",
        data: {
          labels: demo.freqValues.map((freq) => {
            let date = new Date(freq.timestamp);
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
          }),
          datasets: [
            {
              borderColor: "#3f51b5",
              borderWidth: 1,
              lineTension: 0,
              fill: false,
              label: `Maximum Frequency`,
              data: demo.freqValues.map((freq) => freq.maxValue),
            },
            {
              borderColor: "#f44336",
              borderWidth: 1,
              lineTension: 0,
              fill: false,
              label: `Minimum Frequency`,
              data: demo.freqValues.map((freq) => freq.minValue),
            },
          ],
        },
      });

      // BPM Chart
      new Chart(dataChartEl, {
        type: "line",
        data: {
          labels: demo.totalBPMValues.map((bpm) => {
            let date = new Date(bpm.timestamp);
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
          }),
          datasets: [
            {
              borderColor: "#3cba9f",
              borderWidth: 1,
              lineTension: 0,
              fill: false,
              label: `BPM (reading taken on ${new Date()})`,
              data: demo.totalBPMValues.map((bpm) => bpm.bpm),
            },
          ],
        },
      });

      // Removing all the buttons
      startBtnEl.parentNode.removeChild(startBtnEl);
      buttonEl.parentNode.removeChild(buttonEl);

      let totalBPMValues = demo.totalBPMValues;
      let average = 0;
      totalBPMValues.forEach((bpm) => {
        average += bpm.bpm;
      });
      average = average / totalBPMValues.length;
      console.log(average);

      // SEE: Displaying Average BPM
      let displayAverage = document.createElement("H3");
      displayAverage.innerText = `The Average BPM is - ${parseInt(average)}`;
      displayAverage.className = "heading";

      // SEE: Creating reload button
      let containerDiv = document.createElement("div");
      containerDiv.className = "heading";

      let reloadButton = document.createElement("button");
      reloadButton.innerText = "ReTake";
      reloadButton.className = "btn purple wave";
      reloadButton.addEventListener("click", () => {
        location.reload();
      });

      containerDiv.appendChild(reloadButton);

      // SEE: Appending Average BPM and reload button
      body.appendChild(displayAverage);
      body.appendChild(containerDiv);
    };

    btnContainer.appendChild(buttonEl);
  }
);

function loading() {
  statusContainerEl.innerHTML =
    "Loading Scripts, this might take a few seconds. Remember patience is a great virtue.";
}

function loaded() {
  statusContainerEl.innerHTML = "";
}

function stop() {
  videoContainer.style.display = "none";
}

function createGetResultsButton() {}

// Load opencv when needed
async function loadOpenCv(uri) {
  return new Promise(function (resolve, reject) {
    console.log("starting to load opencv");
    var tag = document.createElement("script");
    tag.src = uri;
    tag.async = true;
    tag.type = "text/javascript";
    tag.onload = () => {
      cv["onRuntimeInitialized"] = () => {
        console.log("opencv ready");
        loaded();
        resolve();
      };
    };
    tag.onerror = () => {
      throw new URIError("opencv didn't load correctly.");
    };
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  });
}

function startThings() {
  var ready = loadOpenCv(OPENCV_URI);
  ready.then(function () {
    demo.init();
  });
}

startBtnEl.onclick = () => {
  loading();
  startThings();
  startBtnEl.setAttribute("disabled", "true");
};
