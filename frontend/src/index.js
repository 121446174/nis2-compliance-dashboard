// Source: Stack Overflow - How to import "Route, Router and Switch" correctly in React
// URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';


// Wraps the main application in <React.StrictMode> to enforce best practices.
// Renders the App component into an HTML element with an ID of root.
ReactDOM.render( 
  <React.StrictMode> 
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);



