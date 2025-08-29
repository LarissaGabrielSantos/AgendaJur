import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import Input from '../components/Input';
import Button from '../components/button';

export default function LoginScreen() {
  const { login } = useContext(AppContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!login(password)) {
      setError('Senha incorreta. Tente novamente.');
    } else {
      setError('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>AgendaJur</Text>
        <Text style={styles.subtitle}>Acesso a andamentos de processos</Text>
        <View style={styles.form}>
          <Input 
            label="Senha" 
            value={password} 
            onChangeText={setPassword} 
            placeholder="Digite sua senha" 
            secureTextEntry 
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button onPress={handleLogin}>Entrar</Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * MUDAR O STYLE DE LUGAR
 */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  innerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 40, fontWeight: 'bold', color: THEME.primary, marginBottom: 8 },
  subtitle: { fontSize: 18, color: THEME.textSecondary, marginBottom: 32 },
  form: { width: '100%', maxWidth: 400 },
  errorText: { color: THEME.danger, textAlign: 'center', marginBottom: 16 },
});