import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import ProductAnalyticsModal from '../components/ProductAnalyticsModal';
import './InventoryList.css';

const InventoryList = () => {
    const { selectedBusiness } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (selectedBusiness) {
            fetchInventory();
        }
    }, [selectedBusiness]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/inventory/${selectedBusiness._id}`);
            setInventory(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    return (
        <div className="inventory-list-page fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventory Model</h1>
                    <p className="page-subtitle">{selectedBusiness?.name} • {inventory.length} Products</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/add-inventory')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Add Product
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading inventory...</p>
                </div>
            ) : (
                <div className="inventory-grid-container">
                    {inventory.length > 0 ? (
                        <div className="inventory-grid">
                            {inventory.map((item) => (
                                <div key={item._id} className="product-card">
                                    <div className="product-icon">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="product-details">
                                        <h3>{item.name}</h3>
                                        <p className="product-meta">Stock: <span className={item.stock < 10 ? 'low-stock' : ''}>{item.stock}</span></p>
                                    </div>
                                    <div className="product-pricing">
                                        <div className="price-row">
                                            <span>Cost:</span>
                                            <span>${item.costPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="price-row">
                                            <span>Price:</span>
                                            <span>${item.sellingPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-analyze"
                                        onClick={() => handleOpenModal(item)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                        </svg>
                                        Analyze
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No products found.</p>
                            <button className="btn-text" onClick={() => navigate('/add-inventory')}>Add your first product</button>
                        </div>
                    )}
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

export default InventoryList;
