import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const RiskChart = ({ totalScore = 0, maxPossibleScore = 100, riskLevel, riskLevels = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const normalizedScore = (totalScore / maxPossibleScore) * 100;
        const colors = ['#6C63FF', '#FFC300']; // Purple for "Your Score", Yellow for "Remaining"

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
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

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [totalScore, maxPossibleScore]);

    const currentRiskLevel = riskLevels.find(
        (level) => totalScore >= level.Min_Score && totalScore <= level.Max_Score
    );

    return (
        <div style={{ width: '400px', margin: 'auto', textAlign: 'center' }}>
            <div>
                <canvas ref={chartRef}></canvas>
                <p style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                    Risk Score: {totalScore.toFixed(2)} / {maxPossibleScore.toFixed(2)} (
                    {((totalScore / maxPossibleScore) * 100).toFixed(2)}%)
                </p>
                <p
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: currentRiskLevel?.color || '#000',
                    }}
                >
                    Risk Level: {currentRiskLevel?.Risk_Level || riskLevel || 'Unknown'}
                </p>
            </div>
        </div>
    );
};

export default RiskChart;

