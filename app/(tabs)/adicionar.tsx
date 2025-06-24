import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Mic, Camera, DollarSign, Tag, Calendar, Check, MicOff } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '@/contexts/AppContext';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

export default function AdicionarScreen() {
  const router = useRouter();
  const { adicionarGasto } = useApp();
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecognition();
  const [modoCaptura, setModoCaptura] = useState<'menu' | 'voz' | 'camera'>('menu');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const categorias = [
    'Alimentação', 'Transporte', 'Compras', 'Lazer', 
    'Saúde', 'Educação', 'Casa', 'Outros'
  ];

  const iniciarGravacao = async () => {
    const success = await startRecording();
    if (!success) {
      Alert.alert('Erro', 'Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const pararGravacao = async () => {
    const result = await stopRecording();
    
    if (result) {
      if (result.valor) setValor(result.valor.toString());
      if (result.descricao) setDescricao(result.descricao);
      if (result.categoria) setCategoria(result.categoria);
      
      Alert.alert(
        'Reconhecimento de Voz',
        `Detectado: ${result.descricao} - R$ ${result.valor?.toFixed(2) || '0,00'}`,
        [
          {
            text: 'Salvar',
            onPress: () => {
              if (result.valor && result.descricao) {
                adicionarGasto({
                  valor: result.valor,
                  descricao: result.descricao,
                  categoria: result.categoria || 'Outros',
                  data: new Date(),
                  tipo: 'voz'
                });
                limparFormulario();
                Alert.alert('Sucesso', 'Gasto salvo com sucesso!');
              }
            }
          },
          {
            text: 'Editar',
            style: 'cancel'
          }
        ]
      );
    } else {
      Alert.alert('Erro', 'Não foi possível processar o áudio. Tente novamente.');
    }
  };

  const processarVoz = async () => {
    if (isRecording) {
      await pararGravacao();
    } else {
      await iniciarGravacao();
    }
  };

  const tirarFoto = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Erro', 'Permissão de câmera necessária');
        return;
      }
    }
    setModoCaptura('camera');
  };

  const processarFoto = () => {
    // Simular OCR da foto
    const valorSimulado = (Math.random() * 200 + 20).toFixed(2);
    const estabelecimentos = ['Supermercado Extra', 'Farmácia São Paulo', 'Posto Shell', 'McDonald\'s', 'Subway'];
    const estabelecimento = estabelecimentos[Math.floor(Math.random() * estabelecimentos.length)];
    
    setDescricao(estabelecimento);
    setValor(valorSimulado);
    setCategoria('Compras');
    setModoCaptura('menu');
    
    Alert.alert('Sucesso', 'Dados extraídos da foto!', [
      {
        text: 'Salvar',
        onPress: () => {
          adicionarGasto({
            valor: parseFloat(valorSimulado),
            descricao: estabelecimento,
            categoria: 'Compras',
            data: new Date(),
            tipo: 'foto'
          });
          limparFormulario();
          Alert.alert('Sucesso', 'Gasto salvo com sucesso!');
        }
      },
      {
        text: 'Editar',
        style: 'cancel'
      }
    ]);
  };

  const salvarGasto = () => {
    if (!valor || !descricao) {
      Alert.alert('Erro', 'Preencha valor e descrição');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um valor válido');
      return;
    }

    adicionarGasto({
      valor: valorNumerico,
      descricao,
      categoria: categoria || 'Outros',
      data: new Date(),
      tipo: 'manual'
    });

    limparFormulario();
    Alert.alert('Sucesso', 'Gasto salvo com sucesso!');
  };

  const limparFormulario = () => {
    setValor('');
    setDescricao('');
    setCategoria('');
  };

  if (modoCaptura === 'camera') {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera}>
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraInstrucao}>
              Posicione o recibo na tela e toque para capturar
            </Text>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={processarFoto}
            >
              <Camera size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setModoCaptura('menu')}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adicionar Gasto</Text>
        <Text style={styles.headerSubtitle}>
          Registre rapidamente por voz ou foto
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.methodsContainer}>
          <TouchableOpacity 
            style={[
              styles.methodButton, 
              styles.voiceButton,
              (isRecording || isProcessing) && styles.voiceButtonActive
            ]}
            onPress={processarVoz}
            disabled={isProcessing}
          >
            {isRecording ? (
              <MicOff size={32} color="#FFFFFF" />
            ) : (
              <Mic size={32} color="#FFFFFF" />
            )}
            <Text style={styles.methodButtonText}>
              {isProcessing ? 'Processando...' : 
               isRecording ? 'Toque para Parar' : 'Registrar por Voz'}
            </Text>
            <Text style={styles.methodButtonSubtext}>
              {isRecording ? 'Fale agora: "Gastei R$ 25 com lanche"' : 
               '"Gastei R$ 25 com lanche"'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodButton, styles.photoButton]}
            onPress={tirarFoto}
          >
            <Camera size={32} color="#FFFFFF" />
            <Text style={styles.methodButtonText}>Fotografar Recibo</Text>
            <Text style={styles.methodButtonSubtext}>
              Extrair dados automaticamente
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou preencha manualmente</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <DollarSign size={20} color="#6B7280" />
              <Text style={styles.inputLabel}>Valor</Text>
            </View>
            <TextInput
              style={styles.input}
              value={valor}
              onChangeText={setValor}
              placeholder="0,00"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Tag size={20} color="#6B7280" />
              <Text style={styles.inputLabel}>Descrição</Text>
            </View>
            <TextInput
              style={styles.input}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex: Almoço no restaurante"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.inputLabel}>Categoria</Text>
            </View>
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

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={salvarGasto}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Salvar Gasto</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 20,
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  methodButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  voiceButton: {
    backgroundColor: '#EF4444',
  },
  voiceButtonActive: {
    backgroundColor: '#DC2626',
  },
  photoButton: {
    backgroundColor: '#3B82F6',
  },
  methodButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  methodButtonSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#6B7280',
    borderColor: '#6B7280',
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
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraInstrucao: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  captureButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});