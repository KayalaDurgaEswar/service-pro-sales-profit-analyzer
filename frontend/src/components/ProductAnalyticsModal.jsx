import { useState, useEffect, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProductAnalyticsModal = ({ isOpen, onClose, product, businessId }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && product && businessId) {
            fetchProductAnalytics();
        }
    }, [isOpen, product, businessId]);

    const fetchProductAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/analytics/product/${businessId}/${product._id}`);
            setAnalyticsData(data);
        } catch (error) {
            console.error("Error fetching product analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const chartData = analyticsData ? {
        labels: analyticsData.sales.map(d => d._id),
        datasets: [
            {
                label: 'Quantity Sold',
                data: analyticsData.sales.map(d => d.totalQuantity),
                borderColor: 'rgba(0, 122, 255, 1)',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: '30-Day Sales Trend',
                font: {
                    family: 'Inter',
                    size: 14,
                    weight: '600'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    // Calculate Stockout Prediction (Simple run rate)
    let stockoutMsg = "Stock levels appear stable.";
    if (analyticsData && analyticsData.sales.length > 0) {
        const totalSold = analyticsData.sales.reduce((acc, curr) => acc + curr.totalQuantity, 0);
        const dailyRate = totalSold / 30; // avg per day over last 30 days
        const stockLeft = analyticsData.product.stock;

        if (dailyRate > 0) {
            const daysLeft = Math.floor(stockLeft / dailyRate);
            if (daysLeft < 7) {
                stockoutMsg = `⚠️ Critically Low! Estimated stockout in ${daysLeft} days.`;
            } else if (daysLeft < 30) {
                stockoutMsg = `⚠️ Attention Needed. Estimated stockout in ${daysLeft} days.`;
            } else {
                stockoutMsg = `✅ Healthy. Estimated coverage: ${daysLeft} days.`;
            }
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: 'white', padding: '24px', borderRadius: '16px',
                width: '90%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>{product.name}</h2>
                        <p style={{ color: '#666' }}>Analytics & Insights</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading analysis...</div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: '#f5f5f7', padding: '16px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>Current Stock</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: analyticsData?.product.stock < 10 ? '#ff3b30' : '#34c759' }}>
                                    {analyticsData?.product.stock} units
                                </p>
                            </div>
                            <div style={{ background: '#f5f5f7', padding: '16px', borderRadius: '12px' }}>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>Forecast</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{stockoutMsg}</p>
                            </div>
                        </div>

                        <div style={{ height: '300px' }}>
                            {chartData ? <Line data={chartData} options={chartOptions} /> : <p>No sales data available.</p>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductAnalyticsModal;
