// src/screens/ViewHearingsScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { Trash2, Pencil } from 'lucide-react-native';
import ConfirmationModal from '../components/ConfirmationModal';
import EditHearingModal from '../components/EditHearingModal';

export default function ViewHearingsScreen() {
    const { hearings, deleteHearing, updateHearing } = useContext(AppContext);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, hearingId: null });
    const [editModal, setEditModal] = useState({ isOpen: false, hearing: null });
    const [editConfirmModal, setEditConfirmModal] = useState({ isOpen: false, data: null });

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
    
    // --- FUNÇÃO CORRIGIDA ---
    const formatDate = (dateString) => {
        if (!dateString || typeof dateString !== 'string') return '';
        
        // Se a data já estiver no formato DD/MM/AAAA, apenas a retorne.
        if (dateString.includes('/')) {
            return dateString;
        }

        // Se estiver no formato AAAA-MM-DD, converta.
        const [year, month, day] = dateString.split('-');
        if (day && month && year) {
            return `${day}/${month}/${year}`;
        }

        // Se for um formato inesperado, retorne o original para evitar erros.
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
                                <Text style={styles.processNumber}>Proc: {hearing.processNumber}</Text>
                                <Text style={styles.infoText}>{hearing.nature}</Text>
                                <Text style={styles.infoText}>{formatDate(hearing.date)} às {hearing.time}</Text>
                                <Text style={styles.infoText}>{hearing.location}</Text>
                                <Text style={styles.partiesText}>Partes: {hearing.parties}</Text>
                                
                                {hearing.description ? (
                                    <Text style={styles.descriptionText}>Descrição: {hearing.description}</Text>
                                ) : null}

                            </View>
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity onPress={() => openEditModal(hearing)} style={styles.iconButton}>
                                    <Pencil size={20} color={THEME.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openDeleteModal(hearing.id)} style={styles.iconButton}>
                                    <Trash2 size={20} color={THEME.danger} />
                                </TouchableOpacity>
                            </View>
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
    card: { backgroundColor: THEME.card, borderRadius: 8, padding: 16, marginBottom: 16, flexDirection: 'row' },
    cardContent: { flex: 1 },
    processNumber: { color: THEME.text, fontSize: 18, fontWeight: 'bold' },
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
    actionsContainer: { flexDirection: 'row', position: 'absolute', top: 8, right: 8 },
    iconButton: { padding: 8 },
});