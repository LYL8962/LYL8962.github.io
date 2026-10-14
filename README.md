# LYL8962.github.io

A personal website with a YouTube music player feature.

## Features

- 🎨 Dark modern theme with gradient effects
- 🎵 YouTube music player with controls
- 📱 Fully responsive design
- 🎯 Project showcase section
- 🎭 Smooth scrolling navigation
- ⌨️ Keyboard shortcuts support

## Quick Start

1. **Open `index.html`** in your web browser
2. Click the **"Start Music"** button (floating bottom-right) to play music
3. Customize the YouTube track by editing the `script.js` file

## Customization

### Change the Default YouTube Track

1. Open `script.js`
2. Find this line:
   ```javascript
   const DEFAULT_VIDEO_ID = '2zNSgSzhBfM';
   ```
3. Replace with your desired YouTube video ID

**How to get a YouTube video ID:**
- For URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID is: `dQw4w9WgXcQ`

### Add Your Own YouTube Link

You can change the default track by editing line 3 in `script.js`:

```javascript
const DEFAULT_VIDEO_ID = 'YOUR_YOUTUBE_VIDEO_ID_HERE';
```

### Modify Theme Colors

Edit the CSS variables in `styles.css` (line 17-27):

```css
:root {
    --primary-color: #6366f1;        /* Main accent color */
    --secondary-color: #ec4899;      /* Secondary color */
    --background-color: #0f172a;     /* Background */
    --surface-color: #1e293b;        /* Cards/surfaces */
    /* ... */
}
```

### Update Project Information

Edit the project cards in `index.html` (lines 120-185) to add/remove projects:

```html
<div class="project-card">
    <div class="project-content">
        <div class="project-header">
            <h3 class="project-title">Your Project Name</h3>
            <span class="project-language">Language/Type</span>
        </div>
        <p class="project-description">Project description...</p>
        <div class="project-links">
            <a href="YOUR_GITHUB_URL" target="_blank" class="btn-project">
                <i class="fab fa-github"></i> View Code
            </a>
        </div>
    </div>
</div>
```

### Add Social Media Links

Update the social links in `index.html` (lines 45-51):

```html
<div class="social-links">
    <a href="YOUR_GITHUB_URL" target="_blank" aria-label="GitHub">
        <i class="fab fa-github"></i>
    </a>
    <a href="YOUR_TWITTER_URL" target="_blank" aria-label="Twitter">
        <i class="fab fa-twitter"></i>
    </a>
    <a href="YOUR_LINKEDIN_URL" target="_blank" aria-label="LinkedIn">
        <i class="fab fa-linkedin"></i>
    </a>
</div>
```

## Keyboard Shortcuts

- **Space**: Play/Pause music
- **M**: Mute/Unmute
- **Escape**: Close player

## File Structure

```
LYL8962.github.io/
├── index.html          # Main HTML structure
├── styles.css          # Dark modern theme styles
├── script.js           # YouTube player and interactions
└── README.md           # This file
```

## Supported YouTube Links

The site accepts any YouTube URL. Supported formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## Hosting

This site is designed to work with GitHub Pages:
1. Push files to your `LYL8962.github.io` repository
2. GitHub Pages will automatically deploy
3. Visit `https://LYL8962.github.io`

## License

Free to use and modify for your personal website.

## Credits

Designed and built for LYL8962
