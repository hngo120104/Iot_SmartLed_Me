import React, { useState, useRef } from "react";
import toWav from "audiobuffer-to-wav";
export default function App() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    chunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new AudioContext({ sampleRate: 16000 }); // ✅ ép 16kHz
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // ✅ chuyển sang WAV PCM
      const wavBuffer = toWav(audioBuffer);
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(wavBlob);
      setAudioURL(url);

      // Gửi sang BE
      const formData = new FormData();
      formData.append("file", wavBlob, "recording.wav");
      try {
        const response = await fetch("http://localhost:8080/api/audio/upload", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          console.log("Upload thành công");
        } else {
          console.error("Upload thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi upload:", error);
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Ghi âm WAV PCM 16kHz</h2>
      {!recording ? (
        <button onClick={startRecording}>Bắt đầu ghi âm</button>
      ) : (
        <button onClick={stopRecording}>Dừng ghi âm</button>
      )}

      {audioURL && <audio src={audioURL} controls />}
    </div>
  );
}