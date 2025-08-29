import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import Input from './Input';

const EditHearingModal = ({ isOpen, onClose, onSave, hearing }) => {
  const [formState, setFormState] = useState(hearing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormState(hearing);
    setErrors({});
  }, [hearing]);

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

  // --- PASSO 2: ATUALIZAR A VALIDAÇÃO ---
  const validate = () => {
    const newErrors = {};
    Object.keys(formState).forEach(key => {
      // ALTERADO: Adicionamos "&& key !== 'description'" para que a descrição não seja obrigatória
      if (!formState[key] && key !== 'id' && key !== 'description') {
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
            
            {/* --- PASSO 1: ADICIONAR O CAMPO DE DESCRIÇÃO --- */}
            <Input 
              label="Descrição (Opcional)" 
              value={formState.description} 
              onChangeText={(v) => handleChange('description', v)} 
              placeholder="Adicione notas, links ou detalhes importantes..." 
              error={errors.description}
              multiline={true}
              numberOfLines={4}
            />
            {/* --- INSERIR ABA DE ARTIGO, TANTO PRA CADASTRO, EDIÇÃO E VISUALIZAÇÃO --- */}
             {/* --- INSERIR ABA DE PDF - PETIÇÕES --- */}
              {/* --- INSERIR ABA DE PDF - PDF QUE CONTENHA OS CADASTROS QUE VÃO DIRETO PRO APP SEM DIGITAR --- */}

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
});

export default EditHearingModal;