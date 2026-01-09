import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = process.env.API_URL || 'http://localhost:8000';

function App() {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Failed to connect to API'));
  }, []);

  return (
    <div className="app">
      <h1>{message}</h1>
    </div>
  );
}

export default App;
