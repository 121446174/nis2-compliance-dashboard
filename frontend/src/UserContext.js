// Inspired Source: https://www.taniarascia.com/using-context-api-in-react/
// Modifications = Added multiple states (userId, classificationType, sectorId).
// Integrated useEffect to load initial state from localStorage.
// Provided a login function to update context and localStorage.

import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [classificationType, setClassificationType] = useState(null);
  const [sectorId, setSectorId] = useState(null); // New state for Sector_ID

  // Load from localStorage when the app starts
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); // load from localStorage
    const storedClassificationType = localStorage.getItem('classificationType');
    const storedSectorId = localStorage.getItem('sectorId'); // Load Sector_ID from localStorage

    if (storedUserId) setUserId(storedUserId); // if loaded stored in setUserid state
    if (storedClassificationType) setClassificationType(storedClassificationType);
    if (storedSectorId) setSectorId(storedSectorId);
  }, []);

  const login = (id, type, sector) => {
    setUserId(id);
    setClassificationType(type);
    setSectorId(sector); // store new user info

    localStorage.setItem('userId', id);
    localStorage.setItem('classificationType', type);
    localStorage.setItem('sectorId', sector); // Store Sector_ID in localStorage
  };

  return (
    <UserContext.Provider value={{ userId, classificationType, sectorId, login }}>
      {children}
    </UserContext.Provider>
  );
};