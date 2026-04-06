// pages/api/stats.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const botDir = '/home/Matiasbarone/scalping_bot';
  const tradesFile = path.join(botDir, 'trades.csv');
  
  try {
    if (!fs.existsSync(tradesFile)) {
      return res.status(200).json({ stats: { total_trades: 0, wins: 0, losses: 0, win_rate: 0, total_return: 0 } });
    }
    
    const data = fs.readFileSync(tradesFile, 'utf8');
    const lines = data.trim().split('\n');
    const header = lines[0].split(',');
    
    const trades = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        roi_pct: parseFloat(values[header.indexOf('roi_pct')]),
        win: values[header.indexOf('win')] === 'YES',
        reason: values[header.indexOf('reason')]
      };
    });
    
    if (trades.length === 0) {
      return res.status(200).json({ stats: { total_trades: 0, wins: 0, losses: 0, win_rate: 0, total_return: 0 } });
    }
    
    const wins = trades.filter(t => t.win).length;
    const totalReturn = trades.reduce((sum, t) => sum + t.roi_pct, 0);
    
    res.status(200).json({
      stats: {
        total_trades: trades.length,
        wins,
        losses: trades.length - wins,
        win_rate: (wins / trades.length * 100).toFixed(1),
        total_return: totalReturn.toFixed(2),
        avg_return: (totalReturn / trades.length).toFixed(2),
        max_win: Math.max(...trades.map(t => t.roi_pct)).toFixed(2),
        max_loss: Math.min(...trades.map(t => t.roi_pct)).toFixed(2),
        tp_count: trades.filter(t => t.reason === 'TP').length,
        sl_count: trades.filter(t => t.reason === 'SL').length,
      }
    });
  } catch (error) {
    res.status(200).json({ stats: { total_trades: 0, wins: 0, losses: 0, win_rate: 0, total_return: 0, error: error.message } });
  }
}
