# Small Business Sales & Profit Analyzer

## Problem Statement
Small business owners often struggle to track daily sales, distinct expenses, and inventory levels in one place. Calculating the exact profit (considering Cost of Goods Sold) manually is prone to errors. This application solves this by providing a unified dashboard for managing multiple business profiles, tracking transactions, and auto-calculating real-time profit.

## Features
- **Multi-Business Management**: One user can manage profiles for multiple businesses.
- **Transaction Tracking**: Log Sales and Expenses with categories.
- **Inventory Management**: Track stock levels and Cost Price.
- **Real-Time Profit Calculation**: automatically calculates Profit = Sales - Expenses - COGS.
- **Visual Dashboard**: Interactive charts for performance analysis.
- **Inventory Integration**: Automatically reduces stock upon sales.
- **Reporting**: Downloadable Excel reports for offline analysis.

## Modules

### Backend (Node.js + Express)
- **Authentication**: Secure JWT-based login/registration.
- **Business**: Manage business entities.
- **Inventory**: CRUD for products and stock management.
- **Transactions**: Handle Sales (with inventory link) and Expenses.
- **Reports**: Aggregation logic and Excel generation.

### Frontend (React + Vite)
- **Dashboard**: Visual summary using Chart.js.
- **Transaction Entry**: Dynamic forms for sales/expenses.
- **Business Switcher**: specialized UI for managing multiple shops.

## Core Logic
The application employs a **Double-Entry-like** logic for Profit Calculation:
1. **COGS Calculation**: When a Sale is recorded, the system looks up the product's `Cost Price` from Inventory.
2. **Profit Formula**: `Net Profit = Total Sales - Total Expenses - (Cost Price * Quantity Sold)`.
3. **Inventory Adjustment**: Stock is automatically decremented upon a successful sale to prevent overselling.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB ( Running locally )

### Steps
1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App runs on `http://localhost:5173`.

3. **Usage**:
   - Register/Login.
   - Create a Business.
   - Add Inventory items (with Cost Price).
   - Add Transactions (Sales link to Inventory).
   - View Dashboard and Download Reports.
