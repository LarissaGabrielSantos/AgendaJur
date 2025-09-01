// src/screens/LogScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppContext } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { PlusCircle, MinusCircle, Edit, Key, Info, FileText } from 'lucide-react-native';
import Button from '../components/button';

// Função auxiliar para escolher o ícone com base no tipo de log
const getLogIcon = (type) => {
  switch (type) {
    case 'add':
      return <PlusCircle color="#22C55E" size={24} />;
    case 'delete':
      return <MinusCircle color="#EF4444" size={24} />;
    case 'update':
      return <Edit color="#3B82F6" size={24} />;
    case 'auth':
      return <Key color="#EAB308" size={24} />;
    default:
      return <Info color={THEME.textSecondary} size={24} />;
  }
};

const LogScreen = () => {
  const { logEntries } = useContext(AppContext);

  // Função para formatar a data e hora para uma leitura mais fácil
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}`;
  };

  // Função para gerar e compartilhar o relatório .txt
  const handleGenerateReport = async () => {
    if (logEntries.length === 0) {
      Alert.alert("Aviso", "Não há logs para exportar.");
      return;
    }

    // Formata cada entrada de log para uma linha no arquivo de texto
    const reportContent = logEntries
      .map(log => `[${formatTimestamp(log.timestamp)}] - [${log.type.toUpperCase()}] - ${log.message}`)
      .join('\n');
      
    try {
      // Define o caminho e o nome do arquivo no diretório de cache do app
      const fileUri = FileSystem.cacheDirectory + 'relatorio_agendajur.txt';
      
      // Escreve o conteúdo formatado no arquivo
      await FileSystem.writeAsStringAsync(fileUri, reportContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Abre o menu de compartilhamento nativo do celular
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Exportar Relatório de Logs',
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
      console.error(error);
    }
  };

  // Componente que renderiza cada item da lista de logs
  const renderLogItem = ({ item }) => (
    <View style={styles.logItemContainer}>
      <View style={styles.logIcon}>{getLogIcon(item.type)}</View>
      <View style={styles.logTextContainer}>
        <Text style={styles.logMessage}>{item.message}</Text>
        <Text style={styles.logTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Atividades</Text>
      </View>
      <View style={styles.buttonWrapper}>
        <Button onPress={handleGenerateReport}>
          {/* View para alinhar o ícone e o texto dentro do botão */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FileText color={THEME.background} size={18} style={{marginRight: 8}}/>
            <Text style={{color: THEME.background, fontWeight: 'bold', fontSize: 16}}>Gerar Relatório (.txt)</Text>
          </View>
        </Button>
      </View>
      <FlatList
        data={logEntries}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade registrada ainda.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: THEME.card },
  title: { fontSize: 28, fontWeight: 'bold', color: THEME.primary },
  list: { padding: 24 },
  logItemContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  logIcon: {
    marginRight: 16,
  },
  logTextContainer: {
    flex: 1,
  },
  logMessage: {
    color: THEME.text,
    fontSize: 16,
    lineHeight: 22,
  },
  logTimestamp: {
    color: THEME.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: THEME.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
  }
});

export default LogScreen;