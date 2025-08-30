// src/screens/ViewHearingsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { Trash2, Pencil, Paperclip } from 'lucide-react-native';
import ConfirmationModal from '../components/ConfirmationModal';
import EditHearingModal from '../components/EditHearingModal';

export default function ViewHearingsScreen() {
    const { hearings, deleteHearing, updateHearing } = useContext(AppContext);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, hearingId: null });
    const [editModal, setEditModal] = useState({ isOpen: false, hearing: null });
    const [editConfirmModal, setEditConfirmModal] = useState({ isOpen: false, data: null });

    // ... (resto da lógica permanece igual) ...
    const openDeleteModal = (id) => setDeleteModal({ isOpen: true, hearingId: id });
    const closeDeleteModal = () => setDeleteModal({ isOpen: false, hearingId: null });
    const handleConfirmDelete = () => {
        if (deleteModal.hearingId) {
            deleteHearing(deleteModal.hearingId);
        }
        closeDeleteModal();
    };

    const openEditModal = (hearing) => setEditModal({ isOpen: true, hearing });
    const closeEditModal = () => setEditModal({ isOpen: false, hearing: null });
    
    const handleSaveEdit = (updatedHearing) => {
        closeEditModal();
        setEditConfirmModal({ isOpen: true, data: updatedHearing });
    };

    const handleConfirmSave = () => {
        if (editConfirmModal.data) {
            updateHearing(editConfirmModal.data.id, editConfirmModal.data);
        }
        setEditConfirmModal({ isOpen: false, data: null });
    };

    const formatDate = (dateString) => {
        if (!dateString || typeof dateString !== 'string') return '';
        if (dateString.includes('/')) return dateString;
        const [year, month, day] = dateString.split('-');
        if (day && month && year) return `${day}/${month}/${year}`;
        return dateString;
    };


    return (
        <View style={styles.container}>
            <ConfirmationModal isOpen={deleteModal.isOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} message="Deseja realmente excluir?" />
            <ConfirmationModal isOpen={editConfirmModal.isOpen} onClose={() => setEditConfirmModal({isOpen: false, data: null})} onConfirm={handleConfirmSave} message="Deseja realmente editar?" variant="primary" confirmText="Sim"/>
            <EditHearingModal isOpen={editModal.isOpen} onClose={closeEditModal} onSave={handleSaveEdit} hearing={editModal.hearing} />
            
            <Text style={styles.title}>Audiências Cadastradas</Text>
            
            {hearings.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma audiência cadastrada.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.list}>
                    {hearings.map(hearing => (
                        <View key={hearing.id} style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.processNumber} numberOfLines={1} ellipsizeMode="tail">Proc: {hearing.processNumber}</Text>
                                    
                                    {/* --- LÓGICA ATUALIZADA AQUI --- */}
                                    {/* Verifica se o array de andamentos existe e não está vazio */}
                                    {hearing.proceedings && hearing.proceedings.length > 0 && (
                                        <View style={styles.attachmentChip}>
                                            <Paperclip color={THEME.background} size={14} />
                                            {/* Exibe a contagem de arquivos */}
                                            <Text style={styles.attachmentText}>{hearing.proceedings.length} Andamento(s)</Text>
                                        </View>
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
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity onPress={() => openEditModal(hearing)} style={styles.iconButton}>
                                    <Pencil size={22} color={THEME.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openDeleteModal(hearing.id)} style={styles.iconButton}>
                                    <Trash2 size={22} color={THEME.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

// Os estilos permanecem os mesmos da correção anterior
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background, padding: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: THEME.primary, marginBottom: 24 },
    emptyText: { color: THEME.textSecondary, fontSize: 16 },
    list: { paddingBottom: 24 },
    card: { 
        backgroundColor: THEME.card, 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 16, 
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardContent: { 
        flex: 1,
        marginRight: 8,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    processNumber: { color: THEME.text, fontSize: 18, fontWeight: 'bold', flexShrink: 1 },
    attachmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.primary,
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginLeft: 8,
    },
    attachmentText: {
        color: THEME.background,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    infoText: { color: THEME.textSecondary },
    partiesText: { color: THEME.text, fontSize: 12, marginTop: 8 },
    descriptionText: {
        color: THEME.textSecondary,
        fontStyle: 'italic',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: '#333',
    },
    actionsContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    iconButton: {
        padding: 4,
        marginBottom: 8,
    },
});