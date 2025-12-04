import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function EnvChart({ data }) {
  return (
    <div className="env-chart" style={{ display: "flex", gap: "20px" }}>
      
      {/* CHART 1 — Temperature / Humidity */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              tickFormatter={(v) =>
                new Date(v * 1000).toLocaleTimeString("vi-VN", {
                  hour12: false,
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(v) =>
                new Date(v * 1000).toLocaleTimeString("vi-VN", {
                  hour12: false,
                })
              }
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ff4d4f"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#1890ff"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 2 — Light (Lux) */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              tickFormatter={(v) =>
                new Date(v * 1000).toLocaleTimeString("vi-VN", {
                  hour12: false,
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(v) =>
                new Date(v * 1000).toLocaleTimeString("vi-VN", {
                  hour12: false,
                })
              }
            />
            <Line
              type="monotone"
              dataKey="lux"
              stroke="#faad14"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
