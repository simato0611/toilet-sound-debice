# 音姫 - トイレ音消しWebアプリ

シンプルで使いやすいトイレ用音消しWebアプリケーションです。

## 🚀 機能

- **ワンタップ音声再生**: 大きなボタンで簡単操作
- **複数の音源**: 流水音、雨音、鳥のさえずり、ホワイトノイズ
- **自動停止タイマー**: 30秒〜5分の設定可能
- **音量調整**: スライダーで細かく調整
- **ダークモード**: 夜間使用に配慮
- **PWA対応**: オフライン動作、ホーム画面追加可能
- **レスポンシブデザイン**: スマートフォン最適化

## 📱 対応環境

- **ブラウザ**: Chrome, Firefox, Safari, Edge (モダンブラウザ)
- **デバイス**: スマートフォン、タブレット、PC
- **OS**: iOS, Android, Windows, macOS, Linux

## 🛠️ 技術仕様

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **音声処理**: Web Audio API
- **PWA**: Service Worker, Web App Manifest
- **ストレージ**: LocalStorage（設定保存）

## 📂 ファイル構成

```
otohime-app/
├── index.html          # メインページ
├── styles.css          # スタイルシート
├── app.js             # メインアプリケーション
├── manifest.json      # PWAマニフェスト
├── sw.js              # Service Worker
├── create-icons.html  # アイコン生成ツール
├── icon-*.png         # アプリアイコン各サイズ
└── README.md          # このファイル
```

## 🚀 セットアップ

### 1. ローカル開発

```bash
# ファイルをダウンロード
git clone <repository-url>
cd otohime-app

# ローカルサーバーを起動（Python例）
python -m http.server 8000
# または
python3 -m http.server 8000

# ブラウザでアクセス
open http://localhost:8000
```

### 2. アイコン生成

1. `create-icons.html` をブラウザで開く
2. 表示されたcanvasを右クリック
3. 「名前を付けて画像を保存」で各サイズを保存
4. ファイル名: `icon-72.png`, `icon-96.png`, ... など

### 3. デプロイ

#### Netlify（推奨）
1. [Netlify](https://netlify.com) にアカウント作成
2. プロジェクトフォルダをドラッグ&ドロップ
3. 自動でHTTPS対応URLが発行される

#### Vercel
1. [Vercel](https://vercel.com) にアカウント作成
2. GitHubリポジトリと連携
3. 自動デプロイ設定

#### GitHub Pages
1. GitHubリポジトリ作成
2. Settings > Pages で公開設定
3. `https://username.github.io/repository-name` でアクセス

## ⚙️ カスタマイズ

### 音源の追加

`app.js` の `sounds` オブジェクトに新しい音源を追加：

```javascript
this.sounds = {
    // 既存の音源...
    'custom-sound': this.generateCustomSound.bind(this)
};

async generateCustomSound() {
    // カスタム音源の生成ロジック
}
```

### テーマの変更

`styles.css` の CSS変数を編集：

```css
:root {
    --primary-color: #2196F3;    /* メインカラー */
    --secondary-color: #03DAC6;  /* アクセントカラー */
    /* その他の色設定... */
}
```

## 🔧 設定

アプリの設定は自動的にブラウザのLocalStorageに保存されます：

- 音量レベル
- 選択した音源
- タイマー設定
- ダークモード設定

## 📱 PWA機能

### インストール方法

**Android Chrome:**
1. 「ホーム画面に追加」をタップ
2. ネイティブアプリのように動作

**iOS Safari:**
1. 共有ボタン → 「ホーム画面に追加」
2. アプリアイコンがホーム画面に追加

### オフライン機能

Service Workerにより以下が可能：
- インターネット接続なしでの使用
- 高速な起動時間
- アプリのような操作性

## 🎯 使用シーン

- 公共トイレ
- 職場のトイレ
- 友人宅での訪問時
- 旅行先
- 音に敏感な環境

## 🔒 プライバシー

- データ収集なし
- 外部送信なし
- 完全クライアントサイド動作
- 設定のみローカル保存

## 📈 今後の機能拡張

- [ ] 音源のカスタムアップロード
- [ ] バイブレーション対応
- [ ] ショートカット追加
- [ ] 統計機能
- [ ] 音量フェード機能
- [ ] 複数音源の同時再生

## 🐛 トラブルシューティング

### 音が出ない場合

1. **ブラウザの音量**: デバイスの音量を確認
2. **ミュート解除**: ブラウザタブがミュートされていないか確認
3. **HTTPS**: HTTPSでアクセスしているか確認（音声再生要件）
4. **ブラウザ対応**: モダンブラウザを使用しているか確認

### PWAインストールできない場合

1. **HTTPS必須**: HTTPSでアクセスする
2. **マニフェスト**: manifest.jsonが正しく配置されているか確認
3. **Service Worker**: sw.jsが動作しているか確認
4. **ブラウザ対応**: PWA対応ブラウザを使用

## 📄 ライセンス

MIT License - 自由に使用・改変・配布可能

## 🤝 コントリビューション

バグ報告や機能提案は Issue にて受け付けています。

---

**作成者**: Claude Code Assistant  
**バージョン**: 1.0.0  
**更新日**: 2025年