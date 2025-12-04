import { useState, useRef } from "react";
import Button from "./UI/Button";

const colorMap = {
  trắng: { r: 255, g: 255, b: 255 },
  đen: { r: 0, g: 0, b: 0 },
  xám: { r: 128, g: 128, b: 128 },
  "xám nhạt": { r: 211, g: 211, b: 211 },
  đỏ: { r: 255, g: 0, b: 0 },
  "đỏ thẫm": { r: 139, g: 0, b: 0 },
  hồng: { r: 255, g: 105, b: 180 },
  "hồng nhạt": { r: 255, g: 182, b: 193 },
  cam: { r: 255, g: 165, b: 0 },
  vàng: { r: 255, g: 255, b: 0 },
  "vàng nhạt": { r: 250, g: 250, b: 210 },
  nâu: { r: 165, g: 42, b: 42 },
  "nâu nhạt": { r: 210, g: 180, b: 140 },
  "xanh lá": { r: 0, g: 128, b: 0 },
  "xanh lá nhạt": { r: 144, g: 238, b: 144 },
  "xanh lục": { r: 34, g: 139, b: 34 },
  "xanh rêu": { r: 85, g: 107, b: 47 },
  "xanh dương": { r: 0, g: 0, b: 255 },
  "xanh da trời": { r: 135, g: 206, b: 235 },
  "xanh biển": { r: 30, g: 144, b: 255 },
  "xanh navy": { r: 0, g: 0, b: 128 },
  tím: { r: 128, g: 0, b: 128 },
  "tím nhạt": { r: 216, g: 191, b: 216 },
  "tím hoa cà": { r: 186, g: 85, b: 211 },
  "vàng chanh": { r: 154, g: 205, b: 50 },
  "ngọc lam": { r: 64, g: 224, b: 208 },
  bạc: { r: 192, g: 192, b: 192 },
  "vàng kim": { r: 255, g: 215, b: 0 },
};
const indicesMap = {
  một: 0,
  1: 0,
  hai: 1,
  2: 1,
  ba: 2,
  3: 2,
  bốn: 3,
  4: 3,
  năm: 4,
  5: 4,
  sáu: 5,
  6: 5,
  bảy: 6,
  7: 6,
  tám: 7,
  8: 7,
  chín: 8,
  9: 8,
  mười: 9,
  10: 9,
  "mười một": 10,
  11: 10,
  "mười hai": 11,
  12: 11,
};

const modeMap = {
  "cầu vồng": "rainbow",
  "nhiệt độ": "temperature",
  "độ ẩm": "humidity",
};

export default function VoiceInput() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const sendData = async (payload) => {
    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Voice command ", payload));
  };

  const processSentence = (sentence) => {
    const payload = {};
    const lower = sentence.toLowerCase();
    const words = lower.split(/[\s.,]+/).filter(Boolean);
    console.log(words);

       // ====== 5) TÌM MODE ======
    let chosenMode = null;
    for (const key of Object.keys(modeMap)) {
      if (lower.includes(key)) {
        chosenMode = modeMap[key];
        break;
      }
    }

    payload.mode = chosenMode ?? "manual";

    // ====== 1) TÌM LED INDEX ======
    const idx = [];
    const ledStartKeys = ["vị", "trí", "số", "led", "đèn"];

    let startIdx = -1;
    for (let i = 0; i < words.length; i++) {
      if (ledStartKeys.includes(words[i])) {
        startIdx = i + 1;
        break;
      }
    }
    console.log("index vi tri", idx)

    // Lấy từng số LED sau từ khóa
    if (startIdx !== -1) {
      for (let i = startIdx; i < words.length; i++) {
        if (!isNaN(words[i])) {
          idx.push(Number(words[i]));
          console.log("duyet index", words[i])
        } else {
          break; // gặp từ khác → dừng
        }
      }
    }

    // ====== 2) PHÂN LOẠI TARGET ======
    if (lower.includes("tất cả") || idx.length === 0) {
      payload.target = "all";
    } else if (idx.length === 1) {
      payload.target = "single";
      payload.id = idx[0];
    } else {
      payload.target = "group";
      payload.ids = idx;
    }

    // ====== 3) TÌM MÀU ======
    const colorKeys = Object.keys(colorMap);
    let chosenColor = null;

    // Kiểm tra multi-word màu (vd: "xanh da trời")
    for (const key of colorKeys) {
      if (lower.includes(key)) {
        chosenColor = key;
        break;
      }
    }

    if (chosenColor) {
      const c = colorMap[chosenColor];
      payload.color = [c.r, c.g, c.b];
    } else if (lower.includes("tắt") || lower.includes("tắt đèn")) {
      payload.color = [0, 0, 0];
    }

    // ====== 4) LẤY ĐỘ SÁNG ======
    let brightness = null;

    const posBright = words.indexOf("sáng");
    if (posBright !== -1 && !isNaN(words[posBright + 1])) {
      brightness = Number(words[posBright + 1]);
      payload.brightness = brightness;
    }

    return payload;
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ Speech Recognition.");
      return;
    }

    // Tạo recognition 1 lần duy nhất
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript + " ";
        }
        setText((prev) => prev + transcript.trim() + " ");
      };

      recognition.onerror = (e) => console.error("Lỗi:", e.error);

      recognitionRef.current = recognition;
    }

    // ======== NẾU ĐANG NGHE → BẤM DỪNG =========
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);

      const payload = processSentence(text);

      sendData(payload);

      return;
    }

    // ======== NẾU ĐANG TẮT → BẬT NGHE =========
    setText("");
    recognitionRef.current.start();
    setListening(true);
  };

  return (
    <div style={{ alignSelf: "center", textAlign: "center" }}>
      <Button
        onClick={startListening}
        variant={listening ? "danger" : "primary"}
      >
        {listening ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
      </Button>
      <p style={{ marginTop: 20, fontSize: 20 }}>
        Bạn đã nói: <strong>{text}</strong>
      </p>
    </div>
  );
}
