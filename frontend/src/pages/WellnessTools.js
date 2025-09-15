import React, { useState } from "react";
import {
  FaTint,
  FaWalking,
  FaWeight,
  FaHeartbeat,
  FaBrain,
  FaBed,
} from "react-icons/fa";

const wellnessTools = [
  {
    id: "bmi",
    title: "BMI Calculator",
    icon: <FaWeight size={50} color="#007bff" />,
  },
  {
    id: "water",
    title: "Water Intake Tracker",
    icon: <FaTint size={50} color="#17a2b8" />,
  },
  {
    id: "steps",
    title: "Step Counter",
    icon: <FaWalking size={50} color="#28a745" />,
  },
  {
    id: "stress",
    title: "Stress Level Checker",
    icon: <FaBrain size={50} color="#6f42c1" />,
  },
  {
    id: "sleep",
    title: "Sleep Quality Tracker",
    icon: <FaBed size={50} color="#6610f2" />,
  },
  {
    id: "bp",
    title: "Blood Pressure Monitor",
    icon: <FaHeartbeat size={50} color="#dc3545" />,
  },
];

export default function WellnessTools() {
  const [openTool, setOpenTool] = useState(null);
  const [bmiData, setBmiData] = useState({ weight: "", height: "" });
  const [waterIntake, setWaterIntake] = useState(0);
  const [steps, setSteps] = useState(0);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [bp, setBp] = useState({ systolic: "", diastolic: "" });

  const renderToolContent = (toolId) => {
    switch (toolId) {
      case "bmi":
        const bmi =
          bmiData.height && bmiData.weight
            ? (bmiData.weight / (bmiData.height / 100) ** 2).toFixed(2)
            : null;

        let bmiStatus = "";
        if (bmi) {
          if (bmi < 18.5) bmiStatus = "Underweight";
          else if (bmi >= 18.5 && bmi < 25) bmiStatus = "Normal weight";
          else if (bmi >= 25 && bmi < 30) bmiStatus = "Overweight";
          else bmiStatus = "Obese";
        }

        return (
          <div className="tool-content-horizontal">
            <input
              type="number"
              placeholder="Weight (kg)"
              value={bmiData.weight}
              onChange={(e) =>
                setBmiData({ ...bmiData, weight: e.target.value })
              }
              className="input-field"
            />
            <input
              type="number"
              placeholder="Height (cm)"
              value={bmiData.height}
              onChange={(e) =>
                setBmiData({ ...bmiData, height: e.target.value })
              }
              className="input-field"
            />
            {bmi && (
              <p className="result-text">
                Your BMI: <strong>{bmi}</strong> - {bmiStatus}
              </p>
            )}
          </div>
        );

      case "water":
        return (
          <div className="tool-content-vertical">
            <p>
              💧 Daily water intake: <strong>{waterIntake}</strong> glasses
            </p>
            <div className="button-group">
              <button onClick={() => setWaterIntake(waterIntake + 1)}>
                +1
              </button>
              <button
                onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
              >
                -1
              </button>
            </div>
          </div>
        );

      case "steps":
        return (
          <div className="tool-content-vertical">
            <p>
              👣 Steps counted today: <strong>{steps}</strong>
            </p>
            <div className="button-group">
              <button onClick={() => setSteps(steps + 100)}>+100</button>
              <button onClick={() => setSteps(Math.max(0, steps - 100))}>
                -100
              </button>
            </div>
          </div>
        );

      case "stress":
        return (
          <div className="tool-content-vertical">
            <p>
              🧘 Stress Level: <strong>{stressLevel}</strong>
            </p>
            <input
              type="range"
              min="0"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
              className="range-slider"
            />
          </div>
        );

      case "sleep":
        return (
          <div className="tool-content-vertical">
            <p>
              🌙 Sleep Hours: <strong>{sleepHours}</strong>
            </p>
            <input
              type="number"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="input-field"
            />
          </div>
        );

      case "bp":
        const { systolic, diastolic } = bp;
        let bpStatus = "";
        if (systolic && diastolic) {
          const sys = parseInt(systolic);
          const dia = parseInt(diastolic);
          if (sys < 120 && dia < 80) bpStatus = "Normal";
          else if (sys >= 120 && sys < 130 && dia < 80) bpStatus = "Elevated";
          else if ((sys >= 130 && sys < 140) || (dia >= 80 && dia < 90))
            bpStatus = "High (Hypertension Stage 1)";
          else if (sys >= 140 || dia >= 90)
            bpStatus = "High (Hypertension Stage 2)";
          else bpStatus = "Consult Doctor";
        }

        return (
          <div className="tool-content-horizontal">
            <input
              type="number"
              placeholder="Systolic"
              value={bp.systolic}
              onChange={(e) => setBp({ ...bp, systolic: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Diastolic"
              value={bp.diastolic}
              onChange={(e) => setBp({ ...bp, diastolic: e.target.value })}
              className="input-field"
            />
            {systolic && diastolic && (
              <p className="result-text">
                Your BP:{" "}
                <strong>
                  {systolic}/{diastolic}
                </strong>{" "}
                mmHg - {bpStatus}
              </p>
            )}
          </div>
        );

      default:
        return <p>Select a tool.</p>;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Wellness Tools
      </h1>
      <div className="tools-grid">
        {wellnessTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setOpenTool(tool)}
            className="tool-card"
          >
            <div className="tool-icon">{tool.icon}</div>
            <h3 className="tool-title">{tool.title}</h3>
          </div>
        ))}
      </div>

      {openTool && (
        <div className="overlay" onClick={() => setOpenTool(null)}>
          <div className="tool-popup" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center" }}>{openTool.title}</h2>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              {renderToolContent(openTool.id)}
            </div>
            <button className="close-btn" onClick={() => setOpenTool(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .tool-card {
          background: white;
          border-radius: 15px;
          padding: 25px 15px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tool-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .tool-title {
          margin-top: 15px;
          font-size: 18px;
          color: #333;
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .tool-popup {
          background: white;
          border-radius: 15px;
          padding: 30px;
          width: 450px;
          max-width: 95%;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .close-btn {
          margin-top: 20px;
          padding: 10px 25px;
          border: none;
          border-radius: 8px;
          background: #007bff;
          color: white;
          cursor: pointer;
        }
        .input-field {
          padding: 8px 10px;
          margin: 5px;
          border-radius: 5px;
          border: 1px solid #ccc;
          width: 45%;
        }
        .button-group button {
          margin: 0 10px;
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          background: #007bff;
          color: white;
          cursor: pointer;
        }
        .range-slider {
          width: 80%;
        }
        .result-text {
          margin-top: 15px;
          font-weight: bold;
          color: #007bff;
        }
        .tool-content-horizontal {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tool-content-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}
