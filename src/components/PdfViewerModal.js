import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { THEME } from '../constants/theme';

const PdfViewerModal = ({ visible, onClose, pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>Visualizador de PDF</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={THEME.text} size={28} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color={THEME.primary} />
        )}

        <WebView
          source={{ uri: pdfUrl }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    height: 60,
    backgroundColor: THEME.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: THEME.primary,
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  closeButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
});

export default PdfViewerModal;