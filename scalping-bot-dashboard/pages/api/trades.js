// pages/api/trades.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Leer desde el servidor API en PythonAnywhere
    const response = await fetch('https://Matiasbarone.pythonanywhere.com:5000/api/trades');
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ 
      trades: [],
      error: error.message 
    });
  }
}
