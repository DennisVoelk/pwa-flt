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
  .catch((err) => document.getElementById("errors").innerHTML += "getUserMedia(): " + err + "<br>--------------------------<br>");

function setTorch(value) {
  try{
    if (track.getCapabilities().torch) {
      track
        .applyConstraints({
          facingMode: "environment",
          advanced: [{ torch: value }],
        })
        .catch((e) => console.log(e));
    }
  }catch(err){
    document.getElementById("errors").innerHTML += "setTorch(): " + err + "<br>--------------------------<br>"
  }
  
}

function toggleTorch() {
    try{
      if (track.getCapabilities().torch) {
        track
          .applyConstraints({
            facingMode: "environment",
            advanced: [{ torch: !track.getConstraints()["torch"] }],
          })
          .catch((e) => console.log(e));
      }
    }catch(err){
      document.getElementById("errors").innerHTML += "toggleTorch(): " + err + "<br>--------------------------<br>"
    }
  }
