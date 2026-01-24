import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Only Router needed here
import MainAppContent from './MainAppContent'; // Import MainAppContent
import './App.css'; // Ensure App.css is imported

function App() {
  const BASE_WIDTH = 1194; // New base width
  const BASE_HEIGHT = 834; // New base height
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const widthScale = viewportWidth / BASE_WIDTH;
      const heightScale = viewportHeight / BASE_HEIGHT;

      const newScale = Math.min(widthScale, heightScale);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);

    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return (
    <div id="scale-wrapper">
      <div
        id="ipad-root"
        style={{
          width: BASE_WIDTH, // Explicitly set width
          height: BASE_HEIGHT, // Explicitly set height
          transformOrigin: 'center center', // Change origin to center
          position: 'absolute', // Add absolute positioning
          left: '50%', // Center horizontally
          top: '50%', // Center vertically
          transform: `translate(-50%, -50%) scale(${scale})`, // Adjust transform for centering
        }}
      >
          <div id="content-frame" style={{ height: '100%', width: '100%' }}>
            <Router>
              <MainAppContent />
            </Router>
          </div>
      </div>
    </div>
  );
}

export default App;
