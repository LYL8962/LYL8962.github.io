# LYL8962 Personal Website - Quick Start Guide

## ✅ What's Been Done

1. **Orange Theme** - Changed all purple/indigo colors to orange (#f97316)
2. **Inline Audio Player** - Shows play/stop button, progress bar, and song name
3. **Start Music Button** - Floating button that toggles between "Start Music" and "Stop Music"

## 🎵 How to Add Your Own YouTube Music

### Option 1: Edit script.js (Recommended)

1. Open `script.js` in a text editor
2. Find line 17:
   ```javascript
   const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4';
   ```
3. Replace with your YouTube video ID

**How to get a YouTube video ID:**
- For URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- The video ID is: `dQw4w9WgXcQ`

### Option 2: Use JavaScript Console

1. Open the website in your browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Type and press Enter:
   ```javascript
   changeYouTubeTrack('YOUR_VIDEO_ID_HERE')
   ```
   Example:
   ```javascript
   changeYouTubeTrack('dQw4w9WgXcQ')
   ```

## 🎮 Features

- **Play/Stop Button** - Toggles music playback
- **Progress Bar** - Shows current time and total duration
- **Mute Button** - Mute/unmute audio
- **Song Name** - Displays the YouTube video title
- **Orange Theme** - Modern gradient orange theme

## 🚀 How to Use

1. Open `index.html` in your web browser
2. Wait a moment for the YouTube player to load
3. Click the **"Start Music"** button (bottom-right)
4. The audio player will appear at the bottom
5. Click **"Stop Music"** to pause
6. Use the mute button to toggle audio

## 🎨 Customization

### Change the Default Video

Edit `script.js` line 17:
```javascript
const DEFAULT_VIDEO_ID = 'YOUR_VIDEO_ID';
```

### Modify Theme Colors

Edit `styles.css` lines 12-20:
```css
:root {
    --primary-color: #f97316;      /* Orange */
    --primary-gradient: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
    --secondary-color: #facc15;     /* Yellow */
    /* ... */
}
```

## 📱 Responsive Design

The website works on:
- Desktop computers
- Laptops
- Tablets
- Mobile phones

## ⌨️ Keyboard Shortcuts

- **Space** - Play/Pause
- **M** - Mute/Unmute

## 📂 File Structure

```
LYL8962.github.io/
├── index.html          # Main HTML structure
├── styles.css          # Orange theme styles
├── script.js           # YouTube player functionality
├── README.md           # This file
└── _config.yml         # GitHub Pages config
```

## 🌐 Hosting on GitHub Pages

1. Push all files to your `LYL8962.github.io` repository
2. Go to Repository Settings → Pages
3. Select `main` branch as source
4. Visit `https://LYL8962.github.io`

## 🔧 Troubleshooting

**Music doesn't play:**
- Make sure you have internet connection
- Try refreshing the page
- Check browser console (F12) for errors

**Player doesn't show:**
- Wait a few seconds for YouTube API to load
- Check that JavaScript is enabled in your browser

**Wrong video plays:**
- Edit `script.js` and change the `DEFAULT_VIDEO_ID`

## 📝 Default Video

Currently set to a royalty-free YouTube audio track.
You can change this in `script.js` line 17.

---

**Need help?** Check the browser console (F12) for any error messages.
