import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, ChartBar as BarChart3, ChartPie as PieChart, ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

export default function RelatoriosScreen() {
  const router = useRouter();
  const { gastos, receitas } = useApp();
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'semana' | 'mes' | 'trimestre' | 'ano'>('mes');
  const [tipoRelatorio, setTipoRelatorio] = useState<'gastos' | 'receitas' | 'balanco'>('balanco');

  const dadosRelatorio = useMemo(() => {
    const hoje = new Date();
    let dataInicio: Date;

    switch (periodoSelecionado) {
      case 'semana':
        const diaSemana = hoje.getDay();
        dataInicio = new Date(hoje.getTime() - (diaSemana * 24 * 60 * 60 * 1000));
        break;
      case 'mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'trimestre':
        const mesAtual = hoje.getMonth();
        const inicioTrimestre = Math.floor(mesAtual / 3) * 3;
        dataInicio = new Date(hoje.getFullYear(), inicioTrimestre, 1);
        break;
      case 'ano':
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        break;
    }

    const gastosPeriodo = gastos.filter(g => g.data >= dataInicio);
    const receitasPeriodo = receitas.filter(r => r.data >= dataInicio);

    const totalGastos = gastosPeriodo.reduce((sum, g) => sum + g.valor, 0);
    const totalReceitas = receitasPeriodo.reduce((sum, r) => sum + r.valor, 0);
    const saldo = totalReceitas - totalGastos;

    // Gastos por categoria
    const gastosPorCategoria = gastosPeriodo.reduce((acc, gasto) => {
      acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.valor;
      return acc;
    }, {} as Record<string, number>);

    // Receitas por tipo
    const receitasPorTipo = receitasPeriodo.reduce((acc, receita) => {
      acc[receita.tipo] = (acc[receita.tipo] || 0) + receita.valor;
      return acc;
    }, {} as Record<string, number>);

    // Evolução diária
    const evolucaoDiaria = [];
    const diasPeriodo = Math.ceil((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(diasPeriodo, 30); i++) {
      const data = new Date(dataInicio.getTime() + (i * 24 * 60 * 60 * 1000));
      const gastosData = gastosPeriodo.filter(g => 
        g.data.toDateString() === data.toDateString()
      );
      const receitasData = receitasPeriodo.filter(r => 
        r.data.toDateString() === data.toDateString()
      );
      
      evolucaoDiaria.push({
        data: data.getDate(),
        gastos: gastosData.reduce((sum, g) => sum + g.valor, 0),
        receitas: receitasData.reduce((sum, r) => sum + r.valor, 0)
      });
    }

    return {
      totalGastos,
      totalReceitas,
      saldo,
      gastosPorCategoria,
      receitasPorTipo,
      evolucaoDiaria,
      quantidadeGastos: gastosPeriodo.length,
      quantidadeReceitas: receitasPeriodo.length,
      mediaGastosDiaria: totalGastos / Math.max(diasPeriodo, 1),
      mediaReceitasDiaria: totalReceitas / Math.max(diasPeriodo, 1)
    };
  }, [gastos, receitas, periodoSelecionado]);

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  const formatarPeriodo = () => {
    const periodos = {
      semana: 'Esta Semana',
      mes: 'Este Mês',
      trimestre: 'Este Trimestre',
      ano: 'Este Ano'
    };
    return periodos[periodoSelecionado];
  };

  const exportarRelatorio = () => {
    // Simular exportação
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  const renderGraficoBarras = () => {
    const dados = tipoRelatorio === 'gastos' ? 
      Object.entries(dadosRelatorio.gastosPorCategoria) :
      Object.entries(dadosRelatorio.receitasPorTipo);
    
    if (dados.length === 0) return null;

    const maxValor = Math.max(...dados.map(([, valor]) => valor));
    const cores = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    return (
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitulo}>
          {tipoRelatorio === 'gastos' ? 'Gastos por Categoria' : 'Receitas por Tipo'}
        </Text>
        <View style={styles.barrasContainer}>
          {dados.map(([nome, valor], index) => {
            const altura = (valor / maxValor) * 120;
            return (
              <View key={nome} style={styles.barraItem}>
                <View style={styles.barraVerticalContainer}>
                  <View 
                    style={[
                      styles.barraVertical, 
                      { 
                        height: altura, 
                        backgroundColor: cores[index % cores.length] 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barraLabel} numberOfLines={1}>
                  {nome.length > 8 ? nome.substring(0, 8) + '...' : nome}
                </Text>
                <Text style={styles.barraValor}>
                  {formatarMoeda(valor)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderEvolucao = () => {
    if (dadosRelatorio.evolucaoDiaria.length === 0) return null;

    const maxValor = Math.max(
      ...dadosRelatorio.evolucaoDiaria.map(d => Math.max(d.gastos, d.receitas))
    );

    return (
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitulo}>Evolução Diária</Text>
        <View style={styles.evolucaoContainer}>
          {dadosRelatorio.evolucaoDiaria.slice(-14).map((dia, index) => {
            const alturaGastos = (dia.gastos / maxValor) * 80;
            const alturaReceitas = (dia.receitas / maxValor) * 80;
            
            return (
              <View key={index} style={styles.evolucaoItem}>
                <View style={styles.evolucaoBarras}>
                  <View 
                    style={[
                      styles.evolucaoBarra,
                      { height: alturaReceitas, backgroundColor: '#10B981' }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.evolucaoBarra,
                      { height: alturaGastos, backgroundColor: '#EF4444' }
                    ]} 
                  />
                </View>
                <Text style={styles.evolucaoLabel}>{dia.data}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legenda}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendaTexto}>Receitas</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendaTexto}>Gastos</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Relatórios</Text>
          <Text style={styles.headerSubtitle}>
            Análise detalhada das suas finanças
          </Text>
        </View>
      </View>

      <View style={styles.filtrosContainer}>
        <View style={styles.filtroGroup}>
          <Text style={styles.filtroLabel}>Período</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtroButtons}>
              {(['semana', 'mes', 'trimestre', 'ano'] as const).map((periodo) => (
                <TouchableOpacity
                  key={periodo}
                  style={[
                    styles.filtroButton,
                    periodoSelecionado === periodo && styles.filtroButtonActive
                  ]}
                  onPress={() => setPeriodoSelecionado(periodo)}
                >
                  <Text style={[
                    styles.filtroButtonText,
                    periodoSelecionado === periodo && styles.filtroButtonTextActive
                  ]}>
                    {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filtroGroup}>
          <Text style={styles.filtroLabel}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtroButtons}>
              {([
                { key: 'balanco', label: 'Balanço' },
                { key: 'gastos', label: 'Gastos' },
                { key: 'receitas', label: 'Receitas' }
              ] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo.key}
                  style={[
                    styles.filtroButton,
                    tipoRelatorio === tipo.key && styles.filtroButtonActive
                  ]}
                  onPress={() => setTipoRelatorio(tipo.key)}
                >
                  <Text style={[
                    styles.filtroButtonText,
                    tipoRelatorio === tipo.key && styles.filtroButtonTextActive
                  ]}>
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.resumoContainer}>
        <Text style={styles.resumoTitulo}>{formatarPeriodo()}</Text>
        
        <View style={styles.resumoCards}>
          <View style={[styles.resumoCard, { borderLeftColor: '#10B981' }]}>
            <View style={styles.resumoCardHeader}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.resumoCardTitulo}>Receitas</Text>
            </View>
            <Text style={[styles.resumoCardValor, { color: '#10B981' }]}>
              {formatarMoeda(dadosRelatorio.totalReceitas)}
            </Text>
            <Text style={styles.resumoCardSubtexto}>
              {dadosRelatorio.quantidadeReceitas} entradas
            </Text>
          </View>

          <View style={[styles.resumoCard, { borderLeftColor: '#EF4444' }]}>
            <View style={styles.resumoCardHeader}>
              <TrendingDown size={20} color="#EF4444" />
              <Text style={styles.resumoCardTitulo}>Gastos</Text>
            </View>
            <Text style={[styles.resumoCardValor, { color: '#EF4444' }]}>
              {formatarMoeda(dadosRelatorio.totalGastos)}
            </Text>
            <Text style={styles.resumoCardSubtexto}>
              {dadosRelatorio.quantidadeGastos} saídas
            </Text>
          </View>

          <View style={[
            styles.resumoCard, 
            { borderLeftColor: dadosRelatorio.saldo >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            <View style={styles.resumoCardHeader}>
              <BarChart3 size={20} color={dadosRelatorio.saldo >= 0 ? '#10B981' : '#EF4444'} />
              <Text style={styles.resumoCardTitulo}>Saldo</Text>
            </View>
            <Text style={[
              styles.resumoCardValor, 
              { color: dadosRelatorio.saldo >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              {formatarMoeda(dadosRelatorio.saldo)}
            </Text>
            <Text style={styles.resumoCardSubtexto}>
              {dadosRelatorio.saldo >= 0 ? 'Positivo' : 'Negativo'}
            </Text>
          </View>
        </View>
      </View>

      {tipoRelatorio === 'balanco' && renderEvolucao()}
      {tipoRelatorio !== 'balanco' && renderGraficoBarras()}

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitulo}>💡 Insights do Período</Text>
        
        <View style={styles.insight}>
          <Text style={styles.insightTexto}>
            Média diária de gastos: <Text style={styles.destaque}>
              {formatarMoeda(dadosRelatorio.mediaGastosDiaria)}
            </Text>
          </Text>
        </View>

        <View style={styles.insight}>
          <Text style={styles.insightTexto}>
            Média diária de receitas: <Text style={styles.destaque}>
              {formatarMoeda(dadosRelatorio.mediaReceitasDiaria)}
            </Text>
          </Text>
        </View>

        {Object.keys(dadosRelatorio.gastosPorCategoria).length > 0 && (
          <View style={styles.insight}>
            <Text style={styles.insightTexto}>
              Maior categoria de gastos: <Text style={styles.destaque}>
                {Object.entries(dadosRelatorio.gastosPorCategoria)
                  .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.exportContainer}>
        <TouchableOpacity style={styles.exportButton} onPress={exportarRelatorio}>
          <Download size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Exportar Relatório</Text>
        </TouchableOpacity>
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
    backgroundColor: '#3B82F6',
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
  filtrosContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtroGroup: {
    marginBottom: 16,
  },
  filtroLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  filtroButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filtroButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtroButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filtroButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  filtroButtonTextActive: {
    color: '#FFFFFF',
  },
  resumoContainer: {
    padding: 20,
  },
  resumoTitulo: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  resumoCards: {
    gap: 12,
  },
  resumoCard: {
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
  resumoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoCardTitulo: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 8,
  },
  resumoCardValor: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  resumoCardSubtexto: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  graficoContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  graficoTitulo: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  barrasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingBottom: 40,
  },
  barraItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
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
  barraLabel: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  barraValor: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  evolucaoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  evolucaoItem: {
    alignItems: 'center',
    flex: 1,
  },
  evolucaoBarras: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 8,
    gap: 1,
  },
  evolucaoBarra: {
    width: 6,
    borderRadius: 2,
  },
  evolucaoLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendaTexto: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  insightsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightsTitulo: {
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
  insightTexto: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  destaque: {
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  exportContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});