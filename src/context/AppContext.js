// src/context/AppContext.js
import React, { useState, createContext } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hearings, setHearings] = useState([]);

  const addHearing = (hearing) => {
    setHearings(prev => [...prev, { ...hearing, id: Date.now() }].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };
  
  const deleteHearing = (id) => {
    setHearings(prev => prev.filter(hearing => hearing.id !== id));
  };

  const updateHearing = (id, updatedHearing) => {
    setHearings(prev => 
      prev.map(hearing => (hearing.id === id ? updatedHearing : hearing))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
    );
  };

  const login = (password) => {
    if (password === '1234') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    hearings,
    addHearing,
    deleteHearing,
    updateHearing,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};