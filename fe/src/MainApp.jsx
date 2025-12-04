import { useState } from "react";
import axios from "axios";
import Button from "./UI/Button";
import VoiceInput from "./VoiceInput";

//main app component
export default function MainApp() {
  const [text, setText] = useState(null);
  const [receivedText, setReceivedText] = useState(null);


  const sendingData = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://172.11.242.94:8080/received/text", {
        text,
      });
      console.log(res.data);
      //setReceivedText(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="main-app">
      <h1 className="app-name">
        Smart LED Controller
        <span className="logo-container">
          <img className="logo" src="color-bulb.png" alt="logo"></img>
        </span>
      </h1>
      <br/>
      
      <br />
      <br />
      <label className="voice-command">Voice Command</label>
      {/* <textarea
        className="input-text-area"
        type="text"
        placeholder="Nhập lời nhắn"
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <Button onClick={sendingData} variant="primary">
        Send
      </Button> */}
      <br />
      <VoiceInput />
      <br />
      <label>{receivedText}</label>
    </div>
  );
}
