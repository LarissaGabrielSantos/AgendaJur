// App.js
import React, { useContext } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { AppProvider, AppContext } from './src/context/AppContext';
import { THEME } from './src/constants/theme';
import LoginScreen from './src/screens/LoginScreen';
import MainApp from './src/navigation/MainApp';

function AppContent() {
  const { isAuthenticated } = useContext(AppContext);

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
});