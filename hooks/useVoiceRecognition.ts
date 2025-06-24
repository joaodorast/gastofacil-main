import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface VoiceResult {
  valor?: number;
  descricao?: string;
  categoria?: string;
}

export function useVoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Para web, usar Web Speech API
        return startWebRecording();
      }

      // Para mobile, usar expo-av
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      return false;
    }
  };

  const startWebRecording = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resolve(false);
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        resolve(true);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        resolve(false);
      };

      recognition.start();
      (recordingRef as any).current = recognition;
    });
  };

  const stopRecording = async (): Promise<VoiceResult | null> => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      if (Platform.OS === 'web') {
        return await stopWebRecording();
      }

      // Para mobile
      if (!recordingRef.current) return null;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Aqui você integraria com um serviço de speech-to-text
      // Por enquanto, simular o processamento
      const result = await processAudioToText(uri);
      setIsProcessing(false);
      
      return result;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
      setIsProcessing(false);
      return null;
    }
  };

  const stopWebRecording = (): Promise<VoiceResult | null> => {
    return new Promise((resolve) => {
      const recognition = (recordingRef as any).current;
      if (!recognition) {
        resolve(null);
        return;
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const result = parseVoiceInput(transcript);
        setIsProcessing(false);
        resolve(result);
      };

      recognition.onend = () => {
        setIsProcessing(false);
      };

      recognition.stop();
    });
  };

  const processAudioToText = async (uri: string | null): Promise<VoiceResult | null> => {
    // Simular processamento de áudio para texto
    // Em produção, você usaria Google Speech-to-Text, AWS Transcribe, etc.
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const simulatedTexts = [
      "gastei vinte e cinco reais com lanche",
      "paguei cinquenta reais de combustível",
      "comprei remédio por quinze reais",
      "almoço custou trinta reais",
      "café da manhã dez reais"
    ];
    
    const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
    return parseVoiceInput(randomText);
  };

  const parseVoiceInput = (text: string): VoiceResult => {
    const lowerText = text.toLowerCase();
    
    // Extrair valor
    const valorRegex = /(\d+(?:,\d+)?)\s*reais?/;
    const valorMatch = lowerText.match(valorRegex);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : undefined;

    // Extrair categoria baseada em palavras-chave
    const categorias = {
      'alimentação': ['lanche', 'almoço', 'jantar', 'café', 'comida', 'restaurante', 'lanchonete'],
      'transporte': ['combustível', 'gasolina', 'uber', 'taxi', 'ônibus', 'metrô'],
      'saúde': ['remédio', 'farmácia', 'médico', 'consulta', 'exame'],
      'compras': ['comprei', 'compra', 'mercado', 'supermercado', 'loja'],
      'lazer': ['cinema', 'teatro', 'show', 'diversão', 'entretenimento']
    };

    let categoria = 'Outros';
    for (const [cat, palavras] of Object.entries(categorias)) {
      if (palavras.some(palavra => lowerText.includes(palavra))) {
        categoria = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }

    // Extrair descrição (remover partes do valor)
    let descricao = text;
    if (valorMatch) {
      descricao = descricao.replace(valorMatch[0], '').trim();
    }
    descricao = descricao.replace(/^(gastei|paguei|comprei)\s*/i, '').trim();
    descricao = descricao || 'Gasto registrado por voz';

    return { valor, descricao, categoria };
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
}