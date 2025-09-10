// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react'; 
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext'; 
import { THEME } from '../constants/theme'; 
import Input from '../components/Input'; 
import Button from '../components/button'; // Corrigido para 'B' maiúsculo

import Logo from '../assets/images/logo.png';

const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: "A senha deve ter no mínimo 8 caracteres." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "A senha deve conter ao menos uma letra minúscula." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "A senha deve conter ao menos uma letra maiúscula." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) { 
    return { isValid: false, message: "A senha deve conter ao menos um símbolo (ex: !@#$%)." };
  }
  return { isValid: true, message: "" };
};

export default function LoginScreen() { 
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado de carregamento

  // Pegamos as novas funções do Firebase
  const { login, signUp, resetPassword } = useContext(AppContext); 

  const handleLogin = async () => { 
    if (!email || !password) {
      return setError('Por favor, preencha o e-mail e a senha.');
    }
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
      // O AppContext vai lidar com a navegação ao detectar a mudança de autenticação
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao fazer o login.');
        console.error(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  }; 

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return setError('Por favor, preencha todos os campos.');
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return setError(passwordValidation.message);
    }
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      await signUp(fullName, email, password);
      Alert.alert('Sucesso!', 'Cadastro realizado com sucesso. Faça o login para continuar.');
      switchAuthMode('login'); 
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Ocorreu um erro ao criar a conta.');
        console.error(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return setError('Por favor, digite seu e-mail.');
    }
    setIsSubmitting(true);
    setError('');
    try {
      await resetPassword(email);
      Alert.alert(
        "Verifique seu E-mail",
        "Se uma conta com este e-mail existir, um link de recuperação foi enviado."
      );
      switchAuthMode('login'); 
    } catch (e) {
      // Por segurança, mostramos a mesma mensagem mesmo se o e-mail não for encontrado
      Alert.alert(
        "Verifique seu E-mail",
        "Se uma conta com este e-mail existir, um link de recuperação foi enviado."
      );
      switchAuthMode('login'); 
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };
  
  const getTitle = () => {
    if (authMode === 'login') return 'Login';
    if (authMode === 'signup') return 'Crie sua Conta';
    return 'Recuperar Senha';
  };

  return ( 
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
    > 
      <View style={styles.innerContainer}> 
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>AgendaJur</Text> 
        <Text style={styles.subtitle}>{getTitle()}</Text> 
        
        <View style={styles.form}> 
          {authMode === 'login' && (
            <>
              <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="Digite seu e-mail" keyboardType="email-address" autoCapitalize="none" />
              <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Digite sua senha" secureTextEntry />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button onPress={handleLogin} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color={THEME.background} /> : 'Entrar'}
              </Button>

              <TouchableOpacity style={styles.toggleContainer} onPress={() => switchAuthMode('forgotPassword')} disabled={isSubmitting}>
                <Text style={styles.linkText}>Esqueci minha senha</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleContainer} onPress={() => switchAuthMode('signup')} disabled={isSubmitting}>
                <Text style={styles.toggleText}>Não tem uma conta? Cadastre-se agora</Text>
              </TouchableOpacity>
            </>
          )}

          {authMode === 'signup' && (
            <>
              <Input label="Nome Completo" value={fullName} onChangeText={setFullName} placeholder="Digite seu nome completo" /> 
              <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="Digite seu e-mail" keyboardType="email-address" autoCapitalize="none" />
              <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Mín. 8 caracteres, 1 maiúscula, 1 símbolo" secureTextEntry />
              <Input label="Confirme sua Senha" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Digite sua senha novamente" secureTextEntry />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button onPress={handleSignUp} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color={THEME.background} /> : 'Cadastrar'}
              </Button>

              <TouchableOpacity style={styles.toggleContainer} onPress={() => switchAuthMode('login')} disabled={isSubmitting}>
                <Text style={styles.toggleText}>Já tem uma conta? Faça o login</Text>
              </TouchableOpacity>
            </>
          )}

          {authMode === 'forgotPassword' && (
            <>
              <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="Digite o e-mail da sua conta" keyboardType="email-address" autoCapitalize="none" />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button onPress={handleForgotPassword} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color={THEME.background} /> : 'Enviar E-mail de Recuperação'}
              </Button>

              <TouchableOpacity style={styles.toggleContainer} onPress={() => switchAuthMode('login')} disabled={isSubmitting}>
                <Text style={styles.toggleText}>Voltar para o Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View> 
      </View> 
    </KeyboardAvoidingView> 
  ); 
} 

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: THEME.background }, 
  innerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }, 
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: { fontSize: 40, fontWeight: 'bold', color: THEME.primary, marginBottom: 8 }, 
  subtitle: { fontSize: 18, color: THEME.textSecondary, marginBottom: 32, minHeight: 22 }, 
  form: { width: '100%', maxWidth: 400 }, 
  errorText: { color: THEME.danger, textAlign: 'center', marginBottom: 16 },
  toggleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  linkText: {
    color: THEME.textSecondary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});