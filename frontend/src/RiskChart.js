import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const RiskChart = ({ totalScore, maxPossibleScore, riskLevel }) => {
  const chartRef = useRef(null); // Reference for the donut chart
  const chartInstance = useRef(null); // Store the chart instance

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy existing chart instance before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Normalize the score for display out of 100
    const normalizedScore = (totalScore / maxPossibleScore) * 100;

    // Modern and professional color palette
    const colors = ['#6C63FF', '#FFC300']; // Purple for "Your Score", Yellow for "Remaining"

    // Create a new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut', // Donut chart
      data: {
        labels: ['Your Score', 'Remaining'],
        datasets: [
          {
            label: 'Risk Assessment',
            data: [normalizedScore, 100 - normalizedScore],
            backgroundColor: colors,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.raw.toFixed(2)}%`;
              },
            },
          },
        },
      },
    });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [totalScore, maxPossibleScore]); // Re-run when score changes

  // Risk Levels for Progress Bar
  const riskLevels = [
    { label: 'Low', min: 0, max: 5, color: '#28A745' }, // Green
    { label: 'Medium', min: 6, max: 10, color: '#FFC107' }, // Yellow
    { label: 'High', min: 11, max: 100, color: '#FF9800' }, // Orange
    { label: 'Very High', min: 101, max: 999, color: '#FF5722' }, // Red
    { label: 'Critical', min: 1000, max: 9999, color: '#D32F2F' }, // Dark Red
  ];

  // Determine risk level dynamically
  const currentRiskLevel = riskLevels.find(
    (level) => totalScore >= level.min && totalScore <= level.max
  );

  return (
    <div style={{ width: '400px', margin: 'auto', textAlign: 'center' }}>
      {/* Donut Chart */}
      <div>
        <canvas ref={chartRef}></canvas>
        <p style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
          Risk Score: {totalScore.toFixed(2)} / {maxPossibleScore.toFixed(2)}{' '}
          ({((totalScore / maxPossibleScore) * 100).toFixed(2)}%)
        </p>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: currentRiskLevel?.color || '#000',
          }}
        >
          Risk Level: {currentRiskLevel?.label || 'Unknown'}
        </p>
      </div>

      {/* Risk Level Progress Bar */}
      <div style={{ marginTop: '20px', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            marginBottom: '5px',
          }}
        >
          {riskLevels.map((level) => (
            <span key={level.label} style={{ color: level.color }}>
              {level.label}
            </span>
          ))}
        </div>
        <div
          style={{
            position: 'relative',
            height: '10px',
            width: '100%',
            background: '#E0E0E0',
            borderRadius: '5px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: `${(totalScore / maxPossibleScore) * 100}%`,
              background: currentRiskLevel?.color || '#000',
              borderRadius: '5px',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RiskChart;

