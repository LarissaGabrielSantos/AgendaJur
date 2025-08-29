// src/components/TypingEffect.js
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const TypingEffect = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
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
    height: 32, // Altura fixa para evitar "pulos" no layout
  },
  cursor: {
    color: THEME.primary,
  },
});

export default TypingEffect;