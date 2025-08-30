// src/components/EditHearingModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, FileText, XCircle } from 'lucide-react-native';

import { THEME } from '../constants/theme';
import Input from './Input';

const EditHearingModal = ({ isOpen, onClose, onSave, hearing }) => {
  const [formState, setFormState] = useState(hearing);
  const [errors, setErrors] = useState({});

  // --- FUNÇÃO CORRIGIDA ---
  useEffect(() => {
    // Adicionamos a verificação "if (hearing)" para evitar o crash
    if (hearing) {
      // Garante que 'proceedings' seja sempre um array, mesmo em cadastros antigos
      setFormState({ ...hearing, proceedings: hearing.proceedings || [] });
      setErrors({});
    }
  }, [hearing]);

  // Esta verificação também ajuda a prevenir renderizações com dados nulos
  if (!isOpen || !formState) return null;

  const handleChange = (name, value) => {
    let processedValue = value;
    if (name === 'processNumber') {
      processedValue = value.replace(/[^0-9./-]/g, '');
    }
    setFormState(prev => ({ ...prev, [name]: processedValue }));
    if (value) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const pickDocument = async () => {
    if (formState.proceedings.length >= 50) {
      Alert.alert("Limite atingido", "Você já adicionou o máximo de 50 andamentos.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets;
        setFormState(prev => ({ 
          ...prev, 
          proceedings: [...prev.proceedings, ...newFiles].slice(0, 50) 
        }));
      }
    } catch (err) {
      Alert.alert("Erro", "Não foi possível selecionar os arquivos.");
      console.error(err);
    }
  };

  const removeProceeding = (uriToRemove) => {
    setFormState(prev => ({ 
      ...prev, 
      proceedings: prev.proceedings.filter(file => file.uri !== uriToRemove) 
    }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formState).forEach(key => {
      if (key === 'id' || key === 'description' || key === 'proceedings') return;
      if (!formState[key]) {
        newErrors[key] = "Preencha o campo";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formState);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Editar Audiência</Text>
          <ScrollView>
            <Input label="Número do Processo" value={formState.processNumber} onChangeText={(v) => handleChange('processNumber', v)} error={errors.processNumber} />
            <View style={styles.row}>
              <View style={styles.halfWidth}><Input label="Data" value={formState.date} onChangeText={(v) => handleChange('date', v)} error={errors.date} /></View>
              <View style={styles.halfWidth}><Input label="Hora" value={formState.time} onChangeText={(v) => handleChange('time', v)} error={errors.time} /></View>
            </View>
            <Input label="Local" value={formState.location} onChangeText={(v) => handleChange('location', v)} error={errors.location} />
            <Input label="Partes" value={formState.parties} onChangeText={(v) => handleChange('parties', v)} error={errors.parties} />
            <Input label="Natureza" value={formState.nature} onChangeText={(v) => handleChange('nature', v)} error={errors.nature} />
            <Input 
              label="Descrição (Opcional)" 
              value={formState.description} 
              onChangeText={(v) => handleChange('description', v)}
              multiline={true}
              numberOfLines={4}
            />

            <Text style={styles.label}>Andamentos (Opcional)</Text>
            {formState.proceedings.map((file) => (
              <View key={file.uri} style={styles.fileSelectedContainer}>
                <FileText color={THEME.primary} size={24} />
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <TouchableOpacity onPress={() => removeProceeding(file.uri)}>
                  <XCircle color={THEME.danger} size={24} />
                </TouchableOpacity>
              </View>
            ))}
            {formState.proceedings.length < 50 && (
              <TouchableOpacity style={styles.documentPicker} onPress={pickDocument}>
                <UploadCloud color={THEME.primary} size={24} />
                <Text style={styles.documentPickerText}>Adicionar Andamento (PDF)</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: THEME.textSecondary }]}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: THEME.primary }]}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  container: { backgroundColor: THEME.card, padding: 24, borderRadius: 8, width: '100%', maxHeight: '85%' },
  title: { fontSize: 22, fontWeight: 'bold', color: THEME.primary, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 },
  button: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginLeft: 16 },
  buttonText: { color: THEME.background, fontWeight: 'bold' },
  label: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  documentPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderWidth: 2,
    borderColor: THEME.textSecondary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    marginTop: 8,
  },
  documentPickerText: {
    color: THEME.textSecondary,
    marginLeft: 12,
    fontSize: 16,
  },
  fileSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fileName: {
    color: THEME.text,
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
  },
});

export default EditHearingModal;