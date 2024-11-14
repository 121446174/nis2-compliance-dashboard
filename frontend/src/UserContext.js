import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [classificationType, setClassificationType] = useState(null);

  // Load from localStorage when the app starts
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedClassificationType = localStorage.getItem('classificationType');
    if (storedUserId) setUserId(storedUserId);
    if (storedClassificationType) setClassificationType(storedClassificationType);
  }, []);

  const login = (id, type) => {
    setUserId(id);
    setClassificationType(type);
    localStorage.setItem('userId', id);
    localStorage.setItem('classificationType', type);
  };

  return (
    <UserContext.Provider value={{ userId, classificationType, login }}>
      {children}
    </UserContext.Provider>
  );
};




