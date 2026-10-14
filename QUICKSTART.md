# LYL8962 Personal Website - Quick Start Guide

## ✅ What's Been Done

1. **Integrated Music Player Button** - The music player is now inside the start button itself
2. **Orange Theme** - Changed all purple/indigo colors to orange (#f97316)
3. **Song Name Display** - Shows the YouTube video title
4. **Auto-Play** - Music starts automatically when the page loads
5. **Progress Bar** - Shows current playback position within the button

## 🎵 How to Add Your Own YouTube Music

### Edit script.js

1. Open `script.js` in a text editor
2. Find line 17:
   ```javascript
   const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4';
   ```
3. Replace with your YouTube video ID

**How to get a YouTube video ID:**
- For URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- The video ID is: `dQw4w9WgXcQ`

## 🎮 Features

- **Integrated Button** - Play/stop, progress bar, and volume controls all in one button
- **Song Name** - Displays the YouTube video title when loaded
- **Auto-Play** - Music starts automatically when page loads
- **Progress Bar** - Shows current time and duration
- **Mute Button** - Mute/unmute audio
- **Orange Theme** - Modern gradient orange theme
- **Responsive Design** - Works on all devices

## 🚀 How to Use

1. Open `index.html` in your web browser
2. Wait 1-2 seconds for the YouTube player to load
3. Music will **auto-play** automatically
4. The integrated music player button shows:
   - Orange play icon (left side)
   - Song name (top)
   - Progress bar (filling as music plays)
   - Current time / Total duration
   - Mute button (right side)
5. Click anywhere on the button (except mute) to pause/resume
6. Use the mute button to toggle audio
7. Use the progress bar to seek

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

The music player button adjusts for mobile:
- Desktop: Larger button (~300px width)
- Mobile: Smaller button (~280px width) positioned at bottom-right

## ⌨️ Keyboard Shortcuts

- **Space** - Play/Pause
- **M** - Mute/Unmute

## 📂 File Structure

```
LYL8962.github.io/
├── index.html          # Main HTML structure
├── styles.css          # Orange theme styles
├── script.js           # Music player functionality
├── README.md           # Main documentation
└── QUICKSTART.md       # This file
```

## 🌐 Hosting on GitHub Pages

1. Push all files to your `LYL8962.github.io` repository
2. Go to Repository Settings → Pages
3. Select `main` branch as source
4. Visit `https://LYL8962.github.io`

## 🔧 Troubleshooting

**Music doesn't play:**
- Make sure you have internet connection
- Wait 2-3 seconds for YouTube API to load
- Check browser console (F12) for errors
- Make sure browser allows autoplay (some browsers block it)

**Song title shows "Loading..." permanently:**
- This is normal for the first few seconds
- The title loads after the video data is fetched from YouTube

**Button not showing:**
- Check that JavaScript is enabled in your browser
- Refresh the page

## 📝 Default Video

Currently set to a royalty-free YouTube audio track.
You can change this in `script.js` line 17.

---

**Need help?** Check the browser console (F12) for any error messages.
