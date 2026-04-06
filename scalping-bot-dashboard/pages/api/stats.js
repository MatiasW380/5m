// pages/api/stats.js
export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);

try {
// Leer desde el servidor API en PythonAnywhere
const response = await fetch(‘https://Matiasbarone.pythonanywhere.com:5000/api/stats’);
const data = await response.json();

```
res.status(200).json(data);
```

} catch (error) {
console.error(‘Error:’, error);
res.status(200).json({
stats: {
total_trades: 0, wins: 0, losses: 0, win_rate: 0,
total_return: 0, avg_return: 0, max_win: 0, max_loss: 0,
tp_count: 0, sl_count: 0,
error: error.message
}
});
}
}
