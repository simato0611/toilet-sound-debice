// トイレ用擬音装置Webアプリ - JavaScript

class OtohimeApp {
    constructor() {
        this.isPlaying = false;
        this.audioContext = null;
        this.audioSource = null;
        this.audioBuffer = null;
        this.gainNode = null;
        this.timer = null;
        this.timeLeft = 0;
        this.isWarningPlaying = false;
        this.warningSource = null;
        
        // 外部音源ファイルのパス
        this.soundFiles = {
            water: 'sounds/water.mp3',
            rain: 'sounds/rain.mp3',
            birds: 'sounds/birds.mp3',
            bubble: 'sounds/bubble.mp3',
            warning: 'sounds/Warning.mp3'
        };
        
        // フォールバック用の生成関数
        this.generatedSounds = {
            water: this.generateWaterSound.bind(this),
            rain: this.generateRainSound.bind(this),
            birds: this.generateBirdSound.bind(this),
            bubble: this.generateBubbleSound.bind(this),
            warning: this.generateWarningSound.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSettings();
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
            this.stopWarningSound();
        });
        
        // ページが非表示になった時も停止
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying) {
                this.stopSound();
            }
        });
        
        // 警告音ボタン
        document.getElementById('warningButton').addEventListener('click', () => {
            this.playWarningSound();
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
            
            // 選択された音を読み込み（外部ファイル優先、なければ生成）
            const soundType = document.getElementById('soundSelect').value;
            this.audioBuffer = await this.loadSound(soundType);
            
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
        const stateText = document.getElementById('playButtonState');
        
        if (this.isPlaying) {
            button.classList.add('playing');
            button.setAttribute('aria-label', '音声停止');
            icon.textContent = '■';
            text.textContent = 'タップして停止';
            stateText.textContent = '再生中';
            this.showStatus('再生中...');
        } else {
            button.classList.remove('playing');
            button.setAttribute('aria-label', '音声再生');
            icon.textContent = '♪';
            text.textContent = 'タップして音を再生';
            stateText.textContent = '停止中';
            this.showStatus('');
        }
    }
    
    showStatus(message) {
        document.getElementById('statusText').textContent = message;
    }
    
    // 警告音再生/停止（確認ポップアップ付き）
    async playWarningSound() {
        // 既に警告音が再生中の場合は停止
        if (this.isWarningPlaying) {
            this.stopWarningSound();
            return;
        }
        
        // 確認ポップアップを表示
        const userConfirmed = confirm(
            '警告音を再生しますか？\n\n⚠️ 注意：非常に大きな音が鳴ります。\n緊急時以外は使用しないでください。\n周囲の方にご迷惑をおかけしないようご注意ください。'
        );
        
        if (!userConfirmed) {
            return; // ユーザーがキャンセルした場合は何もしない
        }
        
        try {
            // 現在の音楽が再生中なら停止
            if (this.isPlaying) {
                this.stopSound();
            }
            
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
            
            // 警告音を読み込み
            const warningBuffer = await this.loadSound('warning');
            
            // 警告音を再生（ループする）
            this.warningSource = this.audioContext.createBufferSource();
            this.warningSource.buffer = warningBuffer;
            this.warningSource.loop = true;
            this.warningSource.connect(this.gainNode);
            
            // 警告音用の音量設定（最大音量）
            this.gainNode.gain.value = 2.0;
            
            // 再生開始
            this.warningSource.start();
            this.isWarningPlaying = true;
            this.updateWarningButton();
            
            console.log('警告音を再生しました');
            
        } catch (error) {
            console.error('警告音再生エラー:', error);
            alert('警告音の再生に失敗しました');
        }
    }
    
    // 警告音停止
    stopWarningSound() {
        if (this.warningSource) {
            this.warningSource.stop();
            this.warningSource.disconnect();
            this.warningSource = null;
        }
        
        this.isWarningPlaying = false;
        this.updateWarningButton();
        
        // 音量を元に戻す
        if (this.gainNode) {
            const currentVolume = document.getElementById('volumeSlider').value / 100;
            this.gainNode.gain.value = currentVolume;
        }
        
        console.log('警告音を停止しました');
    }
    
    // 警告音ボタンの表示更新
    updateWarningButton() {
        const button = document.getElementById('warningButton');
        const title = button.querySelector('.warning-title');
        const description = button.querySelector('.warning-description');
        
        if (this.isWarningPlaying) {
            button.style.background = '#ff6b6b';
            button.style.color = 'white';
            button.setAttribute('aria-label', '警告音停止');
            title.textContent = '停止';
            description.textContent = 'タップで停止';
        } else {
            button.style.background = 'var(--surface-color)';
            button.style.color = '#ff6b6b';
            button.setAttribute('aria-label', '警告音再生');
            title.textContent = '警告音';
            description.textContent = '緊急時に防犯ブザーとしてお使いください';
        }
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
    
    // 音声ファイル読み込み（外部ファイル優先、フォールバック付き）
    async loadSound(soundType) {
        try {
            // まず外部ファイルを試行
            const response = await fetch(this.soundFiles[soundType]);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                console.log(`外部音源ファイルを使用: ${soundType}`);
                return audioBuffer;
            }
        } catch (error) {
            console.log(`外部音源ファイルが見つかりません: ${soundType}, 生成音源を使用します`);
        }
        
        // フォールバック: 生成音源を使用
        return await this.generatedSounds[soundType]();
    }
    
    // 音声生成メソッド
    async generateWaterSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 4; // より長いループで自然さを向上
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // より自然な水流音を作成
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // ベースとなる連続的な水流音（ピンクノイズベース）
            let pinkNoise = 0;
            for (let j = 1; j <= 8; j++) {
                pinkNoise += (Math.random() * 2 - 1) / j;
            }
            sample += pinkNoise * 0.15;
            
            // 水流の主要周波数成分
            sample += Math.sin(time * 120 + Math.sin(time * 3) * 0.5) * 0.08;
            sample += Math.sin(time * 180 + Math.sin(time * 2.3) * 0.7) * 0.06;
            sample += Math.sin(time * 240 + Math.sin(time * 1.8) * 0.3) * 0.04;
            
            // 泡や滴の音（より自然な間隔で）
            if (Math.random() < 0.002) {
                const bubbleFreq = 800 + Math.random() * 1200;
                const decay = Math.exp(-((i % (sampleRate * 0.1)) / sampleRate) * 20);
                sample += Math.sin(time * bubbleFreq) * 0.03 * decay;
            }
            
            // 水流の変動（自然な揺らぎ）
            const variation = Math.sin(time * 0.5) * Math.sin(time * 1.3) * 0.3;
            sample *= (1 + variation);
            
            // 自然なフェードイン・アウト
            const fadeLength = sampleRate * 0.1;
            if (i < fadeLength) {
                sample *= i / fadeLength;
            } else if (i > data.length - fadeLength) {
                sample *= (data.length - i) / fadeLength;
            }
            
            data[i] = sample * 0.7; // 音量調整
        }
        
        return buffer;
    }
    
    async generateRainSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 5; // 長めのループ
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // 連続的な雨音のベース（フィルターされたノイズ）
            let rainBase = 0;
            for (let j = 1; j <= 6; j++) {
                rainBase += (Math.random() * 2 - 1) / (j * j); // より高周波を抑制
            }
            sample += rainBase * 0.12;
            
            // 個別の雨粒音（確率的に発生）
            if (Math.random() < 0.008) { // 雨粒の頻度
                const dropFreq = 300 + Math.random() * 600;
                const dropLife = Math.random() * 0.05 + 0.02; // 雨粒の持続時間
                const dropPhase = i % (sampleRate * dropLife);
                const dropDecay = Math.exp(-(dropPhase / sampleRate) * 30);
                sample += Math.sin(time * dropFreq) * 0.04 * dropDecay;
            }
            
            // 水たまりへの落下音
            if (Math.random() < 0.003) {
                const splashFreq = 150 + Math.random() * 300;
                const splashDecay = Math.exp(-((i % (sampleRate * 0.2)) / sampleRate) * 15);
                sample += Math.sin(time * splashFreq) * 0.02 * splashDecay;
            }
            
            // 雨の強さの変動
            const intensity = 0.8 + 0.2 * Math.sin(time * 0.3) * Math.sin(time * 0.7);
            sample *= intensity;
            
            // 自然なフェード
            const fadeLength = sampleRate * 0.2;
            if (i < fadeLength) {
                sample *= i / fadeLength;
            } else if (i > data.length - fadeLength) {
                sample *= (data.length - i) / fadeLength;
            }
            
            data[i] = sample * 0.6;
        }
        
        return buffer;
    }
    
    async generateBirdSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 8; // より長いループ
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // 環境音（森の静寂、微風）
            let ambientNoise = 0;
            for (let j = 1; j <= 4; j++) {
                ambientNoise += (Math.random() * 2 - 1) / (j * j * j);
            }
            sample += ambientNoise * 0.03;
            
            // 鳥のさえずり（より自然なパターン）
            const birdCycle1 = Math.sin(time * 0.3) > 0.7; // 鳥1の活動時間
            const birdCycle2 = Math.sin(time * 0.23 + 1.5) > 0.8; // 鳥2の活動時間
            
            if (birdCycle1) {
                // 高い音域の鳥（ウグイスっぽい）
                const freq = 1000 + Math.sin(time * 12) * 400 + Math.sin(time * 25) * 100;
                const envelope = Math.sin((time * 3) % (Math.PI * 2)) * 0.5 + 0.5;
                const chirp = Math.sin(time * freq * Math.PI * 2) * envelope * 0.06;
                if (chirp > 0) sample += chirp;
            }
            
            if (birdCycle2) {
                // 中音域の鳥（カッコウっぽい）
                const freq = 600 + Math.sin(time * 8) * 200;
                const envelope = Math.exp(-((time * 2) % 1) * 3) * 0.04;
                sample += Math.sin(time * freq * Math.PI * 2) * envelope;
            }
            
            // 遠くの鳥（オプション）
            if (Math.random() < 0.0005) {
                const distantFreq = 400 + Math.random() * 300;
                const distantDecay = Math.exp(-((i % (sampleRate * 2)) / sampleRate) * 2);
                sample += Math.sin(time * distantFreq) * 0.02 * distantDecay;
            }
            
            data[i] = sample * 0.8;
        }
        
        return buffer;
    }
    
    async generateBubbleSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 3; // バブル音のループ
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // バブル音を生成
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // 背景の水中音（低周波）
            let underwaterNoise = 0;
            for (let j = 1; j <= 4; j++) {
                underwaterNoise += (Math.random() * 2 - 1) / (j * j * j);
            }
            sample += underwaterNoise * 0.08;
            
            // バブルの音（確率的に発生）
            if (Math.random() < 0.01) { // バブル発生頻度
                const bubbleFreq = 200 + Math.random() * 800; // バブルの周波数
                const bubbleLife = Math.random() * 0.3 + 0.1; // バブルの持続時間
                const bubblePhase = i % (sampleRate * bubbleLife);
                const bubbleDecay = Math.exp(-(bubblePhase / sampleRate) * 8);
                
                // バブルの上昇音（周波数が上がる）
                const frequencyRise = 1 + (bubblePhase / (sampleRate * bubbleLife)) * 0.5;
                sample += Math.sin(time * bubbleFreq * frequencyRise) * 0.15 * bubbleDecay;
            }
            
            // 小さなバブル（高い頻度、小さな音）
            if (Math.random() < 0.005) {
                const smallBubbleFreq = 600 + Math.random() * 1200;
                const smallDecay = Math.exp(-((i % (sampleRate * 0.1)) / sampleRate) * 20);
                sample += Math.sin(time * smallBubbleFreq) * 0.05 * smallDecay;
            }
            
            // 水流の音（バブルの背景）
            sample += Math.sin(time * 60 + Math.sin(time * 2) * 0.3) * 0.03;
            sample += Math.sin(time * 90 + Math.sin(time * 1.5) * 0.4) * 0.02;
            
            // 自然なフェード
            const fadeLength = sampleRate * 0.1;
            if (i < fadeLength) {
                sample *= i / fadeLength;
            } else if (i > data.length - fadeLength) {
                sample *= (data.length - i) / fadeLength;
            }
            
            data[i] = sample * 0.7;
        }
        
        return buffer;
    }
    
    async generateWarningSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 2; // 2秒間の警告音
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // 警告音を生成（アラーム音）
        for (let i = 0; i < data.length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // メインのアラーム音（高めの周波数）
            const beepCycle = Math.floor(time * 4) % 2; // 0.25秒ごとに切り替え
            if (beepCycle === 0) {
                sample += Math.sin(time * 800 * Math.PI * 2) * 0.3; // 800Hz
                sample += Math.sin(time * 1200 * Math.PI * 2) * 0.2; // 1200Hz（ハーモニー）
            }
            
            // 緊急感を出すためのサイレン効果
            const sirenFreq = 600 + Math.sin(time * 6) * 400; // 600-1000Hzを変動
            sample += Math.sin(time * sirenFreq * Math.PI * 2) * 0.2;
            
            // エンベロープ（音量の変化）
            const envelope = Math.sin((time * 4) % (Math.PI * 2)) * 0.5 + 0.5;
            sample *= envelope;
            
            // 全体的な音量調整（警告音は最大に）
            data[i] = sample * 1.0;
        }
        
        return buffer;
    }
    
    // 設定の保存・読み込み
    saveSettings() {
        const settings = {
            volume: document.getElementById('volumeSlider').value,
            soundType: document.getElementById('soundSelect').value,
            timer: document.getElementById('timerSelect').value
        };
        
        localStorage.setItem('toilet-sound-device-settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('toilet-sound-device-settings'));
            if (settings) {
                document.getElementById('volumeSlider').value = settings.volume || 75;
                document.getElementById('volumeValue').textContent = (settings.volume || 75) + '%';
                document.getElementById('soundSelect').value = settings.soundType || 'water';
                document.getElementById('timerSelect').value = settings.timer || '30';
            }
        } catch (error) {
            console.log('設定の読み込みに失敗しました:', error);
        }
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