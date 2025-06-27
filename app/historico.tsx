import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, Filter, Calendar, Trash2, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function HistoricoScreen() {
  const router = useRouter();
  const { gastos, removerGasto } = useApp();
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const categorias = ['Todas', 'Alimentação', 'Transporte', 'Compras', 'Saúde', 'Lazer', 'Educação', 'Casa', 'Outros'];

  const gastosFiltrados = gastos.filter(gasto => {
    const matchDescricao = gasto.descricao.toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = categoriaFiltro === 'Todas' || gasto.categoria === categoriaFiltro;
    return matchDescricao && matchCategoria;
  });

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

  const confirmarRemocao = (id: string, descricao: string) => {
    Alert.alert(
      'Remover Gasto',
      `Deseja remover "${descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removerGasto(id)
        }
      ]
    );
  };

  const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + gasto.valor, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Histórico</Text>
          <Text style={styles.headerSubtitle}>
            {gastosFiltrados.length} gastos • {formatarMoeda(totalGastos)}
          </Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar gastos..."
            value={filtro}
            onChangeText={setFiltro}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesFilter}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryFilterButton,
                  categoriaFiltro === cat && styles.categoryFilterButtonActive
                ]}
                onPress={() => setCategoriaFiltro(cat)}
              >
                <Text style={[
                  styles.categoryFilterText,
                  categoriaFiltro === cat && styles.categoryFilterTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.listContainer}>
        {gastosFiltrados.map((gasto) => (
          <View key={gasto.id} style={styles.gastoItem}>
            <View style={styles.gastoMain}>
              <View style={styles.gastoInfo}>
                <Text style={styles.gastoDescricao}>{gasto.descricao}</Text>
                <View style={styles.gastoMeta}>
                  <Text style={styles.gastoCategoria}>{gasto.categoria}</Text>
                  <Text style={styles.gastoSeparator}>•</Text>
                  <Text style={styles.gastoData}>{formatarData(gasto.data)}</Text>
                  <View style={[
                    styles.gastoTipoIndicador,
                    { 
                      backgroundColor: gasto.tipo === 'voz' ? '#EF4444' : 
                                     gasto.tipo === 'foto' ? '#3B82F6' : '#10B981'
                    }
                  ]} />
                </View>
              </View>
              <View style={styles.gastoActions}>
                <Text style={styles.gastoValor}>{formatarMoeda(gasto.valor)}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => confirmarRemocao(gasto.id, gasto.descricao)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {gastosFiltrados.length === 0 && (
          <View style={styles.emptyState}>
            <Filter size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {gastos.length === 0 ? 'Nenhum gasto registrado' : 'Nenhum gasto encontrado'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {gastos.length === 0 
                ? 'Comece adicionando seu primeiro gasto'
                : 'Tente ajustar os filtros de busca'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#6B7280',
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  categoriesFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryFilterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryFilterButtonActive: {
    backgroundColor: '#6B7280',
  },
  categoryFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  categoryFilterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  gastoItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gastoMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gastoInfo: {
    flex: 1,
  },
  gastoDescricao: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  gastoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gastoCategoria: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  gastoSeparator: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  gastoData: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  gastoTipoIndicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  gastoActions: {
    alignItems: 'flex-end',
  },
  gastoValor: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
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
});