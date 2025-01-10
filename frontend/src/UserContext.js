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

  // Initialize from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedClassificationType = localStorage.getItem('classificationType');
    const storedSectorId = localStorage.getItem('sectorId');
    
    console.log('UserContext - Loaded from localStorage:', {
      storedUserId,
      storedClassificationType,
      storedSectorId,
  });

  if (storedUserId) setUserId(parseInt(storedUserId, 10));
  if (storedClassificationType) setClassificationType(storedClassificationType);
  if (storedSectorId && storedSectorId !== '') setSectorId(parseInt(storedSectorId, 10));
  else console.error('UserContext - Missing required data in localStorage. Check login flow.');
}, []);

  //Login method
  const login = (id, type, sector) => {
    console.log('UserContext - Before Login:', { id, type, sector });
    if (!sector) {
      console.error('UserContext - Missing sectorId. Check backend response or login logic.');
      return; // Exit early to avoid inconsistencies
  }
    setUserId(id);
    setClassificationType(type);
    setSectorId(sector);

    // Save to localStorage
    localStorage.setItem('userId', id);
    localStorage.setItem('classificationType', type);
    localStorage.setItem('sectorId', sector || '');

    console.log('UserContext - After Login:', { id, type, sector });
  };

  console.log('UserContext - Current State:', { userId, classificationType, sectorId });

  return (
    <UserContext.Provider value={{ userId, classificationType, sectorId, login }}>
      {children}
    </UserContext.Provider>
  );
};
