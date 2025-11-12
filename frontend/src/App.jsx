import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data));
  }, []);

  return (
    <div>
      <h1>ATS</h1>
      <p>Backend: {health?.status || 'connecting...'}</p>
    </div>
  );
}

export default App;

