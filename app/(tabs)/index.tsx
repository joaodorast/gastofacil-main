import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Calendar, DollarSign, Plus, TrendingUp, TrendingDown, History, FileText } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { gastos, receitas } = useApp();
  const [totalDia, setTotalDia] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [receitasMes, setReceitasMes] = useState(0);
  const [saldoMes, setSaldoMes] = useState(0);

  useEffect(() => {
    // Calcular totais
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const gastosDia = gastos.filter(g => 
      g.data.toDateString() === hoje.toDateString()
    );
    
    const gastosMes = gastos.filter(g => 
      g.data >= inicioMes
    );

    const receitasMesAtual = receitas.filter(r => 
      r.data >= inicioMes
    );

    const totalGastosMes = gastosMes.reduce((sum, g) => sum + g.valor, 0);
    const totalReceitasMes = receitasMesAtual.reduce((sum, r) => sum + r.valor, 0);

    setTotalDia(gastosDia.reduce((sum, g) => sum + g.valor, 0));
    setTotalMes(totalGastosMes);
    setReceitasMes(totalReceitasMes);
    setSaldoMes(totalReceitasMes - totalGastosMes);
  }, [gastos, receitas]);

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const obterDataFormatada = () => {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const irParaAdicionar = () => {
    router.push('/(tabs)/adicionar');
  };

  const irParaHistorico = () => {
    router.push('/historico');
  };

  const irParaReceitas = () => {
    router.push('/receitas');
  };

  const irParaRelatorios = () => {
    router.push('/relatorios');
  };

  const irParaLembretes = () => {
    router.push('/lembretes');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GastoFácil</Text>
        <Text style={styles.headerDate}>{obterDataFormatada()}</Text>
      </View>

      <View style={styles.resumoContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <DollarSign size={24} color="#6B7280" />
            <Text style={styles.cardTitle}>Hoje</Text>
          </View>
          <Text style={styles.cardValue}>{formatarMoeda(totalDia)}</Text>
          <Text style={styles.cardSubtext}>
            {gastos.filter(g => g.data.toDateString() === new Date().toDateString()).length} gastos
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={24} color="#6B7280" />
            <Text style={styles.cardTitle}>Este Mês</Text>
          </View>
          <Text style={styles.cardValue}>{formatarMoeda(totalMes)}</Text>
          <Text style={styles.cardSubtext}>
            {gastos.length} gastos total
          </Text>
        </View>
      </View>

      <View style={styles.saldoContainer}>
        <View style={[styles.saldoCard, { borderLeftColor: saldoMes >= 0 ? '#10B981' : '#EF4444' }]}>
          <View style={styles.saldoHeader}>
            <TrendingUp size={20} color={saldoMes >= 0 ? '#10B981' : '#EF4444'} />
            <Text style={styles.saldoTitle}>Saldo do Mês</Text>
          </View>
          <Text style={[styles.saldoValue, { color: saldoMes >= 0 ? '#10B981' : '#EF4444' }]}>
            {formatarMoeda(saldoMes)}
          </Text>
          <View style={styles.saldoDetalhes}>
            <Text style={styles.saldoDetalhe}>
              Receitas: <Text style={styles.receitaText}>{formatarMoeda(receitasMes)}</Text>
            </Text>
            <Text style={styles.saldoDetalhe}>
              Gastos: <Text style={styles.gastoText}>{formatarMoeda(totalMes)}</Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#EF4444' }]} onPress={irParaAdicionar}>
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Adicionar Gasto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#10B981' }]} onPress={irParaReceitas}>
            <TrendingUp size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Receitas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#3B82F6' }]} onPress={irParaHistorico}>
            <History size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F59E0B' }]} onPress={irParaLembretes}>
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Lembretes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#8B5CF6' }]} onPress={irParaRelatorios}>
            <FileText size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gastos Recentes</Text>
        
        {gastos.length === 0 ? (
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum gasto registrado</Text>
            <Text style={styles.emptySubtitle}>
              Comece adicionando seu primeiro gasto
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={irParaAdicionar}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Adicionar Gasto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          gastos.slice(0, 5).map((gasto) => (
            <TouchableOpacity key={gasto.id} style={styles.gastoItem}>
              <View style={styles.gastoInfo}>
                <Text style={styles.gastoDescricao}>{gasto.descricao}</Text>
                <Text style={styles.gastoCategoria}>{gasto.categoria}</Text>
              </View>
              <View style={styles.gastoValor}>
                <Text style={styles.gastoValorText}>{formatarMoeda(gasto.valor)}</Text>
                <View style={[
                  styles.gastoTipo,
                  { 
                    backgroundColor: gasto.tipo === 'voz' ? '#EF4444' : 
                                   gasto.tipo === 'foto' ? '#3B82F6' : '#10B981'
                  }
                ]}>
                  <Text style={styles.gastoTipoText}>
                    {gasto.tipo === 'voz' ? 'VOZ' : 
                     gasto.tipo === 'foto' ? 'FOTO' : 'MANUAL'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    textTransform: 'capitalize',
  },
  resumoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  saldoContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saldoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saldoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  saldoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 8,
  },
  saldoValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  saldoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saldoDetalhe: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  receitaText: {
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  gastoText: {
    color: '#EF4444',
    fontFamily: 'Inter-SemiBold',
  },
  actionsContainer: {
    padding: 20,
  },
  actionsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  gastoItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  gastoCategoria: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  gastoValor: {
    alignItems: 'flex-end',
  },
  gastoValorText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  gastoTipo: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gastoTipoText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});