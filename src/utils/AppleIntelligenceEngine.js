import Voice from '@react-native-voice/voice';

class AppleIntelligenceEngine {
  constructor() {
    this.isSearching = false;
    this.shouldBeSearching = false;
    this.onResultCallback = null;
    this.restartTimeout = null;
    this.isStopping = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    Voice.onSpeechStart = () => {
      this.isSearching = true;
      console.log("🟢 [AppleIntelligence] Dinliyor...");
    };

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0 && this.onResultCallback) {
        this.onResultCallback(e.value[0]);
      }
    };

    Voice.onSpeechError = (e) => {
      console.log("🔴 [AppleIntelligence] Hata:", JSON.stringify(e));
      if (this.shouldBeSearching && !this.isStopping) this.restartVoiceRecognition();
    };

    Voice.onSpeechEnd = () => {
      if (this.shouldBeSearching && !this.isStopping) this.restartVoiceRecognition();
    };
  }

  async startSearching(onResult) {
    if (this.isSearching) await this.stopSearching(); // Önce temizle
    this.shouldBeSearching = true;
    this.isStopping = false;
    this.onResultCallback = onResult;
    try {
      await Voice.destroy();
      await new Promise(r => setTimeout(r, 200));
      await Voice.start('en-US'); 
    } catch (e) { console.error(e); }
  }

  async stopSearching() {
    this.isStopping = true;
    this.shouldBeSearching = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    try {
      await Voice.stop();
      await Voice.destroy();
      this.isSearching = false;
      console.log("🛑 [AppleIntelligence] Durduruldu.");
    } catch (e) { this.isStopping = false; }
  }

  async restartVoiceRecognition() {
    if (!this.shouldBeSearching || this.isStopping) return;
    this.restartTimeout = setTimeout(async () => {
      try {
        await Voice.start('en-US');
      } catch (e) { this.restartVoiceRecognition(); }
    }, 300);
  }
}

export default new AppleIntelligenceEngine();