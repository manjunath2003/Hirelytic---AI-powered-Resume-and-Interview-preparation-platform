import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sampleData = [
  { month: "Jan", value: 60 },
  { month: "Feb", value: 75 },
  { month: "Mar", value: 85 },
  { month: "Apr", value: 72 },
  { month: "May", value: 88 },
  { month: "Jun", value: 94 },
];

export default function ExampleChart() {
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={sampleData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#e6eefc" strokeDasharray="5 5" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
