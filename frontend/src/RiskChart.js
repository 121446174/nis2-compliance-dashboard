import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const RiskChart = ({ totalScore, riskLevel }) => {
    const chartRef = useRef(null); // Reference to the canvas element
    const chartInstance = useRef(null); // Store the chart instance

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart instance before creating a new one
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create a new chart instance
        chartInstance.current = new Chart(ctx, {
            type: 'doughnut', // Chart type
            data: {
                labels: ['Your Score', 'Remaining Risk Space'],
                datasets: [
                    {
                        label: 'Risk Assessment',
                        data: [totalScore, 100 - totalScore], // Assuming max score is 100
                        backgroundColor: ['#36A2EB', '#FF6384'],
                        hoverOffset: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
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
    }, [totalScore]); // Re-run effect only when totalScore changes

    return (
        <div style={{ width: '300px', margin: 'auto' }}>
            <canvas ref={chartRef}></canvas>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
                <strong>Risk Level: {riskLevel}</strong>
            </p>
        </div>
    );
};

export default RiskChart;
