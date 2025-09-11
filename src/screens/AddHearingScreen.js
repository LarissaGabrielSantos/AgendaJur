// src/screens/AddHearingScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { UploadCloud, FileText, XCircle } from 'lucide-react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import Input from '../components/Input';
import Button from '../components/button';

const CLOUDINARY_CLOUD_NAME = "dwj4shg3p";
const CLOUDINARY_UPLOAD_PRESET = "u9jyzisv";

export default function AddHearingScreen({ onHearingAdded }) {
  const { addHearing, isAdmin, currentUser } = useContext(AppContext);
  const [formState, setFormState] = useState({ 
    processNumber: '', clientEmail: '', date: '', time: '', 
    location: '', parties: '', nature: '',
    description: '', proceedings: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

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
      });

      if (!result.canceled) {
        const newFile = result.assets[0];
        setFormState(prev => ({ 
          ...prev, 
          proceedings: [...prev.proceedings, newFile] 
        }));
      }
    } catch (err) {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
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
      if (key === 'description' || key === 'proceedings') return; 
      if (isAdmin && key === 'clientEmail' && !formState[key]) {
         newErrors[key] = "Preencha o e-mail do cliente";
      } else if (key !== 'clientEmail' && !formState[key]) {
        newErrors[key] = "Preencha o campo";
      }
    });
    if (isAdmin && formState.clientEmail && !formState.clientEmail.includes('@')) {
      newErrors.clientEmail = "Digite um e-mail válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    if (!validate()) return;
    if (CLOUDINARY_CLOUD_NAME === "SEU_CLOUD_NAME" || CLOUDINARY_UPLOAD_PRESET === "SEU_UPLOAD_PRESET") {
        Alert.alert("Configuração Incompleta", "Adicione suas credenciais do Cloudinary.");
        return;
    }
    setIsSubmitting(true);
    setUploadProgress('Iniciando...');
    
    try {
      const proceedingsToSave = [];
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
      
      for (let i = 0; i < formState.proceedings.length; i++) {
        const file = formState.proceedings[i];
        setUploadProgress(`Enviando arquivo ${i + 1} de ${formState.proceedings.length}...`);
        
        const formData = new FormData();
        // --- ALTERAÇÃO AQUI: Usamos o nome original do arquivo para o public_id ---
        formData.append('file', { uri: file.uri, type: 'application/pdf', name: file.name });
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Usamos o nome original como o ID público para ter uma URL mais limpa
        formData.append('public_id', file.name); 

        const response = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.secure_url) {
          // Usamos a URL segura retornada, que agora será a correta
          proceedingsToSave.push({ name: file.name, url: data.secure_url });
        } else {
          const errorMessage = data.error?.message || 'Falha no upload para o Cloudinary';
          throw new Error(errorMessage);
        }
      }

      const hearingData = {
        processNumber: formState.processNumber, clientEmail: formState.clientEmail,
        date: formState.date, time: formState.time,
        location: formState.location, parties: formState.parties,
        nature: formState.nature, description: formState.description,
        proceedings: proceedingsToSave,
      };

      await addHearing(hearingData);
      Alert.alert('Sucesso', 'Andamento cadastrado com sucesso!');
      setFormState({ 
        processNumber: '', clientEmail: '', date: '', time: '', 
        location: '', parties: '', nature: '',
        description: '', proceedings: []
      });
      setErrors({});
      onHearingAdded();

    } catch (error) {
      console.error("Erro no envio: ", error);
      Alert.alert('Erro', `Ocorreu um erro ao enviar os andamentos: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Cadastrar Andamento</Text>
        
        <Input label="Número do Processo" value={formState.processNumber} onChangeText={(v) => handleChange('processNumber', v)} placeholder="Ex: 001/2025" error={errors.processNumber} />
        
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
          <Button onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting 
              ? <View style={{alignItems: 'center'}}>
                  <ActivityIndicator color={THEME.background} />
                  {uploadProgress && <Text style={styles.progressText}>{uploadProgress}</Text>}
                </View>
              : <Text style={styles.buttonText}>Salvar Andamento</Text>
            }
          </Button>
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
  progressText: {
    color: THEME.background,
    fontSize: 12,
    marginTop: 4,
  },
  buttonText: {
    color: THEME.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});