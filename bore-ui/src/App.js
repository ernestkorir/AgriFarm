import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Tractor, PlusCircle } from 'lucide-react';
const [assetForm, setAssetForm] = useState({ name: '', purchase_price: '' });

function App() {
  const [data, setData] = useState({ profit: 0, assets: [] });
  const [form, setForm] = useState({ category: '', amount: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get('http://127.0.0.1:3000/api/summary');
    setData(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Changed URL to /api/transaction and added 'type'
    await axios.post('http://127.0.0.1:3000/api/transaction', {
      ...form,
      type: 'Expense'
    });
    setForm({ category: '', amount: '' });
    fetchData();

    const handleAssetSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post('http://127.0.0.1:5000/api/assets', assetForm);
        setAssetForm({ name: '', purchase_price: '' }); // Reset form
        fetchData(); // Refresh the list
      } catch (err) {
        console.error("Error adding asset:", err);
      }
    };
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ color: '#111827' }}>Bore Agri Management</h1>

      {/* Financial Summary Card */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280' }}>
            <Wallet size={20} /> <span>Net Profit</span>
          </div>
          <h2 style={{ fontSize: '32px', color: data.profit >= 0 ? '#10b981' : '#ef4444' }}>
            ${data.profit.toLocaleString()}
          </h2>
        </div>

        <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280' }}>
            <Tractor size={20} /> <span>Total Assets</span>
          </div>
          <h2 style={{ fontSize: '32px' }}>{data.assets.length}</h2>
        </div>
      </div>

      {/* Expense Form */}
      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', marginBottom: '30px' }}>
        <h3><PlusCircle size={18} /> Quick Expense Log</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text" placeholder="Category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ padding: '10px', flex: 1 }}
          />
          <input
            type="number" placeholder="Amount"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            style={{ padding: '10px', flex: 1 }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px' }}>
            Log Expense
          </button>
        </form>
      </div>

      {/* Assets Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f3f4f6' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '15px' }}>Asset Name</th>
              <th style={{ textAlign: 'left', padding: '15px' }}>Purchase Value</th>
              <th style={{ textAlign: 'left', padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.assets.map((asset, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '15px' }}>{asset.name}</td>
                <td style={{ padding: '15px' }}>${asset.price}</td>
                <td style={{ padding: '15px' }}><strong>{asset.status}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;