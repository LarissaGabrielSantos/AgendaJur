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
  const { addHearing, isAdmin } = useContext(AppContext);
  const [formState, setFormState] = useState({ 
    processNumber: '',
    clientEmail: '',
    date: '', 
    time: '', 
    location: '', 
    parties: '', 
    nature: '',
    description: '',
    proceedings: [],
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
      // Campos que não são obrigatórios
      if (key === 'description' || key === 'proceedings') return; 

      // Se for admin, o email do cliente é obrigatório. Se não for admin, esse campo não é validado.
      if (isAdmin && key === 'clientEmail' && !formState[key]) {
         newErrors[key] = "Preencha o e-mail do cliente";
      } else if (key !== 'clientEmail' && !formState[key]) {
        newErrors[key] = "Preencha o campo";
      }
    });
    // Validação de email simples
    if (isAdmin && formState.clientEmail && !formState.clientEmail.includes('@')) {
      newErrors.clientEmail = "Digite um e-mail válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      addHearing(formState);
      Alert.alert('Sucesso', 'Audiência cadastrada com sucesso!');
      setFormState({ 
        processNumber: '',
        clientEmail: '',
        date: '', 
        time: '', 
        location: '', 
        parties: '', 
        nature: '',
        description: '',
        proceedings: []
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
        
        <Input label="Número do Processo" value={formState.processNumber} onChangeText={(v) => handleChange('processNumber', v)} placeholder="Ex: 001/2025" error={errors.processNumber} />
        
        {/* Mostra o campo de e-mail do cliente APENAS se for admin */}
        {isAdmin && (
          <Input 
            label="E-mail do Cliente Associado" 
            value={formState.clientEmail} 
            onChangeText={(v) => handleChange('clientEmail', v.toLowerCase())} 
            placeholder="Digite o e-mail do cliente" 
            error={errors.clientEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
        
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
        
        <View style={styles.buttonContainer}>
          <Button onPress={handleSubmit}>Salvar Audiência</Button>
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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