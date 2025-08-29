// src/components/ConfirmationModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, confirmText = "Sim", variant = 'danger' }) => {
  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: variant === 'danger' ? THEME.danger : THEME.primary }]}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: THEME.textSecondary }]}
            >
              <Text style={styles.buttonText}>Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: THEME.card,
    padding: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  message: {
    color: THEME.text,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: THEME.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConfirmationModal;