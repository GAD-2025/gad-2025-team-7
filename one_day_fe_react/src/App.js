import React from 'react';
import Home from './Home';
import Login from './Login'; // Import the Login component

function App() {
  const path = window.location.pathname;

  let Component;
  switch (path) {
    case '/login':
      Component = Login;
      break;
    case '/':
    default:
      Component = Home;
      break;
  }

  return (
    <div className="App">
      <Component />
    </div>
  );
}

export default App;
