// src/context/AppContext.js
import React, { useState, createContext, useMemo } from 'react';

export const AppContext = createContext();

// E-mail do administrador. Qualquer um logado com este e-mail terá acesso total.
const ADMIN_EMAIL = 'fufu@admin.com';

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [hearings, setHearings] = useState([]);
  
  const [users, setUsers] = useState([
    {
      fullName: 'Dr. José Sérgio',
      email: 'jsa1@admin_',
      password: 'fufu',
      role: 'admin', 
    }
  ]);

  // Verificador de permissão de administrador
  const isAdmin = useMemo(() => {
    return currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }, [currentUser]);

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

  const login = (email, password) => {
    const userFound = users.find(
      user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (userFound) {
      setIsAuthenticated(true);
      setCurrentUser(userFound); // Salva o usuário inteiro (incluindo o papel)
      return true;
    }
    return false;
  };

  const signUp = (fullName, email, password) => {
    const userExists = users.some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return { success: false, message: 'Este e-mail já está em uso.' };
    }

    // Todo novo usuário cadastrado recebe o papel de 'client'
    const newUser = { fullName, email, password, role: 'client' }; 
    setUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const value = {
    isAuthenticated,
    currentUser,
    isAdmin, // Disponibiliza a verificação de admin para o app
    hearings,
    users,
    addHearing,
    deleteHearing,
    updateHearing,
    login,
    logout,
    signUp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};