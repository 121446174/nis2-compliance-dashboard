// Inspired Source: https://www.taniarascia.com/using-context-api-in-react/
// Modifications = Added multiple states (userId, classificationType, sectorId).
// Integrated useEffect to load initial state from localStorage.
// Provided a login function to update context and localStorage.

import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [classificationType, setClassificationType] = useState(null);
  const [sectorId, setSectorId] = useState(null);

  useEffect(() => {
    const storedSectorId = localStorage.getItem('sectorId');
    if (storedSectorId) setSectorId(storedSectorId);
  }, []);
  
  const login = (id, type, sector) => {
    setUserId(id);
    setClassificationType(type);
    setSectorId(sector);
  
    localStorage.setItem('userId', id);
    localStorage.setItem('classificationType', type);
    localStorage.setItem('sectorId', sector); // Ensure sectorId is saved here
  };
  

  return (
    <UserContext.Provider value={{ userId, classificationType, sectorId, login }}>
      {children}
    </UserContext.Provider>
  );
};