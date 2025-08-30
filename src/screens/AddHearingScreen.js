// src/screens/AddHearingScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, FileText, XCircle } from 'lucide-react-native';

import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import Input from '../components/Input';
import Button from '../components/button';

export default function AddHearingScreen({ onHearingAdded }) {
  const { addHearing } = useContext(AppContext);
  // --- 1. ESTADO ATUALIZADO PARA ARRAY ---
  const [formState, setFormState] = useState({ 
    processNumber: '', 
    date: '', 
    time: '', 
    location: '', 
    parties: '', 
    nature: '',
    description: '',
    proceedings: [], // ALTERADO: de 'petition: null' para um array vazio
  });
  const [errors, setErrors] = useState({});

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

  // --- 2. FUNÇÃO ATUALIZADA PARA MÚLTIPLOS ARQUIVOS ---
  const pickDocument = async () => {
    if (formState.proceedings.length >= 50) {
      Alert.alert("Limite atingido", "Você já adicionou o máximo de 50 andamentos.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true, // Habilita a seleção múltipla
      });

      if (!result.canceled) {
        const newFiles = result.assets;
        // Adiciona os novos arquivos ao array existente, respeitando o limite
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

  // --- 3. FUNÇÃO PARA REMOVER UM ARQUIVO ESPECÍFICO ---
  const removeProceeding = (uriToRemove) => {
    setFormState(prev => ({ 
      ...prev, 
      proceedings: prev.proceedings.filter(file => file.uri !== uriToRemove) 
    }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formState).forEach(key => {
      // Campos que não são obrigatórios
      if (key === 'description' || key === 'proceedings') return; 

      if (!formState[key]) {
        newErrors[key] = "Preencha o campo";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      addHearing(formState);
      Alert.alert('Sucesso', 'Audiência cadastrada com sucesso!');
      setFormState({ 
        processNumber: '', 
        date: '', 
        time: '', 
        location: '', 
        parties: '', 
        nature: '',
        description: '',
        proceedings: [] // Limpa o array de andamentos
      });
      setErrors({});
      onHearingAdded();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Cadastrar Audiência</Text>
        {/* ... (Inputs existentes) ... */}
        <Input label="Número do Processo" value={formState.processNumber} onChangeText={(v) => handleChange('processNumber', v)} placeholder="Ex: 001/2025" error={errors.processNumber} />
        <View style={styles.row}>
          <View style={styles.halfWidth}><Input label="Data" value={formState.date} onChangeText={(v) => handleChange('date', v)} placeholder="DD/MM/AAAA" error={errors.date} /></View>
          <View style={styles.halfWidth}><Input label="Hora" value={formState.time} onChangeText={(v) => handleChange('time', v)} placeholder="HH:MM" error={errors.time} /></View>
        </View>
        <Input label="Local" value={formState.location} onChangeText={(v) => handleChange('location', v)} placeholder="Ex: Fórum Central, Sala 101" error={errors.location} />
        <Input label="Partes" value={formState.parties} onChangeText={(v) => handleChange('parties', v)} placeholder="Ex: Requerente vs. Requerido" error={errors.parties} />
        <Input label="Natureza" value={formState.nature} onChangeText={(v) => handleChange('nature', v)} placeholder="Ex: Audiência de Conciliação" error={errors.nature} />
        <Input 
          label="Descrição (Opcional)" 
          value={formState.description} 
          onChangeText={(v) => handleChange('description', v)} 
          placeholder="Adicione notas, links ou detalhes importantes..." 
          error={errors.description}
          multiline={true}
          numberOfLines={4}
        />

        {/* --- 4. INTERFACE ATUALIZADA PARA MÚLTIPLOS ARQUIVOS --- */}
        <Text style={styles.label}>Andamentos (Opcional)</Text>
        
        {/* Mapeia e exibe a lista de arquivos selecionados */}
        {formState.proceedings.map((file) => (
          <View key={file.uri} style={styles.fileSelectedContainer}>
            <FileText color={THEME.primary} size={24} />
            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            <TouchableOpacity onPress={() => removeProceeding(file.uri)}>
              <XCircle color={THEME.danger} size={24} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Botão para adicionar mais arquivos (só aparece se o limite não foi atingido) */}
        {formState.proceedings.length < 50 && (
          <TouchableOpacity style={styles.documentPicker} onPress={pickDocument}>
            <UploadCloud color={THEME.primary} size={24} />
            <Text style={styles.documentPickerText}>Adicionar Andamento (PDF)</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.buttonContainer}>
          <Button onPress={handleSubmit}>Salvar Audiência</Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  contentContainer: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: 'bold', color: THEME.primary, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  buttonContainer: { paddingTop: 32 },
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
    marginTop: 8, // Adicionado para espaçamento
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
    marginBottom: 8, // Adicionado para espaçar os itens da lista
  },
  fileName: {
    color: THEME.text,
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    fontSize: 16,
  },
});