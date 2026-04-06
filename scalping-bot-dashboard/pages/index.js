// pages/index.js
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [tradesRes, statsRes] = await Promise.all([
        fetch('/api/trades'),
        fetch('/api/stats'),
      ]);
      
      const tradesData = await tradesRes.json();
      const statsData = await statsRes.json();
      
      setTrades(tradesData.trades || []);
      setStats(statsData.stats || {});
      setLastUpdate(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }

  const equityCurve = trades.reduce((acc, trade, idx) => {
    const prevEq = idx === 0 ? 100 : acc[idx - 1].equity;
    const newEq = prevEq * (1 + trade.roi_pct / 100 * 0.2);
    acc.push({ time: idx + 1, equity: parseFloat(newEq.toFixed(2)) });
    return acc;
  }, []);

  const wlData = [
    { name: 'Wins', value: stats?.wins || 0, color: '#10b981' },
    { name: 'Losses', value: stats?.losses || 0, color: '#ef4444' },
  ];

  const recentTrades = trades.slice(-10).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 Scalping Bot Dashboard</h1>
          <p className="text-slate-400">BTC-USDC-SWAP | 15m | RSI 25/60 | TP 4%/SL 3% | Cooldown 2/7</p>
          <p className="text-xs text-slate-500 mt-2">Última actualización: {lastUpdate}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Total Trades</p>
            <p className="text-3xl font-bold">{stats?.total_trades || 0}</p>
          </div>

          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-green-400">{stats?.win_rate || 0}%</p>
            <p className="text-xs text-slate-400 mt-1">{stats?.wins || 0}W / {stats?.losses || 0}L</p>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Total Return</p>
            <p className="text-3xl font-bold text-blue-400">{stats?.total_return || 0}%</p>
          </div>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Avg Return</p>
            <p className="text-3xl font-bold text-purple-400">{stats?.avg_return || 0}%</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Max Win</p>
            <p className="text-3xl font-bold text-green-400">{stats?.max_win || 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📈 Equity Curve</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📊 W/L</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={wlData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                  {wlData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📋 Últimos Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400">Hora</th>
                  <th className="text-left py-3 px-4 text-slate-400">Side</th>
                  <th className="text-left py-3 px-4 text-slate-400">Entry</th>
                  <th className="text-left py-3 px-4 text-slate-400">Exit</th>
                  <th className="text-left py-3 px-4 text-slate-400">ROI</th>
                  <th className="text-left py-3 px-4 text-slate-400">Reason</th>
                  <th className="text-left py-3 px-4 text-slate-400">Result</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-4 text-slate-300">{trade.timestamp}</td>
                    <td className={`py-3 px-4 font-bold ${trade.side === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.side}
                    </td>
                    <td className="py-3 px-4 font-mono">${trade.entry_price.toFixed(0)}</td>
                    <td className="py-3 px-4 font-mono">${trade.exit_price.toFixed(0)}</td>
                    <td className={`py-3 px-4 font-bold ${trade.roi_pct > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.roi_pct > 0 ? '+' : ''}{trade.roi_pct}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.reason === 'TP' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {trade.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.win ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
