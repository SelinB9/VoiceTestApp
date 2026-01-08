import Voice from '@react-native-voice/voice';

class AppleSpeechManager {
  constructor() {
    this.isSearching = false;
    this.shouldBeSearching = false;
    this.onResultCallback = null;
    this.restartTimeout = null;
    this.isStopping = false; // Durdurma işleminin devam edip etmediğini kontrol eder

    this.setupEventListeners();
  }

  setupEventListeners() {
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0 && this.onResultCallback) {
        this.onResultCallback(e.value[0]);
      }
    };

    Voice.onSpeechStart = (e) => {
      this.isSearching = true;
      this.isStopping = false; // Başladığına göre durma kilidini aç
      console.log("🟢🟢🟢 MOTOR ŞU AN DİNLİYOR (Konuşmayı dene!) 🟢🟢🟢");
    };

    Voice.onSpeechEnd = () => {
      this.isSearching = false;
      if (this.shouldBeSearching && !this.isStopping) {
        this.restartVoiceRecognition();
      }
    };

    Voice.onSpeechError = (e) => {
    // Burası çok önemli! Hata kodunu burası söyler.
  console.log("🔴 HATA KODU GELDİ:", JSON.stringify(e));
  this.isSearching = false;
  if (this.shouldBeSearching && !this.isStopping) {
    this.restartVoiceRecognition();
  }
};

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0 && this.onResultCallback) {
        const text = e.value[0];
        console.log("📝 Yakalanan ses:", text);
        this.onResultCallback(text);
      }
    };
  }

  async startSearching(onResult) {
    if (this.isSearching) return; // Zaten çalışıyorsa tekrar başlatma

    try {
      this.shouldBeSearching = true;
      this.isStopping = false;
      this.onResultCallback = onResult;

      await Voice.destroy();
      await new Promise(resolve => setTimeout(resolve, 150));

      await Voice.start('en-US', {
        EXTRA_LANGUAGE_MODEL: 'free_form',
      });
    } catch (error) {
      console.error('❌ Başlatma hatası:', error);
      this.shouldBeSearching = false;
    }
  }

  async stopSearching() {
    // EĞER ZATEN DURDURULUYORSA İKİNCİ KEZ ÇALIŞTIRMA!
    if (this.isStopping) return; 
    
    try {
      this.isStopping = true; 
      this.shouldBeSearching = false;
      
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }

      console.log("🛑 Durdurma işlemi başlatılıyor...");
      
      await Voice.stop();
      await Voice.destroy();
      
      this.isSearching = false;
      this.onResultCallback = null;
      console.log("✅ Dinleme tamamen durduruldu.");
    } catch (error) {
      console.error('Durdurma hatası:', error);
      this.isStopping = false;
    }
  }

  async restartVoiceRecognition() {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (!this.shouldBeSearching || this.isStopping) return;

    this.restartTimeout = setTimeout(async () => {
      if (!this.shouldBeSearching || this.isStopping) return;
      try {
        console.log("🔄 Yeniden başlatılıyor...");
        await Voice.start('en-US', {
          EXTRA_LANGUAGE_MODEL: 'free_form',
          RECOGNIZER_SCOPE: 'on-device',
        });
      } catch (error) {
        if (this.shouldBeSearching) this.restartVoiceRecognition();
      }
    }, 300);
  }

  async destroy() {
    await this.stopSearching();
    Voice.removeAllListeners();
  }
}

export default new AppleSpeechManager();
export { AppleSpeechManager };