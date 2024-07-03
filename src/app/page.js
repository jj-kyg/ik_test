"use client";
import React, { useState, useEffect } from "react";
import LyricsBody from "./components/LyricsBody";
import styles from "./page.module.css";

export default function Home() {
  const [lyrics, setLyrics] = useState(
    "Heartbeat, in the heat, of the night,Sound so sweet, in the street, we're alight.Neon dreams, in the streams, of the dance,In this trance, we advance, take a chance."
  );
  const [currentWord, setCurrentWord] = useState(0);
  const [newWord, setNewWord] = useState(-1);
  const [globalIndex, setGlobalIndex] = useState(0); // Track the global index

  useEffect(() => {
    console.log("Current word index updated:", currentWord);
  }, [currentWord]);

  // Function to handle recognized speech
  const handleRecognizedWord = (recognizedText) => {
    if (!recognizedText) return;

    console.log("Recognized text:", recognizedText);
    const recognizedWords = recognizedText.trim().toLowerCase().split(/\s+/);

    // Only consider words after the globalIndex
    const words = [...lyrics.matchAll(/[\w']+/g)].map((match, index) => ({
      word: match[0].toLowerCase(),
      index: index,
    }));

    recognizedWords.forEach((word) => {
      const nextWord = words.slice(globalIndex).find((w) => w.word === word);
      if (nextWord) {
        const wordIndex = nextWord.index;
        console.log("Matching word index for:", word, "is", wordIndex);
        if (wordIndex !== -1) {
          setCurrentWord(wordIndex);
          setGlobalIndex(wordIndex + 1); // Update the global index to move forward
        }
      }
    });
  };

  return (
    <main className={styles.main}>
      <LyricsBody
        lyrics={lyrics}
        currentWord={currentWord}
        setCurrentWord={setCurrentWord}
        setNewWord={setNewWord}
        handleRecognizedWord={handleRecognizedWord}
      />
    </main>
  );
}
