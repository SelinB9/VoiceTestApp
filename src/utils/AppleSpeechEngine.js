import Voice from '@react-native-voice/voice';

class AppleSpeechManager {
  constructor() {
    this.isSearching = false;
    this.shouldBeSearching = false;
    this.onResultCallback = null;
    this.restartTimeout = null;
    this.RESTART_DELAY = 100; // Small delay before restarting (in milliseconds)

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle speech results SES YAZIYA DÖNÜŞTÜĞÜNDE BU ÇALIŞIR.
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0 && this.onResultCallback) {
        // Return the most recent transcription result
        const transcribedText = e.value[0];
        this.onResultCallback(transcribedText);
      }
    };

    // Handle recognition start
    Voice.onSpeechStart = () => {
      this.isSearching = true;
    };

    // Handle speech end - auto-restart if still supposed to be searching KONUŞMA BİTTİĞİNDE BU ÇALIŞIR.
    Voice.onSpeechEnd = () => {
      this.isSearching = false;
      if (this.shouldBeSearching) {
        this.restartVoiceRecognition();
      }
    };

    // Handle speech errors - auto-restart if still supposed to be searching HATA OLDUĞUNDA SESSİZLİK OLDUĞUNDA BU ÇALIŞIR.
    Voice.onSpeechError = (e) => {
      console.warn('Speech recognition error:', e.error);
      this.isSearching = false;
      if (this.shouldBeSearching) {
        this.restartVoiceRecognition();
      }
    };

    // Handle partial results (optional, for real-time updates)
    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0 && this.onResultCallback) {
        const transcribedText = e.value[0];
        this.onResultCallback(transcribedText);
      }
    };
  }

  /**
   * Start voice recognition with auto-restart capability
   * @param {Function} onResult - Callback function that receives transcribed text
   */
  async startSearching(onResult) {
    try {
      this.shouldBeSearching = true;
      this.onResultCallback = onResult;

      // Destroy any existing recognition first
      await Voice.destroy();

      // Start recognition with English (US) language
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.shouldBeSearching = false;
      throw error;
    }
  }

  /**
   * Stop voice recognition and disable auto-restart
   */
  async stopSearching() {
    try {
      this.shouldBeSearching = false;
      
      // Clear any pending restart timeout
      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }

      // Stop and destroy recognition
      await Voice.stop();
      await Voice.destroy();
      
      this.isSearching = false;
      this.onResultCallback = null;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      // Even if there's an error, mark as stopped
      this.shouldBeSearching = false;
      this.isSearching = false;
    }
  }

  /**
   * Restart voice recognition automatically
   * Used internally when speech ends or errors occur
   */
  async restartVoiceRecognition() {
    // Clear any existing restart timeout
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }

    // Only restart if we're supposed to be searching
    if (!this.shouldBeSearching) {
      return;
    }

    // Add a small delay before restarting to avoid rapid restarts
    this.restartTimeout = setTimeout(async () => {
      if (!this.shouldBeSearching) {
        return;
      }

      try {
        // Stop current recognition if active
        if (this.isSearching) {
          await Voice.stop();
        }
        
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Restart recognition
        await Voice.start('en-US');
      } catch (error) {
        console.error('Error restarting voice recognition:', error);
        // If restart fails, try again after a longer delay
        if (this.shouldBeSearching) {
          this.restartTimeout = setTimeout(() => {
            this.restartVoiceRecognition();
          }, 1000);
        }
      }
    }, this.RESTART_DELAY);
  }

  /**
   * Clean up resources
   * Should be called when the manager is no longer needed
   */
  async destroy() {
    await this.stopSearching();
    Voice.removeAllListeners();
  }
}

// Export a singleton instance
export default new AppleSpeechManager();

// Also export the class for creating custom instances if needed
export { AppleSpeechManager };

