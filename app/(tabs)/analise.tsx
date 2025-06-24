import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useMemo } from 'react';
import { TrendingUp, ChartPie as PieChart, Calendar, DollarSign } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

export default function AnaliseScreen() {
  const { gastos } = useApp();

  const dados = useMemo(() => {
    if (gastos.length === 0) {
      return {
        categorias: [],
        diasSemana: [],
        evolucaoMensal: [],
        totalGastos: 0,
        mediaDiaria: 0
      };
    }

    // Agrupar por categoria
    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.valor;
      return acc;
    }, {} as Record<string, number>);

    const totalGastos = Object.values(gastosPorCategoria).reduce((sum, valor) => sum + valor, 0);

    const cores = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    
    const categorias = Object.entries(gastosPorCategoria)
      .map(([nome, valor], index) => ({
        nome,
        valor,
        cor: cores[index % cores.length],
        percentual: Math.round((valor / totalGastos) * 100)
      }))
      .sort((a, b) => b.valor - a.valor);

    // Gastos por dia da semana
    const gastosPorDia = gastos.reduce((acc, gasto) => {
      const dia = gasto.data.getDay();
      const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const nomeDia = nomes[dia];
      acc[nomeDia] = (acc[nomeDia] || 0) + gasto.valor;
      return acc;
    }, {} as Record<string, number>);

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => ({
      dia,
      valor: gastosPorDia[dia] || 0
    }));

    // Evolução mensal (últimos 4 meses)
    const hoje = new Date();
    const evolucaoMensal = [];
    
    for (let i = 3; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);
      
      const gastosMes = gastos.filter(g => g.data >= mes && g.data < proximoMes);
      const totalMes = gastosMes.reduce((sum, g) => sum + g.valor, 0);
      
      evolucaoMensal.push({
        mes: mes.toLocaleDateString('pt-BR', { month: 'short' }),
        valor: totalMes
      });
    }

    const mediaDiaria = totalGastos / Math.max(1, gastos.length);

    return {
      categorias,
      diasSemana,
      evolucaoMensal,
      totalGastos,
      mediaDiaria
    };
  }, [gastos]);

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const renderBarraCategoria = (categoria: typeof dados.categorias[0]) => {
    const largura = (categoria.percentual / 100) * (width - 80);
    
    return (
      <View key={categoria.nome} style={styles.categoriaItem}>
        <View style={styles.categoriaHeader}>
          <View style={styles.categoriaInfo}>
            <View style={[styles.categoriaIndicador, { backgroundColor: categoria.cor }]} />
            <Text style={styles.categoriaNome}>{categoria.nome}</Text>
          </View>
          <Text style={styles.categoriaValor}>{formatarMoeda(categoria.valor)}</Text>
        </View>
        <View style={styles.barraContainer}>
          <View 
            style={[
              styles.barra, 
              { width: largura, backgroundColor: categoria.cor }
            ]} 
          />
        </View>
        <Text style={styles.categoriaPercentual}>{categoria.percentual}% do total</Text>
      </View>
    );
  };

  const renderGraficoSemana = () => {
    const maxDiaSemana = Math.max(...dados.diasSemana.map(d => d.valor), 1);
    
    return (
      <View style={styles.graficoSemana}>
        {dados.diasSemana.map((dia) => {
          const altura = (dia.valor / maxDiaSemana) * 120;
          return (
            <View key={dia.dia} style={styles.diaSemanaContainer}>
              <View style={styles.barraVerticalContainer}>
                <View 
                  style={[
                    styles.barraVertical, 
                    { height: altura, backgroundColor: '#6B7280' }
                  ]} 
                />
              </View>
              <Text style={styles.diaSemanaLabel}>{dia.dia}</Text>
              <Text style={styles.diaSemanaValor}>
                R$ {dia.valor.toFixed(0)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (gastos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Análise</Text>
          <Text style={styles.headerSubtitle}>
            Insights dos seus gastos
          </Text>
        </View>
        
        <View style={styles.emptyState}>
          <TrendingUp size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhum dado para análise</Text>
          <Text style={styles.emptySubtitle}>
            Adicione alguns gastos para ver suas análises aqui
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análise</Text>
        <Text style={styles.headerSubtitle}>
          Insights dos seus gastos
        </Text>
      </View>

      <View style={styles.resumoCards}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <DollarSign size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Total Gasto</Text>
          </View>
          <Text style={styles.cardValue}>{formatarMoeda(dados.totalGastos)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#6B7280" />
            <Text style={styles.cardTitle}>Média por Gasto</Text>
          </View>
          <Text style={styles.cardValue}>{formatarMoeda(dados.mediaDiaria)}</Text>
        </View>
      </View>

      {dados.categorias.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <PieChart size={24} color="#6B7280" />
            <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
          </View>
          
          <View style={styles.categoriasContainer}>
            {dados.categorias.map(renderBarraCategoria)}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={24} color="#6B7280" />
          <Text style={styles.sectionTitle}>Gastos da Semana</Text>
        </View>
        
        {renderGraficoSemana()}
      </View>

      {dados.evolucaoMensal.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color="#6B7280" />
            <Text style={styles.sectionTitle}>Evolução Mensal</Text>
          </View>
          
          <View style={styles.evolucaoContainer}>
            {dados.evolucaoMensal.map((mes, index) => (
              <View key={mes.mes} style={styles.mesItem}>
                <Text style={styles.mesLabel}>{mes.mes}</Text>
                <Text style={styles.mesValor}>{formatarMoeda(mes.valor)}</Text>
                {index > 0 && dados.evolucaoMensal[index - 1].valor > 0 && (
                  <View style={styles.variacao}>
                    <Text style={[
                      styles.variacaoTexto,
                      { color: mes.valor > dados.evolucaoMensal[index - 1].valor ? '#EF4444' : '#10B981' }
                    ]}>
                      {mes.valor > dados.evolucaoMensal[index - 1].valor ? '+' : ''}
                      {(((mes.valor - dados.evolucaoMensal[index - 1].valor) / dados.evolucaoMensal[index - 1].valor) * 100).toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {dados.categorias.length > 0 && (
        <View style={styles.insights}>
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          <View style={styles.insight}>
            <Text style={styles.insightText}>
              Sua maior categoria de gastos é <Text style={styles.destaque}>{dados.categorias[0].nome}</Text> com {dados.categorias[0].percentual}% do total
            </Text>
          </View>
          <View style={styles.insight}>
            <Text style={styles.insightText}>
              Você já registrou {gastos.length} gastos no total
            </Text>
          </View>
          <View style={styles.insight}>
            <Text style={styles.insightText}>
              Valor médio por gasto: {formatarMoeda(dados.mediaDiaria)}
            </Text>
          </View>
        </View>
      )}
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
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 8,
  },
  categoriasContainer: {
    gap: 16,
  },
  categoriaItem: {
    gap: 8,
  },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriaIndicador: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoriaNome: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  categoriaValor: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  barraContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  barra: {
    height: 8,
    borderRadius: 4,
  },
  categoriaPercentual: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  graficoSemana: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 40,
  },
  diaSemanaContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barraVerticalContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barraVertical: {
    width: 20,
    borderRadius: 4,
  },
  diaSemanaLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
  },
  diaSemanaValor: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  evolucaoContainer: {
    gap: 12,
  },
  mesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mesLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  mesValor: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  variacao: {
    position: 'absolute',
    right: 0,
    top: 30,
  },
  variacaoTexto: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  insights: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
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
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  insight: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  destaque: {
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
});