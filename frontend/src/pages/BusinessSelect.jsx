import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import './BusinessSelect.css';

const BusinessSelect = () => {
    const [businesses, setBusinesses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newBusiness, setNewBusiness] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);
    const { setSelectedBusiness } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/business');
            setBusinesses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (business) => {
        setSelectedBusiness(business);
        navigate('/dashboard');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/business', newBusiness);
            setBusinesses([...businesses, data]);
            setShowModal(false);
            setNewBusiness({ name: '', description: '' });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="business-loading">
                <div className="spinner"></div>
                <p>Loading businesses...</p>
            </div>
        );
    }

    return (
        <div className="business-page">
            <div className="business-container fade-in">
                <div className="business-header">
                    <div className="header-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="business-title">Select Your Business</h1>
                    <p className="business-subtitle">Choose a business to manage or create a new one</p>
                </div>

                <div className="business-grid">
                    {businesses.map((business, index) => (
                        <div
                            key={business._id}
                            className="business-card scale-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => handleSelect(business)}
                        >
                            <div className="business-card-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="business-card-content">
                                <h3 className="business-card-title">{business.name}</h3>
                                <p className="business-card-description">
                                    {business.description || 'No description provided'}
                                </p>
                            </div>
                            <div className="business-card-arrow">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    ))}

                    <div
                        className="business-card business-card-create scale-in"
                        style={{ animationDelay: `${businesses.length * 0.1}s` }}
                        onClick={() => setShowModal(true)}
                    >
                        <div className="create-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="create-title">Create New Business</h3>
                        <p className="create-subtitle">Start managing a new business</p>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Business</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="modal-form">
                            <div className="input-group">
                                <label htmlFor="name">Business Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newBusiness.name}
                                    onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                                    placeholder="e.g., My Coffee Shop"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="description">Description (Optional)</label>
                                <textarea
                                    id="description"
                                    value={newBusiness.description}
                                    onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                                    placeholder="Brief description of your business"
                                    rows="3"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Business
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessSelect;
