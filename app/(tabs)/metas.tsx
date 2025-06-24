import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState, useMemo } from 'react';
import { Target, Plus, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, CreditCard as Edit3, Trash2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function MetasScreen() {
  const { metas, gastos, adicionarMeta, removerMeta, atualizarMeta } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoMeta, setEditandoMeta] = useState<string | null>(null);
  const [categoria, setCategoria] = useState('');
  const [valorLimite, setValorLimite] = useState('');
  const [periodo, setPeriodo] = useState<'mensal' | 'semanal'>('mensal');

  const categorias = ['Alimentação', 'Transporte', 'Compras', 'Lazer', 'Saúde', 'Educação', 'Casa', 'Outros'];
  const cores = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const progressoMetas = useMemo(() => {
    return metas.map(meta => {
      const hoje = new Date();
      let dataInicio: Date;
      
      if (meta.periodo === 'mensal') {
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      } else {
        const diaSemana = hoje.getDay();
        dataInicio = new Date(hoje.getTime() - (diaSemana * 24 * 60 * 60 * 1000));
      }

      const gastosCategoria = gastos.filter(g => 
        g.categoria === meta.categoria && g.data >= dataInicio
      );
      
      const totalGasto = gastosCategoria.reduce((sum, g) => sum + g.valor, 0);
      const percentual = Math.min((totalGasto / meta.valorLimite) * 100, 100);
      
      return {
        ...meta,
        totalGasto,
        percentual,
        status: percentual >= 100 ? 'excedido' : percentual >= 80 ? 'alerta' : 'ok'
      };
    });
  }, [metas, gastos]);

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const salvarMeta = () => {
    if (!categoria || !valorLimite) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const valor = parseFloat(valorLimite.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

    if (editandoMeta) {
      atualizarMeta(editandoMeta, {
        categoria,
        valorLimite: valor,
        periodo,
        cor: corAleatoria
      });
    } else {
      adicionarMeta({
        categoria,
        valorLimite: valor,
        periodo,
        ativa: true,
        cor: corAleatoria
      });
    }

    limparFormulario();
    setModalVisible(false);
    Alert.alert('Sucesso', editandoMeta ? 'Meta atualizada!' : 'Meta criada com sucesso!');
  };

  const editarMeta = (meta: any) => {
    setEditandoMeta(meta.id);
    setCategoria(meta.categoria);
    setValorLimite(meta.valorLimite.toString());
    setPeriodo(meta.periodo);
    setModalVisible(true);
  };

  const confirmarRemocao = (id: string, categoria: string) => {
    Alert.alert(
      'Remover Meta',
      `Deseja remover a meta de ${categoria}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removerMeta(id)
        }
      ]
    );
  };

  const limparFormulario = () => {
    setCategoria('');
    setValorLimite('');
    setPeriodo('mensal');
    setEditandoMeta(null);
  };

  const toggleMeta = (id: string, ativa: boolean) => {
    atualizarMeta(id, { ativa: !ativa });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metas e Orçamento</Text>
        <Text style={styles.headerSubtitle}>
          Controle seus gastos por categoria
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nova Meta</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {progressoMetas.map((meta) => (
          <View key={meta.id} style={styles.metaCard}>
            <View style={styles.metaHeader}>
              <View style={styles.metaInfo}>
                <View style={styles.metaTitleRow}>
                  <View style={[styles.metaIndicador, { backgroundColor: meta.cor }]} />
                  <Text style={styles.metaCategoria}>{meta.categoria}</Text>
                  <Text style={styles.metaPeriodo}>({meta.periodo})</Text>
                </View>
                <View style={styles.metaActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => editarMeta(meta)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => confirmarRemocao(meta.id, meta.categoria)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.metaProgresso}>
              <View style={styles.progressoInfo}>
                <Text style={styles.valorGasto}>
                  {formatarMoeda(meta.totalGasto)} de {formatarMoeda(meta.valorLimite)}
                </Text>
                <View style={styles.statusContainer}>
                  {meta.status === 'excedido' && (
                    <>
                      <AlertTriangle size={16} color="#EF4444" />
                      <Text style={[styles.statusText, { color: '#EF4444' }]}>Excedido</Text>
                    </>
                  )}
                  {meta.status === 'alerta' && (
                    <>
                      <AlertTriangle size={16} color="#F59E0B" />
                      <Text style={[styles.statusText, { color: '#F59E0B' }]}>Atenção</Text>
                    </>
                  )}
                  {meta.status === 'ok' && (
                    <>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={[styles.statusText, { color: '#10B981' }]}>No limite</Text>
                    </>
                  )}
                </View>
              </View>
              
              <View style={styles.barraContainer}>
                <View 
                  style={[
                    styles.barraProgresso, 
                    { 
                      width: `${meta.percentual}%`,
                      backgroundColor: meta.status === 'excedido' ? '#EF4444' : 
                                     meta.status === 'alerta' ? '#F59E0B' : '#10B981'
                    }
                  ]} 
                />
              </View>
              
              <Text style={styles.percentualText}>{meta.percentual.toFixed(1)}% utilizado</Text>
            </View>

            <View style={styles.metaFooter}>
              <Text style={styles.restanteText}>
                Restante: {formatarMoeda(Math.max(0, meta.valorLimite - meta.totalGasto))}
              </Text>
              <TouchableOpacity 
                style={[styles.toggleButton, meta.ativa && styles.toggleButtonActive]}
                onPress={() => toggleMeta(meta.id, meta.ativa)}
              >
                <Text style={[
                  styles.toggleButtonText,
                  meta.ativa && styles.toggleButtonTextActive
                ]}>
                  {meta.ativa ? 'Ativa' : 'Inativa'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {metas.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhuma meta definida</Text>
            <Text style={styles.emptySubtitle}>
              Crie metas de gastos para manter suas finanças organizadas
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
              <Text style={styles.modalTitle}>
                {editandoMeta ? 'Editar Meta' : 'Nova Meta'}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                limparFormulario();
              }}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
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
                <Text style={styles.label}>Valor Limite</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.input}
                    value={valorLimite}
                    onChangeText={setValorLimite}
                    placeholder="0,00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Período</Text>
                <View style={styles.periodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.periodButton,
                      periodo === 'semanal' && styles.periodButtonActive
                    ]}
                    onPress={() => setPeriodo('semanal')}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      periodo === 'semanal' && styles.periodButtonTextActive
                    ]}>
                      Semanal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.periodButton,
                      periodo === 'mensal' && styles.periodButtonActive
                    ]}
                    onPress={() => setPeriodo('mensal')}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      periodo === 'mensal' && styles.periodButtonTextActive
                    ]}>
                      Mensal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={salvarMeta}>
                <Text style={styles.saveButtonText}>
                  {editandoMeta ? 'Atualizar Meta' : 'Criar Meta'}
                </Text>
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
    backgroundColor: '#8B5CF6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  metaHeader: {
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIndicador: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  metaCategoria: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  metaPeriodo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  metaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  metaProgresso: {
    marginBottom: 16,
  },
  progressoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valorGasto: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  barraContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barraProgresso: {
    height: '100%',
    borderRadius: 4,
  },
  percentualText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  metaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restanteText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  toggleButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#10B981',
  },
  toggleButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
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
    maxHeight: '80%',
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
    backgroundColor: '#8B5CF6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  periodButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
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