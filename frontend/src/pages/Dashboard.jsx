import { useEffect, useState, useContext } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';
import ProductAnalyticsModal from '../components/ProductAnalyticsModal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const { selectedBusiness } = useContext(AuthContext);
    const [summary, setSummary] = useState({ sales: 0, expenses: 0, profit: 0 });
    const [chartData, setChartData] = useState(null);
    const [chartType, setChartType] = useState('bar');
    const [pieData, setPieData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [forecastData, setForecastData] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [netSalesData, setNetSalesData] = useState(null);
    const [salesRange, setSalesRange] = useState('year');
    const [topItems, setTopItems] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    useEffect(() => {
        if (selectedBusiness) {
            fetchData();
        }
    }, [selectedBusiness]);

    useEffect(() => {
        if (selectedBusiness) {
            fetchNetSales();
        }
    }, [selectedBusiness, salesRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const [transactionRes, forecastRes, inventoryRes, topItemsRes] = await Promise.all([
                axios.get(`/transactions/${selectedBusiness._id}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
                axios.get(`/analytics/forecast/${selectedBusiness._id}`),
                axios.get(`/analytics/inventory/${selectedBusiness._id}`),
                axios.get(`/analytics/top-items/${selectedBusiness._id}`)
            ]);

            processData(transactionRes.data);
            processForecast(forecastRes.data);
            processInventory(inventoryRes.data);
            setTopItems(topItemsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNetSales = async () => {
        try {
            const { data } = await axios.get(`/analytics/sales/${selectedBusiness._id}?range=${salesRange}`);
            processNetSales(data);
        } catch (error) {
            console.error('Error fetching net sales:', error);
        }
    };

    const processForecast = (data) => {
        if (!data.success || !data.forecast.length) return;

        setForecastData({
            labels: data.forecast.map(d => d.date),
            datasets: [
                {
                    label: 'Predicted Sales',
                    data: data.forecast.map(d => d.predictedAmount),
                    borderColor: 'rgba(255, 149, 0, 1)',
                    backgroundColor: 'rgba(255, 149, 0, 0.1)',
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                }
            ]
        });
    };

    const processInventory = (data) => {
        if (!data || !data.length) return;

        const lowStock = data.filter(item => item.stock < 10);
        setLowStockItems(lowStock);

        setInventoryData({
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Stock Level',
                data: data.map(item => item.stock),
                backgroundColor: data.map(item => item.stock < 10 ? 'rgba(255, 59, 48, 0.7)' : 'rgba(52, 199, 89, 0.7)'),
                borderRadius: 4,
                // Add reference to full object for click handler
                inventoryItems: data
            }]
        });
    };

    const processNetSales = (data) => {
        if (!data) return;

        setNetSalesData({
            labels: data.map(d => d._id),
            datasets: [{
                label: 'Net Sales',
                data: data.map(d => d.totalSales),
                borderColor: 'rgba(88, 86, 214, 1)',
                backgroundColor: 'rgba(88, 86, 214, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
            }]
        });
    };

    const processData = (transactions) => {
        let sales = 0;
        let expenses = 0;
        let cogs = 0;

        const daily = {};
        const categories = {};

        transactions.forEach(t => {
            const date = t.date.split('T')[0];
            if (!daily[date]) daily[date] = { sales: 0, expenses: 0, profit: 0 };

            if (t.type === 'SALE') {
                sales += t.amount;
                cogs += (t.cogs || 0);
                daily[date].sales += t.amount;
                daily[date].profit += (t.amount - (t.cogs || 0));
            } else {
                expenses += t.amount;
                daily[date].expenses += t.amount;
                daily[date].profit -= t.amount;

                if (!categories[t.category]) categories[t.category] = 0;
                categories[t.category] += t.amount;
            }
        });

        const profit = sales - expenses - cogs;
        setSummary({ sales, expenses, profit });

        const sortedDates = Object.keys(daily).sort();

        setChartData({
            labels: sortedDates,
            datasets: [
                {
                    label: 'Sales',
                    data: sortedDates.map(d => daily[d].sales),
                    backgroundColor: 'rgba(0, 122, 255, 0.8)',
                    borderRadius: 8,
                },
                {
                    label: 'Expenses',
                    data: sortedDates.map(d => daily[d].expenses),
                    backgroundColor: 'rgba(255, 45, 85, 0.8)',
                    borderRadius: 8,
                },
                {
                    label: 'Profit',
                    data: sortedDates.map(d => daily[d].profit),
                    borderColor: 'rgba(52, 199, 89, 1)',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    type: 'line',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        });

        setPieData({
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(0, 122, 255, 0.8)',
                    'rgba(88, 86, 214, 0.8)',
                    'rgba(255, 149, 0, 0.8)',
                    'rgba(52, 199, 89, 0.8)',
                    'rgba(90, 200, 250, 0.8)',
                    'rgba(175, 82, 222, 0.8)',
                ],
                borderWidth: 0,
            }]
        });
    };



    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        family: 'Inter',
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderRadius: 8,
                titleFont: {
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        family: 'Inter'
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Inter'
                    }
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        family: 'Inter',
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderRadius: 8,
            }
        },
        cutout: '70%',
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">{selectedBusiness?.name}</p>
                </div>

            </div>

            <div className="stats-grid">
                <div className="stat-card stat-sales scale-in">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Sales</p>
                        <h2 className="stat-value">${summary.sales.toFixed(2)}</h2>
                        <p className="stat-change positive">+12.5% from last month</p>
                    </div>
                </div>

                <div className="stat-card stat-expenses scale-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Expenses</p>
                        <h2 className="stat-value">${summary.expenses.toFixed(2)}</h2>
                        <p className="stat-change negative">+5.2% from last month</p>
                    </div>
                </div>

                <div className="stat-card stat-profit scale-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Net Profit</p>
                        <h2 className="stat-value">${summary.profit.toFixed(2)}</h2>
                        <p className="stat-change positive">+18.3% from last month</p>
                    </div>
                </div>
            </div>

            {lowStockItems.length > 0 && (
                <div className="alerts-section slide-in">
                    <div className="insight-card alert-card wide">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="alert-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px' }}>
                                    <path d="M12 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M12 17.01L12.01 16.9989" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="alert-title" style={{ marginBottom: 0 }}>Stock Alerts</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--danger-color)', opacity: 0.8 }}>Action required for low inventory items</p>
                            </div>
                        </div>
                        <div className="alerts-grid">
                            {lowStockItems.slice(0, 4).map(item => (
                                <div key={item._id} className="alert-item card-style">
                                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                                    <span className="alert-stock">{item.stock} left</span>
                                </div>
                            ))}
                            {lowStockItems.length > 4 && (
                                <div className="alert-item card-style more-alert">
                                    <span>+ {lowStockItems.length - 4} more items</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                {topItems.length > 0 && (
                    <div className="insight-card top-items-card" style={{ gridColumn: '1 / -1' }}>
                        <div className="top-items-header">
                            <h3 className="top-items-title">🏆 Top Selling Items</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {topItems.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="top-item-row"
                                    onClick={() => handleOpenModal({ _id: item._id, name: item.name })}
                                    style={{ cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '12px' }}
                                >
                                    <div className="item-info">
                                        <div className={`rank-badge rank-${index + 1}`}>
                                            {index + 1}
                                        </div>
                                        <span className="item-name" style={{ fontSize: '1rem' }}>{item.name}</span>
                                    </div>
                                    <div className="item-stats">
                                        <span className="item-sold">{item.totalQuantity} sold</span>
                                        <span className="item-revenue">${item.totalRevenue.toFixed(0)} rev</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="charts-grid" style={{ gridTemplateColumns: forecastData ? '2fr 1fr' : '2fr 1fr' }}>
                <div className="chart-card slide-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 className="chart-title">Performance Overview</h3>
                            <p className="chart-subtitle" style={{ marginBottom: 0 }}>Last 30 days history</p>
                        </div>
                        <div className="chart-toggle">
                            <button
                                className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                                onClick={() => setChartType('bar')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10"></line>
                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                </svg>
                            </button>
                            <button
                                className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                                onClick={() => setChartType('line')}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="chart-container">
                        {chartData && (
                            chartType === 'bar'
                                ? <Bar data={chartData} options={chartOptions} />
                                : <Line data={chartData} options={chartOptions} />
                        )}
                    </div>
                </div>

                {forecastData && (
                    <div className="chart-card slide-in" style={{ animationDelay: '0.1s' }}>
                        <h3 className="chart-title">AI Sales Forecast</h3>
                        <p className="chart-subtitle">Next 7 days prediction</p>
                        <div className="chart-container">
                            <Line data={forecastData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {!forecastData && pieData && (
                    <div className="chart-card slide-in" style={{ animationDelay: '0.1s' }}>
                        <h3 className="chart-title">Expense Breakdown</h3>
                        <p className="chart-subtitle">By category</p>
                        <div className="chart-container">
                            <Doughnut data={pieData} options={doughnutOptions} />
                        </div>
                    </div>
                )}
            </div>
            {/* If we have forecast, show pie chart in a new row or grid */}
            {forecastData && pieData && (
                <div className="charts-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <div className="chart-card slide-in" style={{ animationDelay: '0.2s' }}>
                        <h3 className="chart-title">Expense Breakdown</h3>
                        <p className="chart-subtitle">By category</p>
                        <div className="chart-container">
                            <Doughnut data={pieData} options={doughnutOptions} />
                        </div>
                    </div>

                    {inventoryData && (
                        <div className="chart-card slide-in" style={{ animationDelay: '0.2s' }}>
                            <h3 className="chart-title">Inventory Health</h3>
                            <p className="chart-subtitle">Current Stock Levels</p>
                            <div className="chart-container">
                                <Bar
                                    data={inventoryData}
                                    options={{
                                        ...chartOptions,
                                        scales: { x: { display: true }, y: { beginAtZero: true } },
                                        onClick: (evt, element) => {
                                            if (element.length > 0) {
                                                const index = element[0].index;
                                                const product = inventoryData.datasets[0].inventoryItems[index];
                                                handleOpenModal(product);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {netSalesData && (
                <div className="chart-card slide-in" style={{ marginTop: '20px', animationDelay: '0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 className="chart-title">Net Sales Analysis</h3>
                            <p className="chart-subtitle">Long-term Performance</p>
                        </div>
                        <select
                            className="chart-select"
                            value={salesRange}
                            onChange={(e) => setSalesRange(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                fontSize: '14px',
                                fontFamily: 'Inter',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">1 Year</option>
                            <option value="3years">3 Years</option>
                            <option value="5years">5 Years</option>
                            <option value="10years">10 Years</option>
                        </select>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <Line data={netSalesData} options={chartOptions} />
                    </div>
                </div>
            )}
            {isModalOpen && selectedProduct && (
                <ProductAnalyticsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    product={selectedProduct}
                    businessId={selectedBusiness._id}
                />
            )}
        </div>
    );
};

export default Dashboard;
