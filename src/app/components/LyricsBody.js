"use client";
import React, { useMemo, useState } from "react";
import parseLyrics from "./parser";
import speechToTextUtils from "../utility_transcribe";

export default function LyricsBody({
  lyrics,
  currentWord,
  setNewWord,
  handleRecognizedWord,
}) {
  const [transcribedData, setTranscribedData] = useState([]);
  const [interimTranscribedData, setInterimTranscribedData] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const segments = useMemo(
    () => parseLyrics(lyrics, currentWord, setNewWord),
    [lyrics, currentWord, setNewWord]
  );

  function flushInterimData() {
    if (interimTranscribedData !== "") {
      setInterimTranscribedData("");
      setTranscribedData((oldData) => [...oldData, interimTranscribedData]);
    }
  }

  function handleDataReceived(data, isFinal) {
    console.log("Data received:", data);
    console.log("Is final:", isFinal);

    if (isFinal) {
      setInterimTranscribedData("");
      setTranscribedData((oldData) => [...oldData, data]);
      if (data) {
        console.log("Final transcription received:", data);
        handleRecognizedWord(data); // Use data directly
      }
    } else {
      setInterimTranscribedData(data);
      if (data) {
        console.log("Interim transcription received:", data);
        handleRecognizedWord(data); // Process interim results
      }
    }
  }

  function getTranscriptionConfig() {
    return {
      audio: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
      interimResults: true,
    };
  }

  function onStart() {
    setTranscribedData([]);
    setIsRecording(true);
    console.log("Starting transcription...");

    speechToTextUtils.initRecording(
      getTranscriptionConfig(),
      handleDataReceived,
      (error) => {
        console.error("Error when transcribing", error);
        setIsRecording(false);
        // No further action needed, as stream already closes itself on error
      }
    );
  }

  function onStop() {
    setIsRecording(false);
    flushInterimData(); // A safety net if Google's Speech API doesn't work as expected, i.e. always sends the final result
    speechToTextUtils.stopRecording();
    console.log("Stopping transcription...");
  }

  return (
    <div
      style={{
        padding: "0.5rem",
        borderRadius: "1.5rem",
        borderWidth: "4px",
        borderStyle: "dashed",
        width: "100%",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button onClick={onStart} style={{ marginRight: "1rem" }}>
          Start
        </button>
        <button onClick={onStop}>Stop</button>
      </div>
      <p
        style={{
          overflowY: "auto",
          height: "20rem",
          fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
          fontSize: "1.875rem",
          lineHeight: ["2.25rem", 2],
          textAlign: "center",
          whiteSpace: "pre-wrap",
        }}
      >
        {segments}
      </p>
    </div>
  );
}
