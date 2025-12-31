import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import AppleSpeechManager from '../utils/AppleSpeechEngine';
import WhisperManager from '../utils/WhisperEngine';
// import SherpaManager from '../utils/SherpaEngine';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LessonScreen = () => {
  const [transcribedText, setTranscribedText] = useState('');
  const [isLessonActive, setIsLessonActive] = useState(false);
  const [activeEngine, setActiveEngine] = useState('Apple');

  const handleStartLesson = useCallback(async () => {
    try {
      setIsLessonActive(true);
      setTranscribedText('');
      
      // Start voice recognition with callback based on active engine
      if (activeEngine === 'Apple') {
        await AppleSpeechManager.startSearching((text) => {
          setTranscribedText(text);
        });
      } else if (activeEngine === 'Whisper') {
        await WhisperManager.startSearching((text) => {
          setTranscribedText(text);
        });
      } else if (activeEngine === 'Sherpa') {
        // Sherpa engine not implemented yet
        Alert.alert('Sherpa Engine', 'Sherpa engine henüz implement edilmedi.');
        setIsLessonActive(false);
      }
    } catch (error) {
      console.error('Error starting lesson:', error);
      setIsLessonActive(false);
      Alert.alert(
        'Hata', 
        `Ders başlatılamadı: ${error.message || error.toString()}`,
        [{ text: 'Tamam' }]
      );
    }
  }, [activeEngine]);

  const handleStopLesson = useCallback(async () => {
    try {
      // Stop voice recognition based on active engine
      if (activeEngine === 'Apple') {
        await AppleSpeechManager.stopSearching();
      } else if (activeEngine === 'Whisper') {
        await WhisperManager.stopSearching();
      } else if (activeEngine === 'Sherpa') {
        // Sherpa engine not implemented yet
      }
      setIsLessonActive(false);
    } catch (error) {
      console.error('Error stopping lesson:', error);
    }
  }, [activeEngine]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isLessonActive) {
        if (activeEngine === 'Apple') {
          AppleSpeechManager.stopSearching();
        } else if (activeEngine === 'Whisper') {
          WhisperManager.stopSearching();
        } else if (activeEngine === 'Sherpa') {
          // Sherpa engine not implemented yet
        }
      }
    };
  }, [isLessonActive, activeEngine]);

  return (
    <View style={styles.container}>
      {/* Engine Selector Buttons - At the very top */}
      <View style={styles.engineSelectorContainer}>
        <View style={styles.engineSelector}>
          <TouchableOpacity
            style={[
              styles.engineButton,
              activeEngine === 'Apple' && styles.engineButtonActive,
            ]}
            onPress={() => {
              if (isLessonActive) {
                Alert.alert('Uyarı', 'Lütfen önce dersi durdurun.');
                return;
              }
              setActiveEngine('Apple');
            }}
          >
            <Text
              style={[
                styles.engineButtonText,
                activeEngine === 'Apple' && styles.engineButtonTextActive,
              ]}
            >
              Apple
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.engineButton,
              activeEngine === 'Whisper' && styles.engineButtonActive,
            ]}
            onPress={() => {
              if (isLessonActive) {
                Alert.alert('Uyarı', 'Lütfen önce dersi durdurun.');
                return;
              }
              setActiveEngine('Whisper');
            }}
          >
            <Text
              style={[
                styles.engineButtonText,
                activeEngine === 'Whisper' && styles.engineButtonTextActive,
              ]}
            >
              Whisper
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.engineButton,
              activeEngine === 'Sherpa' && styles.engineButtonActive,
            ]}
            onPress={() => {
              if (isLessonActive) {
                Alert.alert('Uyarı', 'Lütfen önce dersi durdurun.');
                return;
              }
              setActiveEngine('Sherpa');
            }}
          >
            <Text
              style={[
                styles.engineButtonText,
                activeEngine === 'Sherpa' && styles.engineButtonTextActive,
              ]}
            >
              Sherpa
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Section - Teacher Area */}
      <View style={styles.topSection}>
        <View style={styles.teacherHeader}>
          <Text style={styles.headerText}>TEACHER🧑‍🏫</Text>
          <Text style={styles.statusText}>
            {isLessonActive ? 'Dinleniyor...' : 'Hazır'}
          </Text>
        </View>
      </View>

      {/* Center Button - Positioned on dividing line */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isLessonActive ? styles.stopButton : styles.startButton,
          ]}
          onPress={isLessonActive ? handleStopLesson : handleStartLesson}
        >
          <Text style={styles.buttonText}>
            {isLessonActive ? 'Dersi Durdur' : 'Dersi Başlat'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section - Student Area */}
      <View style={styles.bottomSection}>
        <View style={styles.studentHeader}>
          <Text style={styles.headerText}>STUDENT🧑‍🎓</Text>
        </View>
        <ScrollView
          style={styles.textScrollView}
          contentContainerStyle={styles.textScrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.transcribedText}>
            {transcribedText || 'Konuştuğun metin burada görünecek...'}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Space for notch
  },
  engineSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White
    paddingHorizontal: 20,
    paddingTop: 60, // Space for the button
    paddingBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    marginTop: -30, // Half of button height to center it perfectly
  },
  controlButton: {
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#1976D2', // Blue
  },
  stopButton: {
    backgroundColor: '#D32F2F', // Red
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentHeader: {
    marginBottom: 15,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '750',
    color: '#1976D2',
    textTransform: 'uppercase',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976D2',
  },
  textScrollView: {
    flex: 1,
  },
  textScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  transcribedText: {
    fontSize: 24,
    lineHeight: 36,
    color: '#1565C0', // Dark blue
    fontWeight: '400',
    textAlign: 'left',
  },
  engineSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  engineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#BBDEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  engineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  engineButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default LessonScreen;


