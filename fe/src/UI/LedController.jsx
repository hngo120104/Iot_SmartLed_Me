import { useState, useEffect, use } from "react";
import Sketch from "@uiw/react-color-sketch";
import Switch from "./Switch";
import "./LedController.css";
import Button from "./Button";

export default function LedController() {
  const NUM_LEDS = 12;
  const RADIUS = 120; // radius of the circle (in pixels)

  const [selectedLeds, setSelectedLeds] = useState([]);
  const [ledsColor, setLedsColor] = useState(
    Array.from({ length: NUM_LEDS }, () => ({ r: 0, g: 0, b: 0 }))
  );
  const [currentColor, setCurrentColor] = useState({ r: 255, g: 255, b: 255 });
  const [pickerColor, setPickerColor] = useState("#ffffff");
  const [brightness, setBrightness] = useState(10);
  let isSelectedAll = false;

  const handleLedClick = (index, event) => {
    if (event.shiftKey) {
      // If Shift key is held, toggle selection
      setSelectedLeds((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
      return;
    }
    // Otherwise, select only the clicked LED or deselect selected one
    if (selectedLeds.includes(index)) {
      setSelectedLeds((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedLeds([index]);
    }
  };

  const applyBrightness = async () => {
    const payload = {
      brightness: brightness,
    };

    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log(`Applied brightness ${brightness} to all LEDs`));
  };

  const rainbowMode = async () => {
    const payload = { mode: "rainbow" };
    setSelectedLeds([]);
    console.log("Selected LEDs after temp:", selectedLeds);
    isSelectedAll = true;
    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Set rainbow mode"));
  };

  const turnOffAllLeds = async () => {
    setLedsColor(Array(NUM_LEDS).fill({ r: 0, g: 0, b: 0 }));
    setSelectedLeds([]);
    console.log(ledsColor);
    const payload = {
      mode: "manual",
      target: "all",
      color: [0, 0, 0],
    };

    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Turned off all LEDs"));
  };

  const temperatureColor = async () => {
    const payload = { mode: "temperature" };
    setSelectedLeds([]);
    console.log("Selected LEDs after temp:", selectedLeds);
    isSelectedAll = true;
    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Set env temperature color mode"));
  };

  const humidityColor = async () => {
    const payload = { mode: "humidity" };
    isSelectedAll = true;
    setSelectedLeds([]);
    console.log("Selected LEDs after humidity:", selectedLeds);
    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Set env humidity color mode"));
  };

  const envLightColor = async () => {
    isSelectedAll = true;
    const payload = { mode: "light" };
    setSelectedLeds([]);
    console.log("Selected LEDs after env light:", selectedLeds);
    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Set env light color mode"));
  };

  const applyColor = async () => {
    if (selectedLeds.length === 0) {
      alert("Vui lòng chọn ít nhất một LED để áp dụng màu sắc.");
      return;
    }

    const newLedsColor = [...ledsColor];
    selectedLeds.forEach((i) => {
      newLedsColor[i] = currentColor;
    });
    setLedsColor(newLedsColor);
    console.log("Applied color", currentColor, "to LEDs:", selectedLeds);

    const payload = {
      mode: "manual",
      brightness: brightness,
      color: [currentColor.r, currentColor.g, currentColor.b],
    };

    if (selectedLeds.length === NUM_LEDS) {
      payload.target = "all";
    } else if (selectedLeds.length === 1) {
      payload.target = "single";
      payload.id = selectedLeds[0];
    } else {
      payload.target = "group";
      payload.ids = selectedLeds;
    }

    await fetch("http://localhost:3000/api/led/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then(console.log("Applied color to selected LEDs"));
  };

  return (
    <div className="led-controller">
      <div className="buttons-group">
        {/* <Switch
        label={lightIsOn ? "Light ON" : "Light OFF"}
        checked={lightIsOn}
        onChange={(checked) => {
          console.log(checked ? "Light ON" : "Light OFF"),
            setLightIsOn(checked);
        }}
      /> */}
        <label style={{ alignSelf: "center", fontSize: "20px" }}>
          Light Mode:
        </label>
        <Button variant="primary" onClick={rainbowMode}>Rainbow</Button>
        <Button variant="primary" onClick={temperatureColor}>
          Temperature Color
        </Button>
        <Button variant="primary" onClick={humidityColor}>
          Humidity Color
        </Button>
        <Button variant="primary" onClick={envLightColor}>
          Environmental Light Color
        </Button>

        <label style={{ alignSelf: "center", fontSize: "20px" }}>
          Manual control:
        </label>
        <div
          className="brightness-control"
          style={{ gap: "30px", display: "flex", flexDirection: "row" }}
        >
          <div
            className="brightness-bar"
            style={{
              alignSelf: "center",
              position: "relative",
              height: "40px",
            }}
          >
            <label style={{ marginRight: "10px" }}>
              Brightness: {brightness}
            </label>
            <br></br>
            <input
              type="range"
              min="0"
              max="255"
              value={brightness}
              style={{ position: "absolute", width: "120px" }}
              onChange={(e) => {
                setBrightness(Number(e.target.value));
              }}
            />
          </div>
          <Button variant="primary" onClick={applyBrightness}>
            Apply
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={(e) => {
            selectedLeds.length === NUM_LEDS
              ? setSelectedLeds([])
              : setSelectedLeds([...Array(NUM_LEDS).keys()]);
          }}
        >
          Toggle all LEDs
        </Button>
        <Button variant="primary" onClick={applyColor}>
          Apply Color
        </Button>
        <Button variant="danger" onClick={turnOffAllLeds}>
          Turn Off All LEDs
        </Button>
      </div>

      <div className="controller">
        <div className="led-circle">
          {ledsColor.map((_, index) => {
            const angle = (index / NUM_LEDS) * 2 * Math.PI; // calculate angle for each LED
            const x = RADIUS * Math.cos(angle) + 130; // x position
            const y = RADIUS * Math.sin(angle) + 130; // y position
            return (
              <div
                key={index}
                className={`bit-led`}
                onClick={(e) => {
                  handleLedClick(index, e);
                  console.log("Selected LEDs:", selectedLeds);
                }}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  border: "2px solid #000",
                  boxShadow: selectedLeds.includes(index)
                    ? "0 0 20px #ecf00fff"
                    : "",
                    // ledsColor is object so we must pass its r, g, b
                  backgroundColor: `rgb(${ledsColor[index].r}, ${ledsColor[index].g}, ${ledsColor[index].b})`,
                }}
              />
            );
          })}
        </div>

        <div>
          <Sketch
            disableAlpha={true}
            color={pickerColor}
            width={300}
            height={400}
            preset="colorPicker"
            onChange={(newColor) => {
              setPickerColor(newColor.hex), setCurrentColor(newColor.rgb);
              console.log("Picked color:", newColor.rgb);
            }}
          />
        </div>
      </div>
    </div>
  );
}
