import { initWhisper } from 'whisper.rn';

class WhisperManager {
  constructor() {
    this.whisperContext = null;
    this.stopFunc = null; 
    this.isSearching = false;
  }

  async initContext() {
    if (this.whisperContext) return;
    try {
      this.whisperContext = await initWhisper({
        filePath: 'ggml-tiny.en.bin',
        isBundleAsset: true,
      });
      console.log('WHISPER: Context hazır.');
    } catch (error) {
      console.log('WHISPER: Başlatma hatası:', error);
    }
  }

  async startSearching(onResult) {
    if (this.isSearching) return;
    await this.initContext();

    try {
      console.log('v0.5.4 Gerçek Zamanlı Aktarımı Başlatılıyor...');

      const { stop, subscribe } = await this.whisperContext.transcribeRealtime({
        language: 'en',
        beamSize: 1,
        audioStepMs: 500,
        audioSliceMs: 500,
      });

      this.stopFunc = stop;
      this.isSearching = true;

      subscribe((event) => {
        // Ham veriyi konsolda görmeye devam edelim
        console.log("WHISPER EVENT:", JSON.stringify(event));

        // Loglara göre veri tam olarak event.data.result içinde geliyor
        const text = (event.data && event.data.result) || 
                     event.text || 
                     event.result;

        // Metin boş değilse ve [BLANK_AUDIO] veya [SOUND] gibi gürültü etiketleri değilse gönder
        if (text && text.trim().length > 0 && !text.includes('[BLANK_AUDIO]')) {
          console.log("--- METİN YAKALANDI --- :", text);
          onResult(text);
        }
      });

      console.log("WHISPER ŞU AN DİNLİYOR (v0.5.4)");

    } catch (e) {
      console.log('BAŞLATMA HATASI:', e.message || e);
      this.isSearching = false;
    }
  } // <-- Eksik olan fonksiyon kapanışı burasıydı

  async stopSearching() {
    if (this.stopFunc) {
      try {
        await this.stopFunc();
        this.stopFunc = null;
        this.isSearching = false;
        console.log("DURDURULDU.");
      } catch (err) {
        console.log("Durdururken hata oluştu:", err);
      }
    }
  }
}

export default new WhisperManager();