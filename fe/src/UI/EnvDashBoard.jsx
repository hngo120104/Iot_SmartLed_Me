import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./EnvDashboard.css";
import { EnvChart } from "./EnvChart";
import { EnvStat } from "./EnvStat";

const MAX_POINTS = 100;

export default function EnvDashboard() {
  const [env, setEnv] = useState({
    ts: 0,
    temperature: 0,
    humidity: 0,
    light: 0,
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (e) => {
      const { topic, message } = JSON.parse(e.data);
      if (topic === "led/state/env/history") {
        const parsed = JSON.parse(message);
        console.log(message);
        setEnv(parsed);
        setHistory((prev) => {
          const next = [...prev, parsed];
          return next.length > MAX_POINTS ? next.slice(1) : next;
        });
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
      <div className="env-dashboard">
        <EnvStat title="🌡 Temperature" value={env.temperature} unit="°C" />
        <EnvStat title="💧 Humidity" value={env.humidity} unit="%" />
        <EnvStat title="💡 Light" value={env.lux} unit="lux" />

        <EnvChart data={history} />
      </div>
      <label style={{fontSize: "30px" }}>Environment Chart</label>
    </div>
  );
}
