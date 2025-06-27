import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { DollarSign, Plus, Calendar, Tag, X, TrendingUp, Briefcase, PiggyBank, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function ReceitasScreen() {
  const router = useRouter();
  const { receitas, adicionarReceita, removerReceita } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState<'salario' | 'freelance' | 'investimento' | 'outros'>('salario');

  const categorias = ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'];
  const tipos = [
    { key: 'salario', label: 'Salário', icon: Briefcase, cor: '#10B981' },
    { key: 'freelance', label: 'Freelance', icon: DollarSign, cor: '#3B82F6' },
    { key: 'investimento', label: 'Investimento', icon: TrendingUp, cor: '#8B5CF6' },
    { key: 'outros', label: 'Outros', icon: PiggyBank, cor: '#F59E0B' }
  ];

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const formatarData = (data: Date) => {
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 86400000);
    
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return data.toLocaleDateString('pt-BR');
    }
  };

  const salvarReceita = () => {
    if (!valor || !descricao) {
      Alert.alert('Erro', 'Preencha valor e descrição');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    adicionarReceita({
      valor: valorNumerico,
      descricao,
      categoria: categoria || 'Outros',
      data: new Date(),
      tipo
    });

    limparFormulario();
    setModalVisible(false);
    Alert.alert('Sucesso', 'Receita adicionada com sucesso!');
  };

  const limparFormulario = () => {
    setValor('');
    setDescricao('');
    setCategoria('');
    setTipo('salario');
  };

  const totalReceitas = receitas.reduce((sum, receita) => sum + receita.valor, 0);
  const receitasMes = receitas.filter(r => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return r.data >= inicioMes;
  });
  const totalMes = receitasMes.reduce((sum, receita) => sum + receita.valor, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Receitas</Text>
          <Text style={styles.headerSubtitle}>
            Gerencie suas entradas financeiras
          </Text>
        </View>
      </View>

      <View style={styles.resumoCards}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Este Mês</Text>
          </View>
          <Text style={[styles.cardValue, { color: '#10B981' }]}>{formatarMoeda(totalMes)}</Text>
          <Text style={styles.cardSubtext}>{receitasMes.length} receitas</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <DollarSign size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Total Geral</Text>
          </View>
          <Text style={[styles.cardValue, { color: '#10B981' }]}>{formatarMoeda(totalReceitas)}</Text>
          <Text style={styles.cardSubtext}>{receitas.length} receitas</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nova Receita</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer}>
        {receitas.map((receita) => {
          const tipoInfo = tipos.find(t => t.key === receita.tipo) || tipos[3];
          const IconComponent = tipoInfo.icon;
          
          return (
            <View key={receita.id} style={styles.receitaItem}>
              <View style={styles.receitaIcon}>
                <IconComponent size={20} color={tipoInfo.cor} />
              </View>
              <View style={styles.receitaInfo}>
                <Text style={styles.receitaDescricao}>{receita.descricao}</Text>
                <View style={styles.receitaMeta}>
                  <Text style={styles.receitaCategoria}>{receita.categoria}</Text>
                  <Text style={styles.receitaSeparator}>•</Text>
                  <Text style={styles.receitaData}>{formatarData(receita.data)}</Text>
                </View>
              </View>
              <Text style={[styles.receitaValor, { color: '#10B981' }]}>
                +{formatarMoeda(receita.valor)}
              </Text>
            </View>
          );
        })}

        {receitas.length === 0 && (
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhuma receita registrada</Text>
            <Text style={styles.emptySubtitle}>
              Comece adicionando suas receitas para ter controle total das suas finanças
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Receita</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Receita</Text>
                <View style={styles.tiposContainer}>
                  {tipos.map((tipoItem) => {
                    const IconComponent = tipoItem.icon;
                    return (
                      <TouchableOpacity
                        key={tipoItem.key}
                        style={[
                          styles.tipoButton,
                          tipo === tipoItem.key && { backgroundColor: tipoItem.cor }
                        ]}
                        onPress={() => setTipo(tipoItem.key as any)}
                      >
                        <IconComponent 
                          size={16} 
                          color={tipo === tipoItem.key ? '#FFFFFF' : tipoItem.cor} 
                        />
                        <Text style={[
                          styles.tipoButtonText,
                          tipo === tipoItem.key && { color: '#FFFFFF' }
                        ]}>
                          {tipoItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor</Text>
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
                <Text style={styles.label}>Descrição</Text>
                <View style={styles.inputContainer}>
                  <Tag size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Ex: Salário mensal"
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

              <TouchableOpacity style={styles.saveButton} onPress={salvarReceita}>
                <Text style={styles.saveButtonText}>Salvar Receita</Text>
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
    backgroundColor: '#10B981',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 6,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  cardSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: '#10B981',
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
  receitaItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  receitaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  receitaInfo: {
    flex: 1,
  },
  receitaDescricao: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  receitaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receitaCategoria: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  receitaSeparator: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  receitaData: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  receitaValor: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
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
  tiposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tipoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
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
    backgroundColor: '#10B981',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#10B981',
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