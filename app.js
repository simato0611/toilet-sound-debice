// 音姫Webアプリ - JavaScript

class OtohimeApp {
    constructor() {
        this.isPlaying = false;
        this.audioContext = null;
        this.audioSource = null;
        this.audioBuffer = null;
        this.gainNode = null;
        this.timer = null;
        this.timeLeft = 0;
        
        this.sounds = {
            water: this.generateWaterSound.bind(this),
            rain: this.generateRainSound.bind(this),
            birds: this.generateBirdSound.bind(this),
            'white-noise': this.generateWhiteNoise.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateTheme();
    }
    
    bindEvents() {
        // メイン再生ボタン
        document.getElementById('playButton').addEventListener('click', () => {
            this.togglePlay();
        });
        
        // 音量スライダー
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            volumeValue.textContent = volume + '%';
            this.setVolume(volume / 100);
            this.saveSettings();
        });
        
        // 音の種類選択
        document.getElementById('soundSelect').addEventListener('change', () => {
            if (this.isPlaying) {
                this.stopSound();
                this.startSound();
            }
            this.saveSettings();
        });
        
        // タイマー選択
        document.getElementById('timerSelect').addEventListener('change', () => {
            this.saveSettings();
        });
        
        // ダークモード切替
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            document.body.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
            this.saveSettings();
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
        
        // ページ離脱時に音を停止
        window.addEventListener('beforeunload', () => {
            this.stopSound();
        });
        
        // ページが非表示になった時も停止
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying) {
                this.stopSound();
            }
        });
    }
    
    async togglePlay() {
        if (this.isPlaying) {
            this.stopSound();
        } else {
            await this.startSound();
        }
    }
    
    async startSound() {
        try {
            // AudioContextを初期化
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
            }
            
            // AudioContextが停止状態の場合は再開
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // 選択された音を生成
            const soundType = document.getElementById('soundSelect').value;
            this.audioBuffer = await this.sounds[soundType]();
            
            // 音声を再生
            this.audioSource = this.audioContext.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.loop = true;
            this.audioSource.connect(this.gainNode);
            this.audioSource.start();
            
            // 音量設定
            const volume = document.getElementById('volumeSlider').value / 100;
            this.setVolume(volume);
            
            // UI更新
            this.isPlaying = true;
            this.updatePlayButton();
            this.startTimer();
            
        } catch (error) {
            console.error('音声再生エラー:', error);
            this.showStatus('音声の再生に失敗しました');
        }
    }
    
    stopSound() {
        if (this.audioSource) {
            this.audioSource.stop();
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        this.isPlaying = false;
        this.updatePlayButton();
        this.stopTimer();
    }
    
    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }
    
    updatePlayButton() {
        const button = document.getElementById('playButton');
        const icon = button.querySelector('.btn-icon');
        const text = button.querySelector('.btn-text');
        
        if (this.isPlaying) {
            button.classList.add('playing');
            icon.textContent = '⏹️';
            text.textContent = 'タップして停止';
            this.showStatus('再生中...');
        } else {
            button.classList.remove('playing');
            icon.textContent = '▶️';
            text.textContent = 'タップして音を再生';
            this.showStatus('タップして開始');
        }
    }
    
    showStatus(message) {
        document.getElementById('statusText').textContent = message;
    }
    
    startTimer() {
        const timerSeconds = parseInt(document.getElementById('timerSelect').value);
        if (timerSeconds === 0) {
            document.getElementById('timerDisplay').classList.add('hidden');
            return;
        }
        
        this.timeLeft = timerSeconds;
        document.getElementById('timerDisplay').classList.remove('hidden');
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopSound();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        document.getElementById('timerDisplay').classList.add('hidden');
    }
    
    updateTimerDisplay() {
        document.getElementById('timeLeft').textContent = this.timeLeft;
    }
    
    // 音声生成メソッド
    async generateWaterSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 2; // 2秒のループ
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            // 複数の周波数を重ね合わせて水の流れ音を作成
            const time = i / sampleRate;
            let sample = 0;
            
            // 基本的な流水音（低周波ノイズ）
            sample += (Math.random() * 2 - 1) * 0.1 * Math.sin(time * 200);
            
            // 泡立ち音（高周波成分）
            sample += (Math.random() * 2 - 1) * 0.05 * Math.sin(time * 1000);
            
            // 水流の変動
            sample += Math.sin(time * 50) * 0.1 * (Math.random() * 2 - 1);
            
            // フィルタリング効果
            sample *= Math.sin(time * Math.PI / duration);
            
            data[i] = sample * 0.3;
        }
        
        return buffer;
    }
    
    async generateRainSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 3;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // 雨粒の音
            for (let j = 0; j < 20; j++) {
                const freq = 200 + Math.random() * 800;
                const phase = Math.random() * Math.PI * 2;
                const decay = Math.exp(-time * 2);
                sample += Math.sin(time * freq + phase) * decay * 0.01;
            }
            
            // 背景のホワイトノイズ
            sample += (Math.random() * 2 - 1) * 0.05;
            
            data[i] = sample * 0.4;
        }
        
        return buffer;
    }
    
    async generateBirdSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 4;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // 鳥のさえずり（複数の鳥）
            if (time % 1 < 0.3) { // 断続的な鳴き声
                const freq1 = 800 + Math.sin(time * 10) * 200;
                const freq2 = 1200 + Math.sin(time * 15) * 300;
                
                sample += Math.sin(time * freq1 * Math.PI * 2) * 0.1;
                sample += Math.sin(time * freq2 * Math.PI * 2) * 0.05;
            }
            
            // 環境音（風など）
            sample += (Math.random() * 2 - 1) * 0.02;
            
            data[i] = sample * 0.5;
        }
        
        return buffer;
    }
    
    async generateWhiteNoise() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 1;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        
        return buffer;
    }
    
    // 設定の保存・読み込み
    saveSettings() {
        const settings = {
            volume: document.getElementById('volumeSlider').value,
            soundType: document.getElementById('soundSelect').value,
            timer: document.getElementById('timerSelect').value,
            darkMode: document.getElementById('darkModeToggle').checked
        };
        
        localStorage.setItem('otohime-settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('otohime-settings'));
            if (settings) {
                document.getElementById('volumeSlider').value = settings.volume || 70;
                document.getElementById('volumeValue').textContent = (settings.volume || 70) + '%';
                document.getElementById('soundSelect').value = settings.soundType || 'water';
                document.getElementById('timerSelect').value = settings.timer || '30';
                document.getElementById('darkModeToggle').checked = settings.darkMode || false;
            }
        } catch (error) {
            console.log('設定の読み込みに失敗しました:', error);
        }
    }
    
    updateTheme() {
        const isDark = document.getElementById('darkModeToggle').checked;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new OtohimeApp();
});

// PWAインストール促進
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // インストールボタンを表示する場合はここに実装
    console.log('PWAインストール可能');
});

window.addEventListener('appinstalled', () => {
    console.log('PWAがインストールされました');
    deferredPrompt = null;
});