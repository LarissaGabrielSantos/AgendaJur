// src/context/AppContext.js
import React, { useState, createContext, useEffect, useMemo } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hearings, setHearings] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = useMemo(() => {
    return currentUser?.email.toLowerCase() === 'escritoriojsaraujoadvogados@gmail.com';
  }, [currentUser]);

  const addLogEntry = async (message, type = 'info') => {
    try {
      const newLog = {
        timestamp: firestore.FieldValue.serverTimestamp(),
        message,
        type,
        userEmail: currentUser?.email || 'sistema',
      };
      await firestore().collection('logs').add(newLog);
    } catch (error) {
      console.error("Erro ao adicionar log:", error);
    }
  };

  const login = (email, password) => {
    return auth().signInWithEmailAndPassword(email, password);
  };

  const signUp = (fullName, email, password) => {
    return auth().createUserWithEmailAndPassword(email, password)
      .then(credentials => {
        return firestore().collection('users').doc(credentials.user.uid).set({
          fullName,
          email,
          role: 'client',
        });
      });
  };

  // --- FUNÇÃO DE LOGOUT CORRIGIDA ---
  // Transformada em async para garantir a ordem das operações
  const logout = async () => {
    if (currentUser) {
      // 1. Espera (await) o log ser escrito ANTES de continuar.
      await addLogEntry(`Usuário "${currentUser.email}" fez logout.`, 'auth');
    }
    // 2. Só depois que o log foi escrito, encerra a sessão.
    return auth().signOut();
  };
  
  const resetPassword = (email) => {
    return auth().sendPasswordResetEmail(email);
  };

  const addHearing = (hearingData) => {
    addLogEntry(`Processo "${hearingData.processNumber}" adicionado para ${hearingData.clientEmail}.`, 'add');
    return firestore().collection('hearings').add(hearingData);
  };

  const updateHearing = (id, updatedData) => {
    addLogEntry(`Processo "${updatedData.processNumber}" atualizado.`, 'update');
    return firestore().collection('hearings').doc(id).update(updatedData);
  };

  const deleteHearing = (id) => {
    firestore().collection('hearings').doc(id).get().then(doc => {
      if (doc.exists) {
        addLogEntry(`Processo "${doc.data().processNumber}" excluído.`, 'delete');
      }
    });
    return firestore().collection('hearings').doc(id).delete();
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setCurrentUser({ ...user.toJSON(), ...userDoc.data() });
        } else {
          setCurrentUser(user.toJSON());
        }
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });
    
    return subscriber;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setHearings([]);
      setLogEntries([]);
      return;
    }

    let hearingsQuery = firestore().collection('hearings');
    if (!isAdmin) {
      hearingsQuery = hearingsQuery.where('clientEmail', '==', currentUser.email);
    }

    const subscriberHearings = hearingsQuery.onSnapshot(
      (querySnapshot) => {
        const hearingsData = [];
        if (querySnapshot) {
          querySnapshot.forEach(doc => {
            hearingsData.push({ ...doc.data(), id: doc.id });
          });
        }
        setHearings(hearingsData.sort((a, b) => new Date(a.date) - new Date(b.date)));
      },
      (error) => { console.error("Erro ao buscar audiências: ", error); }
    );

    let subscriberLogs;
    if (isAdmin) {
      subscriberLogs = firestore().collection('logs').orderBy('timestamp', 'desc').limit(100)
        .onSnapshot(
          (querySnapshot) => {
            const logsData = [];
            if (querySnapshot) {
              querySnapshot.forEach(doc => {
                logsData.push({ ...doc.data(), id: doc.id });
              });
            }
            setLogEntries(logsData);
          },
          (error) => { console.error("Erro ao buscar logs: ", error); }
        );
    }

    return () => {
      if (subscriberHearings) subscriberHearings();
      if (subscriberLogs) subscriberLogs();
    };
  }, [currentUser, isAdmin]);

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    hearings,
    logEntries,
    isLoading,
    login,
    logout,
    signUp,
    resetPassword,
    addHearing,
    updateHearing,
    deleteHearing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};