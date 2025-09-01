// src/navigation/MainApp.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// --- 1. IMPORTAÇÕES ADICIONADAS ---
import { Calendar, Plus, LogOut, List, History } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import HomeScreen from '../screens/HomeScreen';
import AddHearingScreen from '../screens/AddHearingScreen';
import ViewHearingsScreen from '../screens/ViewHearingsScreen';
import ConfirmationModal from '../components/ConfirmationModal';
// Importa a nova tela de Log
import LogScreen from '../screens/LogScreen'; 

// Importa a logo
import Logo from '../assets/images/logo.png';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const { logout, isAdmin } = useContext(AppContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const renderScreen = () => {
    // ALTERADO: Redireciona se cliente tentar acessar 'add' OU 'log'
    if (!isAdmin && (activeTab === 'add' || activeTab === 'log')) {
      return <HomeScreen />;
    }
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'add': return <AddHearingScreen onHearingAdded={() => setActiveTab('view')} />;
      case 'view': return <ViewHearingsScreen />;
      case 'log': return <LogScreen />; // Adiciona a rota para a tela de log
      default: return <HomeScreen />;
    }
  };

  const TabButton = ({ name, icon: Icon, label }) => (
    <TouchableOpacity onPress={() => setActiveTab(name)} style={styles.tabButton}>
      <Icon size={24} color={activeTab === name ? THEME.primary : THEME.textSecondary} />
      <Text style={[styles.tabLabel, { color: activeTab === name ? THEME.primary : THEME.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        message="Deseja realmente sair?"
      />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={Logo} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>AgendaJur</Text>
        </View>
        <TouchableOpacity onPress={() => setShowLogoutConfirm(true)}>
          <LogOut size={24} color={THEME.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <View style={styles.footer}>
        <TabButton name="home" icon={Calendar} label="Início" />
        
        {/* --- 2. BOTÃO DE LOG ADICIONADO AQUI --- */}
        {isAdmin && (
          <>
            <TabButton name="add" icon={Plus} label="Cadastrar" />
            <TabButton name="log" icon={History} label="Log" />
          </>
        )}

        <TabButton name="view" icon={List} label="Ver Andamentos" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(169, 169, 169, 0.2)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  headerTitle: {
    color: THEME.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderColor: 'rgba(169, 169, 169, 0.2)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});