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
  .catch((err) => document.getElementById("errors").innerHTML += "getUserMedia(): " + err + "\n--------------------------\n");

function setTorch(value) {
  try{
    if (track.getCapabilities().torch) {
      track
        .applyConstraints({
          advanced: [{ torch: value }],
        })
        .catch((e) => console.log(e));
    }
  }catch(err){
    document.getElementById("errors").innerHTML += "setTorch(): " + err + "\n--------------------------\n"
  }
  
}

function toggleTorch() {
    try{
      if (track.getCapabilities().torch) {
        track
          .applyConstraints({
            advanced: [{ torch: !track.getConstraints()["torch"] }],
          })
          .catch((e) => console.log(e));
      }
    }catch(err){
      document.getElementById("errors").innerHTML += "setTorch(): " + err + "\n--------------------------\n"
    }
  }
