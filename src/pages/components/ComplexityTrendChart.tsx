import Chart from "chart.js/auto";
import React, { useEffect, useRef } from "react";

export interface ComplexityTrendChartProps {
  items: {
    label: string;
    value: number;
  }[];
}

export const ComplexityTrendChart = (props: ComplexityTrendChartProps) => {
  const { items } = props;
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    new Chart(canvasRef.current, {
      type: "line",
      options: {
        maintainAspectRatio: false,
        scales: {
          y: { min: 0 },
        },
      },
      data: {
        labels: items.map((item) => item.label),
        datasets: [
          {
            data: items.map((item) => item.value),
            label: "Cyclomatic Complexity",
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(75, 192, 192)",
          },
        ],
      },
    });
  }, []);

  return (
    <div style={{ height: "400px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
