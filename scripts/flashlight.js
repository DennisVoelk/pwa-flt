var flashlight = require("nativescript-flashlight");

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
  .catch(
    (err) =>
      (document.getElementById("errors").innerHTML +=
        "getUserMedia(): " + err + "<br>--------------------------<br>")
  );

function setTorch(value) {
  /*try{
    if (track.getCapabilities().torch) {
      track
        .applyConstraints({
          advanced: [{ torch: value }],
        })
        .catch((e) => console.log(e));
    }
  }catch(err){
    document.getElementById("errors").innerHTML += "setTorch(): " + err + "<br>--------------------------<br>"
  }*/

  try {
    if (flashlight.isAvailable()) {
      if(value == true){
        flashlight.on();
      }else{
        flashlight.off();
      }
    } else {
      alert("A flashlight is not available on your device.");
    }
  } catch (err) {
    document.getElementById("errors").innerHTML +=
      "setTorch(): " + err + "<br>--------------------------<br>";
  }
}

function toggleTorch() {
  try {
    if (track.getCapabilities().torch) {
      track
        .applyConstraints({
          advanced: [{ torch: !track.getConstraints()["torch"] }],
        })
        .catch((e) => console.log(e));
    }
  } catch (err) {
    document.getElementById("errors").innerHTML +=
      "toggleTorch(): " + err + "<br>--------------------------<br>";
  }
}
