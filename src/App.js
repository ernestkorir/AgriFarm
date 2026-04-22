import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Tractor, TrendingUp } from 'lucide-react';

// Switches between local development and your Vercel URL automatically
const API_BASE = window.location.hostname === "localhost"
  ? "http://127.0.0.1:5000/api"
  : "/api";

function App() {
  const [data, setData] = useState({ profit: 0, total_income: 0, total_expenses: 0, assets: [], transactions: [] });
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
      console.error("Connection Error:", err);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/transaction`, txForm);
      setTxForm({ ...txForm, category: '', amount: '' });
      fetchData();
    } catch (err) { alert("Failed to log transaction. Check internet connection."); }
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/assets`, assetForm);
      setAssetForm({ name: '', purchase_price: '' });
      fetchData();
    } catch (err) { alert("Failed to add asset."); }
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#111827' }}>Bore AgriBuz</h1>
        <p style={{ color: '#6b7280' }}>Financial Management System</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Net Profit" value={`$${data.profit.toLocaleString()}`} color={data.profit >= 0 ? '#10b981' : '#ef4444'} icon={<Wallet />} />
        <StatCard title="Income" value={`$${data.total_income.toLocaleString()}`} color="#2563eb" icon={<TrendingUp />} />
        <StatCard title="Assets" value={data.assets.length} color="#1f2937" icon={<Tractor />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <Section title="Log Transaction">
          <form onSubmit={handleTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value })} style={inputStyle}>
              <option value="Expense">Expense</option>
              <option value="Income">Income (Sale)</option>
            </select>
            <input type="text" placeholder="Category" value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })} style={inputStyle} required />
            <input type="number" placeholder="Amount" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} style={inputStyle} required />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#2563eb' }}>Save</button>
          </form>
        </Section>

        <Section title="Register Asset">
          <form onSubmit={handleAssetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Machine Name" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} style={inputStyle} required />
            <input type="number" placeholder="Price" value={assetForm.purchase_price} onChange={e => setAssetForm({ ...assetForm, purchase_price: e.target.value })} style={inputStyle} required />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669' }}>Add Asset</button>
          </form>
        </Section>
      </div>

      <Section title="Transaction Ledger">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f3f4f6' }}>
              <th style={thStyle}>Date</th><th style={thStyle}>Category</th><th style={thStyle}>Type</th><th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>{t.date}</td>
                <td style={tdStyle}>{t.category}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: t.type === 'Income' ? '#d1fae5' : '#fee2e2', color: t.type === 'Income' ? '#065f46' : '#991b1b' }}>{t.type}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', color: t.type === 'Income' ? '#10b981' : '#ef4444' }}>
                  {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

const StatCard = ({ title, value, color, icon }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>{icon} {title}</div>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{title}</h3>
    {children}
  </div>
);

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' };
const btnStyle = { padding: '12px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const thStyle = { padding: '12px', color: '#6b7280', fontWeight: 'normal' };
const tdStyle = { padding: '12px' };

export default App;