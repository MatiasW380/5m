// pages/api/trades.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const botDir = '/home/Matiasbarone/scalping_bot';
  const tradesFile = path.join(botDir, 'trades.csv');
  
  try {
    if (!fs.existsSync(tradesFile)) {
      return res.status(200).json({ trades: [] });
    }
    
    const data = fs.readFileSync(tradesFile, 'utf8');
    const lines = data.trim().split('\n');
    const header = lines[0].split(',');
    
    const trades = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        timestamp: values[header.indexOf('timestamp')],
        side: values[header.indexOf('side')],
        entry_price: parseFloat(values[header.indexOf('entry_price')]),
        exit_price: parseFloat(values[header.indexOf('exit_price')]),
        roi_pct: parseFloat(values[header.indexOf('roi_pct')]),
        reason: values[header.indexOf('reason')],
        win: values[header.indexOf('win')] === 'YES',
      };
    });
    
    res.status(200).json({ trades });
  } catch (error) {
    res.status(200).json({ trades: [], error: error.message });
  }
}
