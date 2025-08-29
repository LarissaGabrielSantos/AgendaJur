// src/components/Input.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const Input = ({ label, value, onChangeText, placeholder, error, keyboardType = 'default', secureTextEntry = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: THEME.card,
    color: THEME.text,
    borderColor: THEME.textSecondary,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: THEME.primary,
  },
  inputError: {
    borderColor: THEME.danger,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;