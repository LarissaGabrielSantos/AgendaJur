// src/components/TypingEffect.js
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const TypingEffect = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    // Garante que o texto comece vazio sempre que o 'text' prop mudar
    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        // --- LÓGICA ALTERADA AQUI ---
        // Em vez de adicionar letra por letra ao estado anterior (que pode estar obsoleto),
        // construímos uma substring a partir do texto original. Isso é mais seguro.
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]); // O efeito reinicia sempre que o 'text' muda
  
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <Text style={styles.text}>
      {displayedText}
      {showCursor && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    fontWeight: '600',
    color: THEME.text,
    height: 32,
  },
  cursor: {
    color: THEME.primary,
  },
});

export default TypingEffect;