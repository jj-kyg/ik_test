import io from "socket.io-client";

const socket = io("https://localhost:3000", {
  transports: ["websocket", "polling"],
  upgrade: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
});

socket.on("connect", () => {
  console.log("[INFO] Connected to server");
});

socket.on("connect_error", (error) => {
  console.error("[ERROR] Connection error:", error);
});

socket.on("disconnect", () => {
  console.log("[INFO] Disconnected from server");
});

// Stream Audio
let bufferSize = 2048,
  AudioContext,
  context,
  processor,
  input,
  globalStream;

const mediaConstraints = {
  audio: true,
  video: false,
};

let AudioStreamer = {
  initRecording: function (transcribeConfig, onData, onError) {
    socket.emit("startGoogleCloudStream", { ...transcribeConfig });
    AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    processor = context.createScriptProcessor(bufferSize, 1, 1);
    processor.connect(context.destination);
    context.resume();

    const handleSuccess = function (stream) {
      globalStream = stream;
      input = context.createMediaStreamSource(stream);
      input.connect(processor);

      processor.onaudioprocess = function (e) {
        microphoneProcess(e);
      };
    };

    navigator.mediaDevices.getUserMedia(mediaConstraints).then(handleSuccess);

    if (onData) {
      socket.on("speechData", (response) => {
        console.log("[INFO] Speech data received:", response);
        onData(response.data, response.isFinal);
      });
    }

    socket.on("googleCloudStreamError", (error) => {
      console.error("[ERROR] Google Cloud Stream Error:", error);
      if (onError) {
        onError("error");
      }
      closeAll();
    });

    socket.on("endGoogleCloudStream", () => {
      console.log("[INFO] Google Cloud Stream ended");
      closeAll();
    });
  },

  stopRecording: function () {
    socket.emit("endGoogleCloudStream");
    closeAll();
  },
};

export default AudioStreamer;

// Helper functions
function microphoneProcess(e) {
  const left = e.inputBuffer.getChannelData(0);
  const left16 = convertFloat32ToInt16(left);
  socket.emit("binaryAudioData", left16);
}

function convertFloat32ToInt16(buffer) {
  let l = buffer.length;
  let buf = new Int16Array(l);

  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7fff;
  }
  return buf.buffer;
}

function closeAll() {
  socket.off("speechData");
  socket.off("googleCloudStreamError");
  let tracks = globalStream ? globalStream.getTracks() : null;
  let track = tracks ? tracks[0] : null;
  if (track) {
    track.stop();
  }

  if (processor) {
    if (input) {
      try {
        input.disconnect(processor);
      } catch (error) {
        console.warn("Attempt to disconnect input failed.");
      }
    }
    processor.disconnect(context.destination);
  }
  if (context) {
    context.close().then(function () {
      input = null;
      processor = null;
      context = null;
      AudioContext = null;
    });
  }
}
