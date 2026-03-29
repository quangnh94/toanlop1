/**
 * Hiệu ứng âm thanh cho ứng dụng Toán lớp 1
 * Sử dụng Web Audio API và Text-to-Speech
 */

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.5;
    this.synth = window.speechSynthesis;
    this.vietnameseVoice = null;

    // Tải voice tiếng Việt
    this.loadVietnameseVoice();
  }

  loadVietnameseVoice() {
    if ('speechSynthesis' in window) {
      const voices = this.synth.getVoices();
      // Ưu tiên voice tiếng Việt
      this.vietnameseVoice = voices.find(voice =>
        voice.lang.includes('vi') || voice.lang.includes('VN')
      ) || voices[0];

      // Fallback: lắng nghe sự kiện voiceschanged
      if (voices.length === 0) {
        this.synth.onvoiceschanged = () => {
          const voices = this.synth.getVoices();
          this.vietnameseVoice = voices.find(voice =>
            voice.lang.includes('vi') || voice.lang.includes('VN')
          ) || voices[0];
        };
      }
    }
  }

  // Nói tiếng Việt (Text-to-Speech)
  speak(text, options = {}) {
    if (!this.enabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.vietnameseVoice;
    utterance.rate = options.rate || 1;      // Tốc độ (0.1 - 10)
    utterance.pitch = options.pitch || 1.2;  // Cao độ (0 - 2) - cao hơn cho trẻ em
    utterance.volume = this.volume;

    this.synth.speak(utterance);
  }

  // Các câu chúc mừng khi đúng
  playCorrect() {
    const praises = [
      "Chúc mừng bé!",
      "Giỏi quá!",
      "Tuyệt vời!",
      "Hoan hô bé!",
      "Bé làm đúng rồi!",
      "Thật là xuất sắc!",
      "Máy tính nối!"
    ];
    const praise = praises[Math.floor(Math.random() * praises.length)];
    this.speak(praise, { rate: 1.1, pitch: 1.4 });

    // Hiệu ứng âm thanh vui nhộn
    this.playCheer();
  }

  // Sai câu
  playIncorrect() {
    const encouragements = [
      "Bé thử lại nhé!",
      "Không sao đâu, cố lên!",
      "Bé làm được mà!",
      "Chưa đúng, thử lại đi!",
      "Cố gắng lên bé!"
    ];
    const encourage = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.speak(encourage, { rate: 1, pitch: 1.1 });
  }

  // Hoàn thành bài thi - điểm cao
  playHighScore(score) {
    if (score >= 10) {
      this.speak(`Wow! Bé được ${score} điểm! Quá đỉnh!`, { rate: 1.1, pitch: 1.5 });
    } else if (score >= 8) {
      this.speak(`Bé được ${score} điểm! Giỏi lắm!`, { rate: 1.1, pitch: 1.4 });
    } else if (score >= 5) {
      this.speak(`Bé được ${score} điểm! Khá tốt!`, { rate: 1, pitch: 1.3 });
    } else {
      this.speak(`Bé được ${score} điểm. Cố gắng hơn nhé!`, { rate: 1, pitch: 1.2 });
    }
  }

  // Nhận sticker
  playStickerReward(sticker) {
    this.speak(`Bé nhận được ${sticker.name}!`, { rate: 1.1, pitch: 1.5 });
    this.playMagical();
  }

  // Level up
  playLevelUp(level) {
    this.speak(`Bé đã lên cấp ${level}! Chúc mừng!`, { rate: 1.1, pitch: 1.5 });
    this.playFanfare();
  }

  // Hiệu ứng âm thanh đơn giản (Web Audio API)
  playCheer() {
    this.playTone(523.25, 0.1, 'sine');   // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100);   // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine'), 200);  // G5
    setTimeout(() => this.playTone(1046.50, 0.2, 'sine'), 300); // C6
  }

  playMagical() {
    // Hiệu ứng magical (sparkle)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const freq = 800 + (i * 200);
        this.playTone(freq, 0.1, 'sine');
      }, i * 80);
    }
  }

  playFanfare() {
    // Trumpet fanfare
    this.playTone(392.00, 0.15, 'triangle');
    setTimeout(() => this.playTone(523.25, 0.15, 'triangle'), 120);
    setTimeout(() => this.playTone(659.25, 0.2, 'triangle'), 240);
    setTimeout(() => this.playTone(783.99, 0.3, 'triangle'), 360);
  }

  playClick() {
    // Click sound
    this.playTone(800, 0.05, 'square');
  }

  playTick() {
    // Timer tick
    this.playTone(1000, 0.02, 'sine');
  }

  // Tạo âm thanh đơn giản
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // Bật/tắt âm thanh
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Dừng tất cả âm thanh
  stopAll() {
    this.synth.cancel();
  }
}

// Tạo singleton
const soundManager = new SoundManager();

// Export để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = soundManager;
}
