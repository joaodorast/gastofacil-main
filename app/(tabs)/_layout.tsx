import { Tabs } from 'expo-router';
import { Chrome as Home, Plus, History, TrendingUp, Target, FileText, Settings, DollarSign, Bell } from 'lucide-react-native';
import { AppProvider } from '@/contexts/AppContext';

export default function TabLayout() {
  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingTop: 8,
            paddingBottom: 8,
            height: 80,
          },
          tabBarActiveTintColor: '#374151',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
            fontFamily: 'Inter-SemiBold',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="adicionar"
          options={{
            title: 'Adicionar',
            tabBarIcon: ({ size, color }) => (
              <Plus size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="receitas"
          options={{
            title: 'Receitas',
            tabBarIcon: ({ size, color }) => (
              <DollarSign size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="metas"
          options={{
            title: 'Metas',
            tabBarIcon: ({ size, color }) => (
              <Target size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="relatorios"
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ size, color }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="lembretes"
          options={{
            title: 'Lembretes',
            tabBarIcon: ({ size, color }) => (
              <Bell size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="historico"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ size, color }) => (
              <History size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analise"
          options={{
            title: 'Análise',
            tabBarIcon: ({ size, color }) => (
              <TrendingUp size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="configuracoes"
          options={{
            title: 'Config',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AppProvider>
  );
}