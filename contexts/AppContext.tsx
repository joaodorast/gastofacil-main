import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Gasto {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  data: Date;
  tipo: 'voz' | 'foto' | 'manual';
}

export interface Receita {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  data: Date;
  tipo: 'salario' | 'freelance' | 'investimento' | 'outros';
}

export interface Meta {
  id: string;
  categoria: string;
  valorLimite: number;
  periodo: 'mensal' | 'semanal';
  ativa: boolean;
  cor: string;
}

export interface Lembrete {
  id: string;
  titulo: string;
  descricao: string;
  valor?: number;
  dataVencimento: Date;
  recorrente: boolean;
  tipoRecorrencia?: 'diario' | 'semanal' | 'mensal' | 'anual';
  concluido: boolean;
  categoria: string;
}

interface AppContextType {
  gastos: Gasto[];
  receitas: Receita[];
  metas: Meta[];
  lembretes: Lembrete[];
  adicionarGasto: (gasto: Omit<Gasto, 'id'>) => void;
  removerGasto: (id: string) => void;
  adicionarReceita: (receita: Omit<Receita, 'id'>) => void;
  removerReceita: (id: string) => void;
  adicionarMeta: (meta: Omit<Meta, 'id'>) => void;
  removerMeta: (id: string) => void;
  atualizarMeta: (id: string, meta: Partial<Meta>) => void;
  adicionarLembrete: (lembrete: Omit<Lembrete, 'id'>) => void;
  removerLembrete: (id: string) => void;
  marcarLembreteConcluido: (id: string) => void;
  limparGastos: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [metas, setMetas] = useState<Meta[]>([
    {
      id: '1',
      categoria: 'Alimentação',
      valorLimite: 800,
      periodo: 'mensal',
      ativa: true,
      cor: '#EF4444'
    },
    {
      id: '2',
      categoria: 'Transporte',
      valorLimite: 400,
      periodo: 'mensal',
      ativa: true,
      cor: '#3B82F6'
    }
  ]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([
    {
      id: '1',
      titulo: 'Conta de Luz',
      descricao: 'Vencimento da conta de energia elétrica',
      valor: 150,
      dataVencimento: new Date(2025, 0, 15),
      recorrente: true,
      tipoRecorrencia: 'mensal',
      concluido: false,
      categoria: 'Casa'
    }
  ]);

  const adicionarGasto = (novoGasto: Omit<Gasto, 'id'>) => {
    const gasto: Gasto = {
      ...novoGasto,
      id: Date.now().toString(),
    };
    setGastos(prev => [gasto, ...prev]);
  };

  const removerGasto = (id: string) => {
    setGastos(prev => prev.filter(gasto => gasto.id !== id));
  };

  const adicionarReceita = (novaReceita: Omit<Receita, 'id'>) => {
    const receita: Receita = {
      ...novaReceita,
      id: Date.now().toString(),
    };
    setReceitas(prev => [receita, ...prev]);
  };

  const removerReceita = (id: string) => {
    setReceitas(prev => prev.filter(receita => receita.id !== id));
  };

  const adicionarMeta = (novaMeta: Omit<Meta, 'id'>) => {
    const meta: Meta = {
      ...novaMeta,
      id: Date.now().toString(),
    };
    setMetas(prev => [...prev, meta]);
  };

  const removerMeta = (id: string) => {
    setMetas(prev => prev.filter(meta => meta.id !== id));
  };

  const atualizarMeta = (id: string, metaAtualizada: Partial<Meta>) => {
    setMetas(prev => prev.map(meta => 
      meta.id === id ? { ...meta, ...metaAtualizada } : meta
    ));
  };

  const adicionarLembrete = (novoLembrete: Omit<Lembrete, 'id'>) => {
    const lembrete: Lembrete = {
      ...novoLembrete,
      id: Date.now().toString(),
    };
    setLembretes(prev => [...prev, lembrete]);
  };

  const removerLembrete = (id: string) => {
    setLembretes(prev => prev.filter(lembrete => lembrete.id !== id));
  };

  const marcarLembreteConcluido = (id: string) => {
    setLembretes(prev => prev.map(lembrete =>
      lembrete.id === id ? { ...lembrete, concluido: !lembrete.concluido } : lembrete
    ));
  };

  const limparGastos = () => {
    setGastos([]);
  };

  return (
    <AppContext.Provider value={{
      gastos,
      receitas,
      metas,
      lembretes,
      adicionarGasto,
      removerGasto,
      adicionarReceita,
      removerReceita,
      adicionarMeta,
      removerMeta,
      atualizarMeta,
      adicionarLembrete,
      removerLembrete,
      marcarLembreteConcluido,
      limparGastos,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}