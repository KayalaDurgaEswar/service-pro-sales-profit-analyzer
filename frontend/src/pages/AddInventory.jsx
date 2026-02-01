import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import './AddInventory.css';

const AddInventory = () => {
    const { selectedBusiness } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        costPrice: '',
        sellingPrice: '',
        stock: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/inventory', {
                businessId: selectedBusiness._id,
                name: formData.name,
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                stock: parseInt(formData.stock),
                description: formData.description
            });

            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to add inventory item');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedBusiness) {
        return (
            <div className="no-business">
                <p>Please select a business first</p>
                <button className="btn btn-primary" onClick={() => navigate('/business-select')}>
                    Select Business
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="success-page">
                <div className="success-icon scale-in">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2>Inventory Item Added!</h2>
                <p>Redirecting to dashboard...</p>
            </div>
        );
    }

    const profit = formData.sellingPrice && formData.costPrice
        ? (parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)).toFixed(2)
        : '0.00';

    const margin = formData.sellingPrice && formData.costPrice && parseFloat(formData.sellingPrice) > 0
        ? (((parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.sellingPrice)) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="inventory-page">
            <div className="inventory-container fade-in">
                <div className="inventory-header">
                    <div className="header-icon-small">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <h1 className="inventory-title">Add Inventory Item</h1>
                    <p className="inventory-subtitle">{selectedBusiness.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="inventory-form">
                    <div className="input-group">
                        <label htmlFor="name">Product Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Coffee Beans"
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="costPrice">Cost Price ($)</label>
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="sellingPrice">Selling Price ($)</label>
                            <input
                                type="number"
                                id="sellingPrice"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {(formData.costPrice || formData.sellingPrice) && (
                        <div className="profit-indicator scale-in">
                            <div className="profit-item">
                                <span className="profit-label">Profit per unit:</span>
                                <span className="profit-value">${profit}</span>
                            </div>
                            <div className="profit-item">
                                <span className="profit-label">Profit margin:</span>
                                <span className="profit-value">{margin}%</span>
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="stock">Initial Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add product details..."
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    Add to Inventory
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInventory;
