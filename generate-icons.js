// アイコン生成スクリプト - Node.js用

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Canvasが利用できない場合の代替：SVGアイコンを生成
function generateSVGIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#03DAC6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#grad)"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.15}" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.25}" fill="none" stroke="white" stroke-width="${size * 0.02}" opacity="0.6"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.35}" fill="none" stroke="white" stroke-width="${size * 0.015}" opacity="0.4"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.45}" fill="none" stroke="white" stroke-width="${size * 0.01}" opacity="0.2"/>
</svg>`;
}

// SVGアイコンをファイルに保存
sizes.forEach(size => {
    const svgContent = generateSVGIcon(size);
    fs.writeFileSync(`icon-${size}.svg`, svgContent);
    console.log(`Generated icon-${size}.svg`);
});

console.log('SVGアイコンを生成しました。');
console.log('PNG形式が必要な場合は、オンラインSVG→PNG変換ツールを使用してください。');
console.log('推奨サイト: https://convertio.co/svg-png/');