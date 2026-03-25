import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { cn } from '@/lib/utils';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  subscriptionBreakdown?: {
    active: Array<{ tier: string; count: number; percentage: number }>;
    ended: { tier: string; count: number; percentage: number };
  };
}

const tierColors: { [key: string]: string } = {
  'Basic Tier': '#4996F4',
  'Pro Tier': '#5F3DF4',
  'Enterprise Tier': '#169F56',
  'Starter Plan': '#4996F4',
  'Professional Plan': '#5F3DF4',
  'Enterprise Plan': '#169F56',
  'Ended Subscriptions': '#CB1616',
};

export default function SubscriptionChart({ subscriptionBreakdown }: PieChartProps) {
  const defaultBreakdown = {
    active: [],
    ended: { tier: 'Ended Subscriptions', count: 0, percentage: 0 },
  };

  const breakdown = subscriptionBreakdown || defaultBreakdown;
  const chartItems = [
    ...breakdown.active,
    breakdown.ended,
  ];

  const data = {
    labels: chartItems.map(item => item.tier),
    datasets: [
      {
        data: chartItems.map(item => item.percentage),
        backgroundColor: chartItems.map(item => tierColors[item.tier] || '#6b7280'),
        borderWidth: 0,
        cutout: '70%',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  };
  
  return (
    <div className="w-full">
      <div className='w-[50%] mx-auto'>
        <Doughnut data={data} options={options} />
      </div>
      <div className='w-full flex flex-col gap-2 mt-10'>
        {
          chartItems.map((item, index) => (
            <div key={item.tier} className='w-full flex justify-between text-sm text-[#5E6775]'>
              <div className='flex gap-2'>
                <div 
                  className="w-[20px] h-[20px] rounded-[4px]"
                  style={{ backgroundColor: tierColors[item.tier] || '#6b7280' }}
                />
                <p>{item.tier}</p>
              </div>
              <div>{item.percentage}%</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}