// src/screens/AddHearingScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import Input from '../components/Input';
import Button from '../components/button'; 

export default function AddHearingScreen({ onHearingAdded }) {
  const { addHearing } = useContext(AppContext);
  // --- PASSO 1: ATUALIZAR O ESTADO ---
  const [formState, setFormState] = useState({ 
    processNumber: '', 
    date: '', 
    time: '', 
    location: '', 
    parties: '', 
    nature: '',
    description: '' // ADICIONADO: Novo campo de descrição
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

  // --- PASSO 3: TORNAR O CAMPO OPCIONAL ---
  const validate = () => {
    const newErrors = {};
    Object.keys(formState).forEach(key => {
      // ALTERADO: Adicionamos "&& key !== 'description'" para que a descrição não seja obrigatória
      if (!formState[key] && key !== 'description') {
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
      // ADICIONADO: Limpar o campo de descrição após o envio
      setFormState({ 
        processNumber: '', 
        date: '', 
        time: '', 
        location: '', 
        parties: '', 
        nature: '',
        description: '' 
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
        <View style={styles.row}>
          <View style={styles.halfWidth}><Input label="Data" value={formState.date} onChangeText={(v) => handleChange('date', v)} placeholder="AAAA-MM-DD" error={errors.date} /></View>
          <View style={styles.halfWidth}><Input label="Hora" value={formState.time} onChangeText={(v) => handleChange('time', v)} placeholder="HH:MM" error={errors.time} /></View>
        </View>
        <Input label="Local" value={formState.location} onChangeText={(v) => handleChange('location', v)} placeholder="Ex: Fórum Central, Sala 101" error={errors.location} />
        <Input label="Partes" value={formState.parties} onChangeText={(v) => handleChange('parties', v)} placeholder="Ex: Requerente vs. Requerido" error={errors.parties} />
        <Input label="Natureza" value={formState.nature} onChangeText={(v) => handleChange('nature', v)} placeholder="Ex: Audiência de Conciliação" error={errors.nature} />
        
        {/* --- PASSO 2: ADICIONAR O CAMPO NO FORMULÁRIO --- */}
        <Input 
          label="Descrição (Opcional)" 
          value={formState.description} 
          onChangeText={(v) => handleChange('description', v)} 
          placeholder="Adicione notas, links ou detalhes importantes..." 
          error={errors.description}
          multiline={true} // Permite múltiplas linhas
          numberOfLines={4} // Define uma altura inicial para o campo
        />

        <View style={styles.buttonContainer}>
          <Button onPress={handleSubmit}>Salvar Audiência</Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  contentContainer: { padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: THEME.primary, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  buttonContainer: { paddingTop: 16 },
});