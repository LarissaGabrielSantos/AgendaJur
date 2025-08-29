// src/screens/HomeScreen.js
import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react-native';
import TypingEffect from '../components/TypingEffect';

export default function HomeScreen() {
  const { hearings } = useContext(AppContext);
  const [expandedId, setExpandedId] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const todaysHearings = useMemo(() => hearings.filter(h => h.date === today), [hearings, today]);

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "  Bom dia, Dr. José Sérgio";
    if (hour < 18) return "  Boa tarde, Dr. José Sérgio";
    return "  Boa noite, Dr. José Sérgio";
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.greetingContainer}>
        <TypingEffect text={getGreeting} />
      </View>

      <Text style={styles.title}>Calendário</Text>
      
      <View style={styles.calendarCard}>
        <Text style={styles.monthYear}>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dayNumber}>{new Date().getDate()}</Text>
          <Text style={styles.dayName}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}</Text>
        </View>
      </View>
      
      <View style={[styles.statusCard, { backgroundColor: todaysHearings.length > 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(169, 169, 169, 0.1)' }]}>
        {todaysHearings.length > 0 ? (
          <>
            <CheckCircle size={28} color={THEME.primary} style={{ marginRight: 12 }} />
            <Text style={[styles.statusText, { color: THEME.primary }]}>Hoje você possui atividades!</Text>
          </>
        ) : (
          <>
            <XCircle size={28} color={THEME.textSecondary} style={{ marginRight: 12 }} />
            <Text style={[styles.statusText, { color: THEME.textSecondary }]}>Hoje não há atividades.</Text>
          </>
        )}
      </View>

      {todaysHearings.length > 0 && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Detalhes das Atividades de Hoje</Text>
          {todaysHearings.map(hearing => (
            <View key={hearing.id} style={styles.hearingCard}>
              <TouchableOpacity
                style={styles.hearingHeader}
                onPress={() => setExpandedId(expandedId === hearing.id ? null : hearing.id)}
              >
                <Text style={styles.hearingHeaderText}>Proc: {hearing.processNumber} - {hearing.time}</Text>
                <ChevronDown size={24} color={THEME.textSecondary} style={{ transform: [{ rotate: expandedId === hearing.id ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {expandedId === hearing.id && (
                <View style={styles.hearingDetails}>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Natureza:</Text> {hearing.nature}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Local:</Text> {hearing.location}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Partes:</Text> {hearing.parties}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  contentContainer: { padding: 24 },
  greetingContainer: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: THEME.primary, marginBottom: 24 },
  calendarCard: { backgroundColor: THEME.card, padding: 16, borderRadius: 8, marginBottom: 24 },
  monthYear: { color: THEME.text, fontWeight: 'bold', fontSize: 20 },
  dateContainer: { alignItems: 'center', paddingVertical: 16 },
  dayNumber: { color: THEME.text, fontWeight: 'bold', fontSize: 24 },
  dayName: { color: THEME.textSecondary, fontSize: 18 },
  statusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 24, borderRadius: 8 },
  statusText: { fontSize: 18, fontWeight: '600' },
  detailsSection: { marginTop: 32 },
  detailsTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.primary, marginBottom: 16 },
  hearingCard: { backgroundColor: THEME.card, borderRadius: 8, marginBottom: 12 },
  hearingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  hearingHeaderText: { color: THEME.text, fontWeight: 'bold' },
  hearingDetails: { padding: 16, borderTopWidth: 1, borderColor: 'rgba(169, 169, 169, 0.2)' },
  detailText: { color: THEME.textSecondary, marginBottom: 8, fontSize: 14 },
  detailLabel: { color: THEME.primary, fontWeight: 'bold' },
});