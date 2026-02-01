import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import './AddTransaction.css';

const AddTransaction = () => {
    const { selectedBusiness } = useContext(AuthContext);
    const [type, setType] = useState('SALE');
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        productId: '',
        quantity: 1,
        date: new Date().toISOString().split('T')[0]
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedBusiness && type === 'SALE') {
            fetchProducts();
        }
    }, [selectedBusiness, type]);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`/inventory/${selectedBusiness._id}`);
            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p._id === productId);

        let newAmount = formData.amount;
        if (product) {
            newAmount = (product.sellingPrice * formData.quantity).toFixed(2);
        }

        setFormData({
            ...formData,
            productId,
            amount: newAmount || '' // Keep empty if no product or 0
        });
    };

    const handleQuantityChange = (e) => {
        const quantity = parseInt(e.target.value) || 0;
        const product = products.find(p => p._id === formData.productId);

        let newAmount = formData.amount;
        if (product) {
            newAmount = (product.sellingPrice * quantity).toFixed(2);
        }

        setFormData({
            ...formData,
            quantity,
            amount: newAmount || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                businessId: selectedBusiness._id,
                type,
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: formData.date
            };

            if (type === 'SALE' && formData.productId) {
                payload.productId = formData.productId;
                payload.quantity = parseInt(formData.quantity);
            }

            await axios.post('/transactions', payload);
            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to add transaction');
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
                <h2>Transaction Added!</h2>
            </div>
        );
    }

    return (
        <div className="transaction-page">
            <div className="transaction-container fade-in">
                <div className="transaction-header">
                    <h1 className="transaction-title">Add Transaction</h1>
                    <p className="transaction-subtitle">{selectedBusiness.name}</p>
                </div>

                <div className="type-selector">
                    <button
                        className={`type-btn ${type === 'SALE' ? 'active' : ''}`}
                        onClick={() => setType('SALE')}
                    >
                        Sale
                    </button>
                    <button
                        className={`type-btn ${type === 'EXPENSE' ? 'active' : ''}`}
                        onClick={() => setType('EXPENSE')}
                    >
                        Expense
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="transaction-form">
                    {type === 'SALE' && (
                        <div className="input-group">
                            <label htmlFor="productId">Product</label>
                            <select
                                id="productId"
                                name="productId"
                                value={formData.productId}
                                onChange={handleProductChange}
                                required
                            >
                                <option value="">Select a product</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} (Stock: {product.stock})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type === 'SALE' && formData.productId && (
                        <div className="input-group">
                            <label htmlFor="quantity">Quantity</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                min="1"
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="amount">Amount ($)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="category">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder={type === 'SALE' ? 'e.g., Retail' : 'e.g., Rent, Utilities'}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;
