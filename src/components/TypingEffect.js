// src/components/TypingEffect.js
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const TypingEffect = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);
  
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    // --- CORREÇÃO APLICADA AQUI ---
    <Text 
      style={styles.text}
      numberOfLines={1} 
      ellipsizeMode="tail" // Adiciona "..." se o texto for muito grande
    >
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