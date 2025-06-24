import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Download, Upload, Trash2, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function ConfiguracoesScreen() {
  const { limparGastos } = useApp();
  const [notificacoes, setNotificacoes] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [backupAutomatico, setBackupAutomatico] = useState(true);
  const [biometria, setBiometria] = useState(false);

  const confirmarLimpeza = () => {
    Alert.alert(
      'Limpar Dados',
      'Esta ação irá remover todos os gastos, receitas e lembretes. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: () => {
            limparGastos();
            Alert.alert('Sucesso', 'Dados limpos com sucesso!');
          }
        }
      ]
    );
  };

  const exportarDados = () => {
    Alert.alert('Exportar Dados', 'Funcionalidade será implementada em breve!');
  };

  const importarDados = () => {
    Alert.alert('Importar Dados', 'Funcionalidade será implementada em breve!');
  };

  const abrirAjuda = () => {
    Alert.alert('Ajuda', 'Central de ajuda será implementada em breve!');
  };

  const sair = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            // Implementar logout
            Alert.alert('Logout', 'Funcionalidade será implementada!');
          }
        }
      ]
    );
  };

  const ConfigItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    color = '#6B7280',
    showChevron = true 
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    color?: string;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.configItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.configItemLeft}>
        <View style={[styles.configIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.configText}>
          <Text style={styles.configTitle}>{title}</Text>
          {subtitle && <Text style={styles.configSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.configItemRight}>
        {rightElement}
        {showChevron && onPress && (
          <ChevronRight size={16} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Text style={styles.headerSubtitle}>
          Personalize sua experiência
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={User}
            title="Minha Conta"
            subtitle="Gerenciar informações pessoais"
            onPress={() => Alert.alert('Perfil', 'Tela de perfil será implementada!')}
            color="#3B82F6"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={Bell}
            title="Notificações Push"
            subtitle="Receber alertas de lembretes e metas"
            rightElement={
              <Switch
                value={notificacoes}
                onValueChange={setNotificacoes}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={notificacoes ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showChevron={false}
            color="#10B981"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={Palette}
            title="Modo Escuro"
            subtitle="Alternar entre tema claro e escuro"
            rightElement={
              <Switch
                value={modoEscuro}
                onValueChange={setModoEscuro}
                trackColor={{ false: '#E5E7EB', true: '#6B7280' }}
                thumbColor={modoEscuro ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showChevron={false}
            color="#8B5CF6"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segurança</Text>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={Shield}
            title="Autenticação Biométrica"
            subtitle="Usar impressão digital ou Face ID"
            rightElement={
              <Switch
                value={biometria}
                onValueChange={setBiometria}
                trackColor={{ false: '#E5E7EB', true: '#EF4444' }}
                thumbColor={biometria ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showChevron={false}
            color="#EF4444"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados</Text>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={Upload}
            title="Backup Automático"
            subtitle="Sincronizar dados na nuvem"
            rightElement={
              <Switch
                value={backupAutomatico}
                onValueChange={setBackupAutomatico}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={backupAutomatico ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showChevron={false}
            color="#3B82F6"
          />
          
          <ConfigItem
            icon={Download}
            title="Exportar Dados"
            subtitle="Baixar seus dados em formato CSV"
            onPress={exportarDados}
            color="#10B981"
          />
          
          <ConfigItem
            icon={Upload}
            title="Importar Dados"
            subtitle="Restaurar dados de um backup"
            onPress={importarDados}
            color="#F59E0B"
          />
          
          <ConfigItem
            icon={Trash2}
            title="Limpar Dados"
            subtitle="Remover todos os dados do app"
            onPress={confirmarLimpeza}
            color="#EF4444"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suporte</Text>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={HelpCircle}
            title="Central de Ajuda"
            subtitle="FAQ e tutoriais"
            onPress={abrirAjuda}
            color="#8B5CF6"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionContent}>
          <ConfigItem
            icon={LogOut}
            title="Sair da Conta"
            subtitle="Fazer logout do aplicativo"
            onPress={sair}
            color="#EF4444"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>GastoFácil v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          Desenvolvido com ❤️ para ajudar você a controlar suas finanças
        </Text>
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
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  configItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  configText: {
    flex: 1,
  },
  configTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  configSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  configItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});