import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react-native';

export default function CadastroScreen() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  
  // Etapa 1
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  
  // Etapa 2
  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');
  
  // Etapa 3
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  
  const [carregando, setCarregando] = useState(false);

  const proximaEtapa = () => {
    if (etapa === 1) {
      if (!nome.trim() || !sobrenome.trim()) {
        Alert.alert('Erro', 'Preencha nome e sobrenome');
        return;
      }
      setEtapa(2);
    } else if (etapa === 2) {
      if (!email || !confirmarEmail) {
        Alert.alert('Erro', 'Preencha os campos de e-mail');
        return;
      }
      if (email !== confirmarEmail) {
        Alert.alert('Erro', 'Os e-mails não coincidem');
        return;
      }
      setEtapa(3);
    }
  };

  const etapaAnterior = () => {
    if (etapa > 1) {
      setEtapa(etapa - 1);
    }
  };

  const finalizarCadastro = async () => {
    if (!senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha os campos de senha');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCarregando(true);
    
    // Simular cadastro
    setTimeout(() => {
      setCarregando(false);
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }, 2000);
  };

  const voltarParaLogin = () => {
    router.back();
  };

  const renderEtapa1 = () => (
    <View style={styles.form}>
      <Text style={styles.etapaTitle}>Vamos nos conhecer!</Text>
      <Text style={styles.etapaSubtitle}>Como você gostaria de ser chamado?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome</Text>
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sobrenome</Text>
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            value={sobrenome}
            onChangeText={setSobrenome}
            placeholder="Seu sobrenome"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={proximaEtapa}>
        <Text style={styles.nextButtonText}>Continuar</Text>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderEtapa2 = () => (
    <View style={styles.form}>
      <Text style={styles.etapaTitle}>Seu e-mail</Text>
      <Text style={styles.etapaSubtitle}>Precisamos do seu e-mail para criar sua conta</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar e-mail</Text>
        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            value={confirmarEmail}
            onChangeText={setConfirmarEmail}
            placeholder="Confirme seu e-mail"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={etapaAnterior}>
          <ArrowLeft size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={proximaEtapa}>
          <Text style={styles.nextButtonText}>Continuar</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEtapa3 = () => (
    <View style={styles.form}>
      <Text style={styles.etapaTitle}>Crie sua senha</Text>
      <Text style={styles.etapaSubtitle}>Escolha uma senha segura para proteger sua conta</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            {mostrarSenha ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" />
          <TextInput
            style={styles.input}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Confirme sua senha"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!mostrarConfirmarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
            {mostrarConfirmarSenha ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={etapaAnterior}>
          <ArrowLeft size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.finishButton, carregando && styles.finishButtonDisabled]} 
          onPress={finalizarCadastro}
          disabled={carregando}
        >
          <Text style={styles.finishButtonText}>
            {carregando ? 'Criando...' : 'Criar conta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={voltarParaLogin}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Criar Conta</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Etapa {etapa} de 3</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(etapa / 3) * 100}%` }]} />
          </View>
        </View>
      </View>

      {etapa === 1 && renderEtapa1()}
      {etapa === 2 && renderEtapa2()}
      {etapa === 3 && renderEtapa3()}
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
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  form: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  etapaTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  etapaSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 32,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    opacity: 0.7,
  },
  finishButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});