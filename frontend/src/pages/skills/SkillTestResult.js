import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../../components/AnimatedPage";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SkillTestResult() {
  const [result, setResult] = useState(null);
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/skills/report/${userId}`)
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(() => {});
  }, [userId]);

  if (!result)
    return (
      <AnimatedPage>
        <div className="p-6 text-center">
          <p className="text-gray-600">Loading skill report...</p>
        </div>
      </AnimatedPage>
    );

  const COLORS = ["#16a34a", "#2563eb", "#dc2626", "#d97706"]; // Green, Blue, Red, Orange

  const barData = Object.entries(result.category_scores).map(
    ([name, data]) => ({
      name: name.replace("_", " "),
      percent: data.percent,
    })
  );

  const pieData = [
    { name: "Final Score", value: result.final_score },
    { name: "Remaining", value: 100 - result.final_score },
  ];

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          Skill Test Report
        </h1>

        {/* Final Score Card */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Final Score</h2>
          <p className="text-5xl font-bold text-green-600">
            {result.final_score}%
          </p>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                >
                  <Cell key="score" fill="#16a34a" />
                  <Cell key="remaining" fill="#e5e7eb" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white shadow rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percent" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Areas */}
        {result.weak_categories?.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8 rounded">
            <h3 className="font-bold text-red-700 mb-2">
              Areas That Need Improvement
            </h3>
            <ul className="list-disc ml-6 text-red-700">
              {result.weak_categories.map((cat, i) => (
                <li key={i}>{cat.replace("_", " ")}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => navigate("/teacher-dashboard")}
          className="mt-6 bg-green-700 text-white px-6 py-3 rounded-lg shadow"
        >
          Back to Dashboard
        </button>
      </div>
    </AnimatedPage>
  );
}
