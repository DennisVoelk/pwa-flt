var track;

navigator.mediaDevices
  .getUserMedia({
    video: {
      facingMode: "environment",
    },
  })
  .then((stream) => {
    // get the active track of the stream
    track = stream.getVideoTracks()[0];
  })
  .catch((err) => console.error("getUserMedia() failed: ", err));

function setTorch(value) {
  if (track.getCapabilities().torch) {
    track
      .applyConstraints({
        advanced: [{ torch: value }],
      })
      .catch((e) => console.log(e));
  }
}

function toggleTorch() {
    console.log("toggle")
    if (track.getCapabilities().torch) {
      track
        .applyConstraints({
          advanced: [{ torch: !track.getConstraints()["torch"] }],
        })
        .catch((e) => console.log(e));
    }
  }
