// App.js
import React, { useContext } from 'react';
// 1. Importe o ActivityIndicator para mostrar o "carregando..."
import { SafeAreaView, StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { AppProvider, AppContext } from './src/context/AppContext';
import { THEME } from './src/constants/theme';
import LoginScreen from './src/screens/LoginScreen';
import MainApp from './src/navigation/MainApp';

function AppContent() {
  // 2. Pegamos o novo estado 'isLoading' do contexto
  const { isAuthenticated, isLoading } = useContext(AppContext);

  // 3. Se o app ainda estiver verificando a autenticação, mostre a tela de loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  // 4. Apenas depois do carregamento, decidimos qual tela mostrar
  return (
    <View style={styles.container}>
      {isAuthenticated ? <MainApp /> : <LoginScreen />}
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.background} />
        <AppContent />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  container: {
    flex: 1,
  },
  // 5. Novo estilo para a tela de carregamento
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  }
});