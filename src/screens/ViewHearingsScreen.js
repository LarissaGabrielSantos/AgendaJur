import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { Trash2, Pencil, Paperclip, FileText, X } from 'lucide-react-native';
import ConfirmationModal from '../components/ConfirmationModal';
import EditHearingModal from '../components/EditHearingModal';

const FilesListModal = ({ isOpen, onClose, files, onFilePress }) => {
  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Andamentos Anexados</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={THEME.textSecondary} size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {files.map(file => (
              <TouchableOpacity key={file.uri} style={styles.fileItem} onPress={() => onFilePress(file.uri)}>
                <FileText color={THEME.primary} size={20} />
                <Text style={styles.fileNameModal} numberOfLines={1}>{file.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


export default function ViewHearingsScreen() {
    const { hearings, deleteHearing, updateHearing, currentUser, isAdmin } = useContext(AppContext);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, hearingId: null });
    const [editModal, setEditModal] = useState({ isOpen: false, hearing: null });
    const [editConfirmModal, setEditConfirmModal] = useState({ isOpen: false, data: null });
    const [filesModal, setFilesModal] = useState({ isOpen: false, files: [] });

    const filteredHearings = useMemo(() => {
        if (isAdmin) {
            return hearings;
        }
        if (!currentUser) {
            return [];
        }
        return hearings.filter(
            h => h.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()
        );
    }, [hearings, currentUser, isAdmin]);

    const openDeleteModal = (id) => setDeleteModal({ isOpen: true, hearingId: id });
    const closeDeleteModal = () => setDeleteModal({ isOpen: false, hearingId: null });
    const handleConfirmDelete = () => { if (deleteModal.hearingId) { deleteHearing(deleteModal.hearingId); } closeDeleteModal(); };
    const openEditModal = (hearing) => setEditModal({ isOpen: true, hearing });
    const closeEditModal = () => setEditModal({ isOpen: false, hearing: null });
    const handleSaveEdit = (updatedHearing) => { closeEditModal(); setEditConfirmModal({ isOpen: true, data: updatedHearing }); };
    const handleConfirmSave = () => { if (editConfirmModal.data) { updateHearing(editConfirmModal.data.id, editConfirmModal.data); } setEditConfirmModal({ isOpen: false, data: null }); };
    const formatDate = (dateString) => { if (!dateString || typeof dateString !== 'string') return ''; if (dateString.includes('/')) return dateString; const [year, month, day] = dateString.split('-'); if (day && month && year) return `${day}/${month}/${year}`; return dateString; };

    const handleOpenFile = async (fileUri) => {
        try {
            const isSharingAvailable = await Sharing.isAvailableAsync();
            if (!isSharingAvailable) {
                Alert.alert("Erro", "A visualização de arquivos não está disponível neste dispositivo.");
                return;
            }
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível abrir o arquivo.");
            console.error(error);
        }
    };
    
    const handleAttachmentPress = (proceedings) => {
        if (!proceedings || proceedings.length === 0) return;

        if (proceedings.length === 1) {
            handleOpenFile(proceedings[0].uri);
        } else {
            setFilesModal({ isOpen: true, files: proceedings });
        }
    };

    return (
        <View style={styles.container}>
            <ConfirmationModal isOpen={deleteModal.isOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} message="Deseja realmente excluir?" />
            <ConfirmationModal isOpen={editConfirmModal.isOpen} onClose={() => setEditConfirmModal({isOpen: false, data: null})} onConfirm={handleConfirmSave} message="Deseja realmente editar?" variant="primary" confirmText="Sim"/>
            <EditHearingModal isOpen={editModal.isOpen} onClose={closeEditModal} onSave={handleSaveEdit} hearing={editModal.hearing} />
            
            <FilesListModal
              isOpen={filesModal.isOpen}
              onClose={() => setFilesModal({ isOpen: false, files: [] })}
              files={filesModal.files}
              onFilePress={handleOpenFile}
            />
            
            <Text style={styles.title}>Andamentos Cadastrados</Text>
            
            {filteredHearings.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum andamento encontrado.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.list}>
                    {filteredHearings.map(hearing => (
                        <View key={hearing.id} style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.processNumber} numberOfLines={1} ellipsizeMode="tail">Proc: {hearing.processNumber}</Text>
                                    
                                    {hearing.proceedings && hearing.proceedings.length > 0 && (
                                        <TouchableOpacity onPress={() => handleAttachmentPress(hearing.proceedings)}>
                                            <View style={styles.attachmentChip}>
                                                <Paperclip color={THEME.background} size={14} />
                                                <Text style={styles.attachmentText}>{hearing.proceedings.length} Andamento(s)</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={styles.infoText}>{hearing.nature}</Text>
                                <Text style={styles.infoText}>{formatDate(hearing.date)} às {hearing.time}</Text>
                                <Text style={styles.infoText}>{hearing.location}</Text>
                                <Text style={styles.partiesText}>Partes: {hearing.parties}</Text>
                                {hearing.description && (
                                    <Text style={styles.descriptionText}>Descrição: {hearing.description}</Text>
                                )}
                            </View>

                            {/* --- LÓGICA DE PERMISSÃO ADICIONADA AQUI --- */}
                            {/* Este bloco de ícones só será renderizado se 'isAdmin' for verdadeiro */}
                            {isAdmin && (
                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity onPress={() => openEditModal(hearing)} style={styles.iconButton}>
                                        <Pencil size={22} color={THEME.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => openDeleteModal(hearing.id)} style={styles.iconButton}>
                                        <Trash2 size={22} color={THEME.danger} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background, padding: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: THEME.primary, marginBottom: 24 },
    emptyText: { color: THEME.textSecondary, fontSize: 16 },
    list: { paddingBottom: 24 },
    card: { backgroundColor: THEME.card, borderRadius: 8, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
    cardContent: { flex: 1, marginRight: 8 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    processNumber: { color: THEME.text, fontSize: 18, fontWeight: 'bold', flexShrink: 1 },
    attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, marginLeft: 8 },
    attachmentText: { color: THEME.background, fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    infoText: { color: THEME.textSecondary },
    partiesText: { color: THEME.text, fontSize: 12, marginTop: 8 },
    descriptionText: { color: THEME.textSecondary, fontStyle: 'italic', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#333' },
    actionsContainer: { flexDirection: 'column', justifyContent: 'flex-start' },
    iconButton: { padding: 4, marginBottom: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    modalContainer: { backgroundColor: THEME.card, borderRadius: 8, width: '100%', maxHeight: '60%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 12, marginBottom: 12 },
    modalTitle: { color: THEME.primary, fontSize: 20, fontWeight: 'bold' },
    fileItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    fileNameModal: { color: THEME.text, fontSize: 16, marginLeft: 12, flex: 1 },
});