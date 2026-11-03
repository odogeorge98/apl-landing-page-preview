"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { StudentEnrollmentAnalyticsMonth } from "@/lib/interfaces/dashboard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type StudentEnrollmentLineChartProps = {
  series: StudentEnrollmentAnalyticsMonth[];
};

function monthLabel(month: string, includeYear: boolean) {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    ...(includeYear ? { year: "2-digit" as const } : {}),
    timeZone: "UTC",
  }).format(date);
}

export default function StudentEnrollmentLineChart({ series }: StudentEnrollmentLineChartProps) {
  const years = new Set(series.map((point) => point.month.slice(0, 4)));
  const includeYear = years.size > 1;

  const data: ChartData<"line", number[], string> = {
    labels: series.map((point) => monthLabel(point.month, includeYear)),
    datasets: [
      {
        label: "Cumulative students",
        data: series.map((point) => point.cumulativeStudents),
        borderColor: "#101d49",
        backgroundColor: "rgba(16, 29, 73, 0.08)",
        fill: true,
        tension: 0.34,
        borderWidth: 2.5,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        pointBackgroundColor: "#101d49",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
      {
        label: "New students",
        data: series.map((point) => point.newStudents),
        borderColor: "#d5a817",
        backgroundColor: "#f5c542",
        fill: false,
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        pointBackgroundColor: "#f5c542",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 7,
          boxHeight: 7,
          color: "#64718a",
          padding: 16,
          font: { family: "inherit", size: 11, weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: "#101d49",
        titleColor: "#ffffff",
        bodyColor: "#e8edf7",
        padding: 11,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${new Intl.NumberFormat("en-NG").format(Number(context.parsed.y ?? 0))}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#8490a6",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          font: { family: "inherit", size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#edf0f6" },
        border: { display: false, dash: [3, 4] },
        ticks: {
          precision: 0,
          color: "#8490a6",
          maxTicksLimit: 5,
          padding: 8,
          font: { family: "inherit", size: 10 },
        },
      },
    },
  };

  return (
    <div role="img" aria-label="Line chart showing new student registrations and cumulative students by month" className="h-full min-h-[245px] w-full">
      <Line data={data} options={options} />
    </div>
  );
}
