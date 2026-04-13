import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Tractor, PlusCircle, TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE = "http://127.0.0.1:5000/api";

function App() {
  const [data, setData] = useState({ profit: 0, total_income: 0, total_expenses: 0, assets: [] });
  const [txForm, setTxForm] = useState({ category: '', amount: '', type: 'Expense' });
  const [assetForm, setAssetForm] = useState({ name: '', purchase_price: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/summary`);
      setData(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/transaction`, txForm);
      setTxForm({ ...txForm, category: '', amount: '' });
      fetchData();
    } catch (err) {
      alert("Check if Backend is running at http://127.0.0.1:5000");
    }
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/assets`, assetForm);
      setAssetForm({ name: '', purchase_price: '' });
      fetchData();
    } catch (err) {
      alert("Failed to add asset. Check backend logs.");
    }
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#111827', marginBottom: '30px' }}>Bore AgriFarm | Super User</h1>

      {/* FINANCIAL CARDS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280' }}>
            <Wallet size={20} /> <span>Net Profit</span>
          </div>
          <h2 style={{ fontSize: '32px', color: data.profit >= 0 ? '#10b981' : '#ef4444' }}>
            ${data.profit.toLocaleString()}
          </h2>
        </div>
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280' }}>
            <Tractor size={20} /> <span>Total Assets</span>
          </div>
          <h2 style={{ fontSize: '32px' }}>{data.assets.length}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* FINANCE FORM */}
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <h3><TrendingUp size={18} /> Transactions</h3>
          <form onSubmit={handleTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })} style={{ padding: '10px' }}>
              <option value="Expense">Expense</option>
              <option value="Income">Income (Sale)</option>
            </select>
            <input type="text" placeholder="Category" value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })} style={{ padding: '10px' }} required />
            <input type="number" placeholder="Amount" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} style={{ padding: '10px' }} required />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px' }}>Save</button>
          </form>
        </div>
        {/* Add this inside your return() after the Summary Cards */}
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>Financial Health Indicators</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', margin: 0 }}>Profit Margin</p>
              <h4 style={{ fontSize: '24px', margin: '10px 0' }}>
                {data.total_income > 0
                  ? ((data.profit / data.total_income) * 100).toFixed(1)
                  : 0}%
              </h4>
            </div>
            <div style={{ borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
              <p style={{ color: '#6b7280', margin: 0 }}>Expense Ratio</p>
              <h4 style={{ fontSize: '24px', margin: '10px 0' }}>
                {data.total_income > 0
                  ? ((data.total_expenses / data.total_income) * 100).toFixed(1)
                  : 0}%
              </h4>
            </div>
          </div>
        </div>
        {/* TRANSACTION HISTORY TABLE */}
        <div style={{ marginTop: '30px', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: 0 }}>Transaction Ledger</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions && data.transactions.length > 0 ? data.transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>{t.date}</td>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{t.category}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      backgroundColor: t.type === 'Income' ? '#d1fae5' : '#fee2e2',
                      color: t.type === 'Income' ? '#065f46' : '#991b1b'
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{
                    padding: '15px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: t.type === 'Income' ? '#10b981' : '#ef4444'
                  }}>
                    {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No transactions recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ASSET FORM */}
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px' }}>
          <h3><PlusCircle size={18} /> Register Asset</h3>
          <form onSubmit={handleAssetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Machine Name" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} style={{ padding: '10px' }} required />
            <input type="number" placeholder="Price" value={assetForm.purchase_price} onChange={e => setAssetForm({ ...assetForm, purchase_price: e.target.value })} style={{ padding: '10px' }} required />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px' }}>Add Asset</button>
          </form>
        </div>
      </div>

      {/* ASSET TABLE */}
      <div style={{ marginTop: '30px', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr><th style={{ padding: '15px', textAlign: 'left' }}>Asset</th><th style={{ padding: '15px', textAlign: 'left' }}>Value</th><th style={{ padding: '15px', textAlign: 'left' }}>Status</th></tr>
          </thead>
          <tbody>
            {data.assets.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{a.name}</td>
                <td style={{ padding: '15px' }}>${a.price.toLocaleString()}</td>
                <td style={{ padding: '15px' }}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;