import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface LineChartProps {
  funnelData?: {
    usersInteracted: number;
    completedChats: number;
    qualifiedLeads: number;
    meetingsBooked: number;
  };
}

export default function LineChart({ funnelData }: LineChartProps) {
  const defaultData = {
    usersInteracted: 0,
    completedChats: 0,
    qualifiedLeads: 0,
    meetingsBooked: 0,
  };

  const data = {
    labels: [
      ['Users', 'Interacted'],
      ['Completed', 'chat'],
      ['Qualified', 'leads'],
      ['Meetings', 'booked']
    ],
    datasets: [
      {
        data: funnelData ? [
          funnelData.usersInteracted,
          funnelData.completedChats,
          funnelData.qualifiedLeads,
          funnelData.meetingsBooked,
        ] : [
          defaultData.usersInteracted,
          defaultData.completedChats,
          defaultData.qualifiedLeads,
          defaultData.meetingsBooked,
        ],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 6,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#6366f1',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        // max: 3500,
        ticks: {
          stepSize: 1000,
          callback: function(value: number) {
            return value >= 1000 ? (value / 1000) + 'k' : value;
          },
          color: '#6b7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        border: {
          display: false
        }
      },
      x: {
        beginAtZero: true,
        offet: true,
        ticks: {
          color: '#6b7280',
          font: {
            // size: 12,
            size: 11,
          },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: {
          display: false,
          drawBorder: false
        },
        border: {
          display: false
        },
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };


  return (
    <div className='w-full h-100'>
      <Line data={data} options={options} />
    </div>
  );
}