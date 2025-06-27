import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Bell, Plus, X, Calendar, DollarSign, Tag, Clock, Check, CircleAlert as AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function LembretesScreen() {
  const router = useRouter();
  const { lembretes, adicionarLembrete, removerLembrete, marcarLembreteConcluido } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date());
  const [recorrente, setRecorrente] = useState(false);
  const [tipoRecorrencia, setTipoRecorrencia] = useState<'diario' | 'semanal' | 'mensal' | 'anual'>('mensal');

  const categorias = ['Casa', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Trabalho', 'Outros'];
  const tiposRecorrencia = [
    { key: 'diario', label: 'Diário' },
    { key: 'semanal', label: 'Semanal' },
    { key: 'mensal', label: 'Mensal' },
    { key: 'anual', label: 'Anual' }
  ];

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const formatarData = (data: Date) => {
    const hoje = new Date();
    const amanha = new Date(hoje.getTime() + 86400000);
    
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    } else {
      return data.toLocaleDateString('pt-BR');
    }
  };

  const obterStatusLembrete = (lembrete: any) => {
    if (lembrete.concluido) return 'concluido';
    
    const hoje = new Date();
    const vencimento = new Date(lembrete.dataVencimento);
    const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDias < 0) return 'vencido';
    if (diffDias <= 3) return 'urgente';
    return 'normal';
  };

  const salvarLembrete = () => {
    if (!titulo || !descricao) {
      Alert.alert('Erro', 'Preencha título e descrição');
      return;
    }

    const valorNumerico = valor ? parseFloat(valor.replace(',', '.')) : undefined;
    if (valor && (isNaN(valorNumerico!) || valorNumerico! <= 0)) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    adicionarLembrete({
      titulo,
      descricao,
      valor: valorNumerico,
      categoria: categoria || 'Outros',
      dataVencimento,
      recorrente,
      tipoRecorrencia: recorrente ? tipoRecorrencia : undefined,
      concluido: false
    });

    limparFormulario();
    setModalVisible(false);
    Alert.alert('Sucesso', 'Lembrete criado com sucesso!');
  };

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setValor('');
    setCategoria('');
    setDataVencimento(new Date());
    setRecorrente(false);
    setTipoRecorrencia('mensal');
  };

  const confirmarRemocao = (id: string, titulo: string) => {
    Alert.alert(
      'Remover Lembrete',
      `Deseja remover "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removerLembrete(id)
        }
      ]
    );
  };

  const lembretesOrdenados = lembretes.sort((a, b) => {
    if (a.concluido !== b.concluido) {
      return a.concluido ? 1 : -1;
    }
    return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
  });

  const lembretesVencidos = lembretes.filter(l => !l.concluido && obterStatusLembrete(l) === 'vencido').length;
  const lembretesUrgentes = lembretes.filter(l => !l.concluido && obterStatusLembrete(l) === 'urgente').length;
  const lembretesConcluidos = lembretes.filter(l => l.concluido).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lembretes</Text>
          <Text style={styles.headerSubtitle}>
            Nunca mais esqueça de pagar suas contas
          </Text>
        </View>
      </View>

      <View style={styles.resumoCards}>
        <View style={[styles.card, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.cardNumber}>{lembretesVencidos}</Text>
          <Text style={styles.cardLabel}>Vencidos</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.cardNumber}>{lembretesUrgentes}</Text>
          <Text style={styles.cardLabel}>Urgentes</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.cardNumber}>{lembretesConcluidos}</Text>
          <Text style={styles.cardLabel}>Concluídos</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Novo Lembrete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer}>
        {lembretesOrdenados.map((lembrete) => {
          const status = obterStatusLembrete(lembrete);
          const statusColors = {
            concluido: '#10B981',
            vencido: '#EF4444',
            urgente: '#F59E0B',
            normal: '#6B7280'
          };
          
          return (
            <TouchableOpacity 
              key={lembrete.id} 
              style={[
                styles.lembreteItem,
                lembrete.concluido && styles.lembreteItemConcluido
              ]}
              onLongPress={() => confirmarRemocao(lembrete.id, lembrete.titulo)}
            >
              <TouchableOpacity 
                style={styles.checkButton}
                onPress={() => marcarLembreteConcluido(lembrete.id)}
              >
                {lembrete.concluido ? (
                  <Check size={20} color="#10B981" />
                ) : (
                  <View style={[styles.checkCircle, { borderColor: statusColors[status] }]} />
                )}
              </TouchableOpacity>

              <View style={styles.lembreteContent}>
                <View style={styles.lembreteHeader}>
                  <Text style={[
                    styles.lembreteTitulo,
                    lembrete.concluido && styles.lembreteTextoRiscado
                  ]}>
                    {lembrete.titulo}
                  </Text>
                  <View style={styles.statusContainer}>
                    {status === 'vencido' && <AlertCircle size={16} color="#EF4444" />}
                    {status === 'urgente' && <Clock size={16} color="#F59E0B" />}
                    {lembrete.recorrente && <Bell size={14} color="#6B7280" />}
                  </View>
                </View>

                <Text style={[
                  styles.lembreteDescricao,
                  lembrete.concluido && styles.lembreteTextoRiscado
                ]}>
                  {lembrete.descricao}
                </Text>

                <View style={styles.lembreteMeta}>
                  <View style={styles.lembreteInfo}>
                    <Calendar size={14} color="#6B7280" />
                    <Text style={styles.lembreteData}>
                      {formatarData(new Date(lembrete.dataVencimento))}
                    </Text>
                  </View>
                  
                  <View style={styles.lembreteInfo}>
                    <Tag size={14} color="#6B7280" />
                    <Text style={styles.lembreteCategoria}>{lembrete.categoria}</Text>
                  </View>

                  {lembrete.valor && (
                    <View style={styles.lembreteInfo}>
                      <DollarSign size={14} color="#6B7280" />
                      <Text style={styles.lembreteValor}>
                        {formatarMoeda(lembrete.valor)}
                      </Text>
                    </View>
                  )}
                </View>

                {lembrete.recorrente && (
                  <View style={styles.recorrenciaTag}>
                    <Text style={styles.recorrenciaTexto}>
                      {tiposRecorrencia.find(t => t.key === lembrete.tipoRecorrencia)?.label}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {lembretes.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum lembrete criado</Text>
            <Text style={styles.emptySubtitle}>
              Crie lembretes para nunca mais esquecer de pagar suas contas
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          limparFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Lembrete</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                limparFormulario();
              }}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Título</Text>
                <View style={styles.inputContainer}>
                  <Tag size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Ex: Conta de Luz"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📝</Text>
                  <TextInput
                    style={styles.input}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Detalhes do lembrete"
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor (opcional)</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={valor}
                    onChangeText={setValor}
                    placeholder="0,00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoriesContainer}>
                    {categorias.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryButton,
                          categoria === cat && styles.categoryButtonActive
                        ]}
                        onPress={() => setCategoria(cat)}
                      >
                        <Text style={[
                          styles.categoryButtonText,
                          categoria === cat && styles.categoryButtonTextActive
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recorrente</Text>
                <TouchableOpacity 
                  style={styles.switchContainer}
                  onPress={() => setRecorrente(!recorrente)}
                >
                  <View style={[
                    styles.switch,
                    recorrente && styles.switchActive
                  ]}>
                    <View style={[
                      styles.switchThumb,
                      recorrente && styles.switchThumbActive
                    ]} />
                  </View>
                  <Text style={styles.switchLabel}>
                    {recorrente ? 'Sim' : 'Não'}
                  </Text>
                </TouchableOpacity>
              </View>

              {recorrente && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tipo de Recorrência</Text>
                  <View style={styles.recorrenciaContainer}>
                    {tiposRecorrencia.map((tipo) => (
                      <TouchableOpacity
                        key={tipo.key}
                        style={[
                          styles.recorrenciaButton,
                          tipoRecorrencia === tipo.key && styles.recorrenciaButtonActive
                        ]}
                        onPress={() => setTipoRecorrencia(tipo.key as any)}
                      >
                        <Text style={[
                          styles.recorrenciaButtonText,
                          tipoRecorrencia === tipo.key && styles.recorrenciaButtonTextActive
                        ]}>
                          {tipo.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={salvarLembrete}>
                <Text style={styles.saveButtonText}>Criar Lembrete</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#F59E0B',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
  },
  resumoCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lembreteItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lembreteItemConcluido: {
    opacity: 0.6,
  },
  checkButton: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  lembreteContent: {
    flex: 1,
  },
  lembreteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  lembreteTitulo: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  lembreteTextoRiscado: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lembreteDescricao: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  lembreteMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  lembreteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lembreteData: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  lembreteCategoria: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  lembreteValor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  recorrenciaTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  recorrenciaTexto: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#F59E0B',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#F59E0B',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  recorrenciaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recorrenciaButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recorrenciaButtonActive: {
    backgroundColor: '#F59E0B',
  },
  recorrenciaButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  recorrenciaButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});