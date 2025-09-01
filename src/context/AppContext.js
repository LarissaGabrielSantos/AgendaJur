// src/context/AppContext.js
import React, { useState, createContext, useMemo } from 'react';

export const AppContext = createContext();

// E-mail do administrador. Qualquer um logado com este e-mail terá acesso total.
const ADMIN_EMAIL = 'jsa1@admin_';

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
  // --- 1. NOVO ESTADO PARA ARMAZENAR OS LOGS ---
  const [logEntries, setLogEntries] = useState([]);

  const isAdmin = useMemo(() => {
    return currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }, [currentUser]);

  // --- 2. FUNÇÃO CENTRAL PARA ADICIONAR LOGS ---
  const addLogEntry = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message,
      type, // 'add', 'delete', 'update', 'auth'
    };
    // Adiciona a nova entrada no início do array
    setLogEntries(prev => [newLog, ...prev]);
  };


  const addHearing = (hearing) => {
    // Log da ação
    addLogEntry(`Processo "${hearing.processNumber}" adicionado para ${hearing.clientEmail}.`, 'add');
    setHearings(prev => [...prev, { ...hearing, id: Date.now() }].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };
  
  const deleteHearing = (id) => {
    const hearingToDelete = hearings.find(h => h.id === id);
    if (hearingToDelete) {
      // Log da ação
      addLogEntry(`Processo "${hearingToDelete.processNumber}" excluído.`, 'delete');
    }
    setHearings(prev => prev.filter(hearing => hearing.id !== id));
  };

  const updateHearing = (id, updatedHearing) => {
    // Log da ação
    addLogEntry(`Processo "${updatedHearing.processNumber}" atualizado.`, 'update');
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
      // Log da ação
      addLogEntry(`Usuário "${userFound.fullName}" (${userFound.role}) fez login.`, 'auth');
      setIsAuthenticated(true);
      setCurrentUser(userFound);
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

    // Log da ação
    addLogEntry(`Novo cliente "${fullName}" cadastrado com o e-mail ${email}.`, 'add');
    const newUser = { fullName, email, password, role: 'client' }; 
    setUsers(prevUsers => [...prevUsers, newUser]);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      // Log da ação
      addLogEntry(`Usuário "${currentUser.fullName}" fez logout.`, 'auth');
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // --- 3. EXPÕE O ESTADO DE LOGS NO CONTEXTO ---
  const value = {
    isAuthenticated,
    currentUser,
    isAdmin,
    hearings,
    users,
    logEntries, // Disponibiliza os logs para a nova tela
    addHearing,
    deleteHearing,
    updateHearing,
    login,
    logout,
    signUp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};