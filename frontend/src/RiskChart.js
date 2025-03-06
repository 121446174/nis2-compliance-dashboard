// Reference: Chart.js Integration in React
// https://www.chartjs.org/docs/latest/getting-started/integration.html

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const RiskChart = ({ totalScore = 0, maxPossibleScore = 100, riskLevel }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

// Reference: Chart.js Doughnut Chart
// https://www.chartjs.org/docs/latest/charts/doughnut.html
    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const normalizedScore = (totalScore / maxPossibleScore) * 100;
        const colors = ['#6C63FF', '#B0C4DE'];

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Your Score', 'Potential Risk'],
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

       // Ensures that the Chart.js instance is destroyed if changes occur
       // Reference: StakeOverflow - 'Destroy Chart.js bar graph to redraw other graph in same canvas'
       // https://stackoverflow.com/questions/40056555/destroy-chart-js-bar-graph-to-redraw-other-graph-in-same-canvas
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [totalScore, maxPossibleScore]);
  
 // Static mapping for colors and positions
 // Reference: React-simple-maps - Dynamic Styling
 const riskMapping = {
    Low: { color: '#28A745', position: '10%' }, // Green
    Medium: { color: '#FFC107', position: '30%' }, // Yellow
    High: { color: '#FF9800', position: '50%' }, // Orange
    'Very High': { color: '#FF5722', position: '70%' }, // Red
    Critical: { color: '#D32F2F', position: '90%' }, // Dark Red
};

    // Get the color and position for the current risk level
    // Source: Chart.js and StakeOverflow Dynamic CSS Style in JSX
// https://stackoverflow.com/questions/46322708/inlining-dynamic-css-style-in-jsx
    const { color, position } = riskMapping[riskLevel] || { color: '#000', position: '0%' };

    return (
        <div style={{ width: '400px', margin: 'auto', textAlign: 'center' }}>
            {/* Donut Chart */}
            <div>
                <canvas ref={chartRef}></canvas>
                <p style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
    Risk Score: {((totalScore / maxPossibleScore) * 100).toFixed(2)}%
</p>

                <p
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: color,
                    }}
                >
                    Risk Level: {riskLevel || 'Unknown'}
                </p>
            </div>

            {/* Static Progress Bar */}
            <div style={{ marginTop: '20px', position: 'relative' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '5px',
                    }}
                >
                    <span style={{ color: '#28A745' }}>Low</span>
                    <span style={{ color: '#FFC107' }}>Medium</span>
                    <span style={{ color: '#FF9800' }}>High</span>
                    <span style={{ color: '#FF5722' }}>Very High</span>
                    <span style={{ color: '#D32F2F' }}>Critical</span>
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
                            width: '10px', // Fixed size for the indicator
                            left: position, // Dynamic position
                            background: color, // Dynamic color
                            borderRadius: '5px',
                            transform: 'translateX(-50%)', // Center the indicator
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default RiskChart;

     