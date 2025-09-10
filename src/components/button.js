import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

// ALTERADO: Nome do componente de 'button' para 'Button' (letra maiúscula)
const Button = ({ children, onPress, style, disabled }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, style, disabled && styles.disabled]} disabled={disabled}>
    <Text style={styles.text}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Adicionado para manter a altura consistente com o ActivityIndicator
  },
  text: {
    color: THEME.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // NOVO: Estilo para quando o botão estiver desabilitado
  disabled: {
    backgroundColor: '#A9A9A9', // Um cinza para indicar que está desabilitado
  }
});

// ALTERADO: Exportando o componente com o nome correto
export default Button;