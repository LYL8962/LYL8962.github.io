// =========================================
// LYL8962 Personal Website JavaScript
// =========================================
// This file handles:
// - YouTube music player functionality
// - Navigation and smooth scrolling
// - Project card hover effects
// - Keyboard shortcuts
// =========================================


document.addEventListener('DOMContentLoaded', function() {
    // =========================================
    // YOUTUBE PLAYER SETUP
    // =========================================

    // ================== MUSIC PLAYER STATE ==================
    // Change the videoId below to your preferred YouTube video ID
    // Get YouTube video IDs from: https://www.youtube.com/watch?v=VIDEO_ID_HERE
    let playerState = {
        isPlaying: false,
        isBuffering: false,
        volume: 50
    };

    let player;
    let isPlayerReady = false;

    // Default YouTube track - Change this to your preferred video ID
    // This is used if playerState.videoId doesn't work
    const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4';  // CHANGE THIS to your preferred YouTube video ID
    
    // ================== PLAYLIST SETTINGS ==================
    // Set your default playlist URL here
    // The player will extract video IDs from this playlist
    // Example: 'https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx'
    const PLAYLIST_URLS = [
        'https://youtube.com/playlist?list=PLSHWNSkbahOkSyMnIpC13aoIs-Lw-ODk7&si=pgf6KZp3g4aDoOq0', // This will be Secret Playlist 1
        'https://youtube.com/playlist?list=PLSHWNSkbahOm4vbLiqF2fBJ8xf1DPnSlc',        // This will be Secret Playlist 2
    ];

    const playlists = {};
    const playlistTitles = {};
    
    // Playlist state
    let currentPlaylistName = '';
    let playedIndices = [];
    let historyStack = [];
    let historyPointer = -1;
    
    // Menu state
    let isMenuOpen = false;
    
    // ================== EXTRACT PLAYLIST VIDEOS FUNCTION ==================
    // Function to extract video IDs from a YouTube playlist URL
    // Usage: window.extractPlaylistVideos('https://youtube.com/playlist?list=PLAYLIST_ID')
    // Note: Requires YouTube Data API key to fetch actual video IDs
    // Get API key from: https://console.cloud.google.com/

    async function extractPlaylistVideosWithApiKey(playlistUrl) {
        try {
            const playlistIdMatch = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);
            if (!playlistIdMatch) throw new Error('Invalid YouTube playlist URL');
            const playlistId = playlistIdMatch[1];

            // ▼▼▼ REPLACE WITH YOUR RESTRICTED API KEY ▼▼▼
            const API_KEY = 'AIzaSyCALRRTv1wBApitsyg4G8fKTCb4Kp6r-Kk';
            // ▲▲▲ Get one at https://console.cloud.google.com/ ▲▲▲

            if (!API_KEY || API_KEY === 'PASTE_YOUR_KEY_HERE') {
                console.warn('No API key configured — playlist fetch skipped');
                return { videoIds: [], titles: [] };
            }

            const videoIds = [];
            const titles = [];
            let pageToken = null;

            do {
                const params = new URLSearchParams({
                    part: 'contentDetails,snippet',
                    playlistId,
                    maxResults: '50',
                    key: API_KEY
                });
                if (pageToken) params.set('pageToken', pageToken);

                const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
                const data = await res.json();

                if (data.error) {
                    console.error('YouTube API error:', data.error.message);
                    return { videoIds, titles };
                }

                for (const item of data.items || []) {
                    const id = item.contentDetails && item.contentDetails.videoId;
                    if (id) {
                        videoIds.push(id);
                        titles.push((item.snippet && item.snippet.title) || '');
                    }
                }
                pageToken = data.nextPageToken;
            } while (pageToken);

            return { videoIds, titles };
        } catch (error) {
            console.error('Error extracting playlist:', error);
            return { videoIds: [], titles: [] };
        }
    }
    
    // Initialize playlists - fetch from URL
    async function initializePlaylists() {
        if (!PLAYLIST_URLS || PLAYLIST_URLS.length === 0) {
            console.log('No playlist URLs configured');
            return;
        }

        console.log(`Fetching ${PLAYLIST_URLS.length} playlists...`);
        const selector = document.getElementById('playlistSelector');
        if (selector) selector.innerHTML = ''; // Clear dropdown first

        let firstPlaylistName = '';

        // Loop through the array of URLs
        for (let i = 0; i < PLAYLIST_URLS.length; i++) {
            const url = PLAYLIST_URLS[i];
            const secretName = `Secret Playlist ${i + 1}`; // Generates "Secret Playlist 1", etc.

            console.log(`Fetching ${secretName}...`);
            const result = await extractPlaylistVideosWithApiKey(url);

            if (result.videoIds && result.videoIds.length > 0) {
                // Save to our global playlists object
                playlists[secretName] = result.videoIds;
                playlistTitles[secretName] = result.titles;

                // Add to dropdown menu
                if (selector) {
                    const opt = document.createElement('option');
                    opt.value = secretName;
                    opt.textContent = secretName;
                    selector.appendChild(opt);
                }

                // Remember the first successful playlist to set as default
                if (!firstPlaylistName) {
                    firstPlaylistName = secretName;
                }
            } else {
                console.warn(`Could not load tracks for ${secretName}`);
            }
        }

        // Set default selection to the first playlist
        if (firstPlaylistName) {
            currentPlaylistName = firstPlaylistName;
            if (selector) selector.value = firstPlaylistName;
            console.log(`Default playlist set to ${firstPlaylistName}`);
        } else {
            console.warn('All playlists failed to load.');
        }
    }
    
    // ================== GET SONG TITLE FUNCTION ==================
    // This function fetches and displays the YouTube video title
    function getSongTitle() {
        if (player && player.getVideoData) {
            const videoData = player.getVideoData();
            if (videoData && videoData.title) {
                return videoData.title;
            }
        }
        return 'Loading...';
    }

    // ================== CHECK IF YOUTUBE API IS AVAILABLE ==================
    function tryInitializeYouTubePlayer() {
        if (typeof YT !== 'undefined' && YT.Player) {
            console.log('YouTube API loaded successfully');
            onYouTubeIframeAPIReady();
            return true;
        }
        return false;
    }

    // ================== YOUTUBE PLAYER ERROR HANDLER ==================
    function onPlayerError(error) {
        console.warn('YouTube error', error.data, '— skipping');
        playerState.isPlaying = true;
        setTimeout(playNextSong, 800);
    }

    // ================== INITIALIZE YOUTUBE IFRAME API ==================
    // This creates the YouTube player when the API is ready
    function onYouTubeIframeAPIReady() {
        console.log('Initializing YouTube player...');
        
        // Create the iframe container
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player-container';
        playerDiv.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:300px;height:300px;overflow:hidden;';
        document.body.appendChild(playerDiv);
        
        // Initialize the YouTube player with settings
        player = new YT.Player('youtube-player-container', {
            height: '100%',
            width: '100%',
            videoId: DEFAULT_VIDEO_ID,  // Uses the default video ID defined above
            playerVars: {
                'playsinline': 1,        // Allow playback on iOS
                'rel': 0,                // Show related videos only from same channel
                'controls': 0,           // Hide player controls (we use our own buttons)
                'disablekb': 1,          // Disable keyboard controls
                'showinfo': 0,           // Hide video info
                'autohide': 1,           // Auto-hide controls
                'mute': 0                // Start unmuted
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
        
        console.log('YouTube player initialized');
        
        // Initialize playlists from URL if provided
        initializePlaylists();
    }

    // ================== ON PLAYER READY ==================
    // Runs when the YouTube player is ready
    function onPlayerReady(event) {
        console.log('Player is ready');
        isPlayerReady = true;
        player.setVolume(playerState.volume);
        
        // Update song title after a short delay
        setTimeout(() => {
            updateSongTitle();
        }, 1000);
        
        // Play default song first
        playDefaultSong();
        
        // Start progress updates
        startProgressUpdates();
    }

    // ================== ON PLAYER STATE CHANGE ==================
    // Tracks when video plays, pauses, or ends
    function onPlayerStateChange(event) {
        playerState.isPlaying = event.data === YT.PlayerState.PLAYING;
        playerState.isBuffering = event.data === YT.PlayerState.BUFFERING;
        updatePlayButton();
        
        // Update song title when playing starts
        if (playerState.isPlaying) {
            setTimeout(() => {
                updateSongTitle();
            }, 1000);
            // Start progress updates
            startProgressUpdates();
        }
        
        // Auto-play next song when current video ends
        if (event.data === YT.PlayerState.ENDED) {
            playerState.isPlaying = true;
            playNextSong();
        }
    }
    
    // Start progress updates when music starts
    let progressInterval;
    function startProgressUpdates() {
        // Cancel any existing progress interval first to prevent duplicates
        if (progressInterval) {
            cancelAnimationFrame(progressInterval);
        }
        if (playerState.isPlaying) {
            updateProgressBar();
        }
    }
    
    // =========================================
    // UI FUNCTIONS
    // =========================================
    
    // ================== DOM ELEMENTS ==================
    // Music player elements
    const musicPlayer = document.getElementById('musicPlayer');
    const musicPlayerBtn = document.getElementById('musicPlayerBtn');
    const musicPlayerExpanded = document.getElementById('musicPlayerMenu');
    const playMusicText = document.querySelector('.play-music-text');
    const toggleIcon = document.querySelector('.player-toggle-icon i');
    
    // Playlist selector
    const playlistSelectorElem = document.getElementById('playlistSelector');
    
    // Player controls
    const playPauseBtn = document.getElementById('playPauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    
    // Progress
    const progressSlider = document.getElementById('progressSlider');
    const progressFill = document.getElementById('progressFill');
    const playerTitle = document.querySelector('.player-title');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    
    // ================== YOUTUBE API LOADER ==================
    // If YouTube API isn't loaded yet, load it dynamically
    if (!tryInitializeYouTubePlayer()) {
        console.log('Loading YouTube API...');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    // ================== UPDATE SONG TITLE ==================
    // Updates the displayed song title and handles the scrolling marquee
    function updateSongTitle(forcedTitle = null) {
        const title = forcedTitle || getSongTitle();
        if (!title || title === 'Loading...' || title === 'undefined' || title === '') return;

        const titleEl = document.querySelector('.player-title');
        const wrapper = document.querySelector('.player-title-wrapper');

        // If the title hasn't changed, do nothing (prevents resetting the animation mid-scroll)
        if (titleEl.dataset.currentTitle === title) return;
        titleEl.dataset.currentTitle = title;

        // Reset the element
        titleEl.innerHTML = '';
        titleEl.classList.remove('scrolling');

        // Add the new text
        const span = document.createElement('span');
        span.textContent = title;
        titleEl.appendChild(span);

        // Force the browser to calculate the width of the new text
        void titleEl.offsetWidth;

        // If the text is wider than the panel, duplicate it and start scrolling
        if (titleEl.offsetWidth > wrapper.offsetWidth) {
            const clone = span.cloneNode(true);
            titleEl.appendChild(clone);
            titleEl.classList.add('scrolling');
        }
    }

    // ================== UPDATE PLAY/PAUSE BUTTON ==================
    // Changes play icon to pause icon and vice versa
    function updatePlayButton() {
        const menuIcon = playPauseBtn.querySelector('.fas');
        
        if (playerState.isBuffering) {
            // Show loading spinner
            menuIcon.className = 'fas fa-spinner fa-spin';
        } else if (playerState.isPlaying) {
            // Show pause button
            menuIcon.className = 'fas fa-pause';
        } else {
            // Show play button
            menuIcon.className = 'fas fa-play';
        }
    }

    // ================== FORMAT TIME ==================
    // Converts seconds to MM:SS format
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ================== PROGRESS SLIDER FUNCTIONALITY ==================
    // Allows users to seek to different parts of the video
    progressSlider.addEventListener('input', function() {
        if (isPlayerReady && player.seekTo) {
            const duration = player.getDuration();
            const newTime = (this.value / 100) * duration;
            player.seekTo(newTime, true);
            updateProgressFill(this.value);
        }
    });

    // ================== UPDATE PROGRESS FILL ==================
    // Updates the visual progress bar width
    function updateProgressFill(percentage) {
        progressFill.style.width = percentage + '%';
    }

    // ================== UPDATE PROGRESS DURING PLAYBACK ==================
    // This function is called repeatedly to update the progress bar
    function updateProgressBar() {
        if (playerState.isPlaying && isPlayerReady && player.getCurrentTime && player.getDuration) {
            try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                
                if (duration > 0 && !isNaN(duration) && !isNaN(currentTime)) {
                    const percentage = (currentTime / duration) * 100;
                    progressSlider.value = percentage;
                    updateProgressFill(percentage);
                    
                    currentTimeEl.textContent = formatTime(currentTime);
                    durationEl.textContent = formatTime(duration);
                }
            } catch (e) {
                console.log('Error updating progress:', e);
            }
            
            // Use requestAnimationFrame for smooth updates
            progressInterval = requestAnimationFrame(updateProgressBar);
        }
    }

    // =========================================
    // NAVIGATION SCROLL EFFECTS
    // =========================================
    
    const navBar = document.querySelector('.navbar');
    
    // Changes navbar style when user scrolls down
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navBar.style.background = 'rgba(10, 8, 5, 0.95)';
            navBar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navBar.style.background = 'rgba(10, 8, 5, 0.8)';
            navBar.style.boxShadow = 'none';
        }
    });

    // =========================================
    // SMOOTH SCROLLING FOR NAVIGATION LINKS
    // =========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();  // Prevent default anchor jump
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;  // Adjust for fixed header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'  // Smooth scroll animation
                });
            }
        });
    });

    // =========================================
    // PROJECT CARD HOVER EFFECTS
    // =========================================
    
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';  // Move up on hover
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';  // Return to original position
        });
    });

    // =========================================
    // KEYBOARD SHORTCUTS
    // =========================================
    
    document.addEventListener('keydown', function(e) {
        // Spacebar toggles play/pause
        if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
            e.preventDefault();  // Prevent page scrolling
            if (isPlayerReady) {
                if (playerState.isPlaying) {
                    player.pauseVideo();
                } else {
                    player.playVideo();
                }
            }
        }
    });

    // =========================================
    // MENU BUTTON HANDLERS
    // =========================================
    
    // Play/Pause button in menu
    playPauseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!isPlayerReady) return;
        
        if (playerState.isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });
    
    // Rewind button (go to previous song)
    rewindBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        playPreviousSong();
    });
    
    // Forward button (go to next song)
    forwardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        playNextSong();
    });
    
    // Playlist selector change handler
    if (playlistSelectorElem) {
        playlistSelectorElem.addEventListener('change', function(e) {
            const selectedPlaylist = e.target.value;
            switchPlaylist(selectedPlaylist);
        });
    }

    // =========================================
    // INITIALIZE
    // =========================================
    
    // Add fade-in animation to sections as they scroll into view
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // =========================================
    // PLAYLIST FUNCTIONS
    // =========================================
    
    // Switch to a different playlist
    function switchPlaylist(playlistName) {
        if (currentPlaylistName === playlistName) return;
        
        currentPlaylistName = playlistName;
        // DO NOT reset playedIndices!
        // DO NOT reset historyStack!
        // DO NOT reset historyPointer!
    }
    
    // Get next song index (random, no repeats until 75% played)
    function getNextSongIndex() {
        const playlist = playlists[currentPlaylistName];
        if (!playlist || playlist.length === 0) return -1;
        if (playlist.length === 1) return 0;

        // 1. Calculate the 75% threshold for the CURRENT playlist
        const threshold = Math.ceil(playlist.length * 0.75);

        // 2. Trim the master array to the threshold (keep only most recent)
        if (playedIndices.length > threshold) {
            playedIndices = playedIndices.slice(-threshold);
        }

        // 3. Extract only the indices for the CURRENT playlist
        const currentPlaylistHistory = playedIndices
            .filter(item => item[0] === currentPlaylistName)
            .map(item => item[1]);
            
        const uniquePlayed = new Set(currentPlaylistHistory);

        // 4. Pick from unplayed songs
        if (uniquePlayed.size < threshold) {
            const unplayedIndices = playlist
                .map((_, idx) => idx)
                .filter(idx => !uniquePlayed.has(idx));

            if (unplayedIndices.length === 0) {
                // Reset ONLY this playlist's history if all played
                playedIndices = playedIndices.filter(item => item[0] !== currentPlaylistName);
                const randomIdx = Math.floor(Math.random() * playlist.length);
                playedIndices.push([currentPlaylistName, randomIdx]);
                return randomIdx;
            }

            const randomIdx = unplayedIndices[Math.floor(Math.random() * unplayedIndices.length)];
            playedIndices.push([currentPlaylistName, randomIdx]);
            return randomIdx;
        }

        // 5. After threshold — allow repeats but never back-to-back
        const lastItem = playedIndices.length > 0 ? playedIndices[playedIndices.length - 1] : null;
        const lastPlayed = (lastItem && lastItem[0] === currentPlaylistName) ? lastItem[1] : -1;
        
        const available = playlist
            .map((_, idx) => idx)
            .filter(idx => idx !== lastPlayed);
            
        const randomIdx = available[Math.floor(Math.random() * available.length)];
        playedIndices.push([currentPlaylistName, randomIdx]);
        return randomIdx;
    }

    // Helper to load a specific index from the playlist
    function loadAndPlay(index) {
        // Validate playlist exists
        if (index !== -1 && (!playlists[currentPlaylistName] || !playlists[currentPlaylistName][index])) {            // Fallback to default video if playlist/video not found
            const videoId = DEFAULT_VIDEO_ID;
            if (isPlayerReady && videoId) {
                player.loadVideoById(videoId);
            }
            return;
        }
        
        const videoId = index === -1 ? DEFAULT_VIDEO_ID : playlists[currentPlaylistName][index];
        
        let cachedTitle = null;
        if (index !== -1 && playlistTitles[currentPlaylistName] && playlistTitles[currentPlaylistName][index]) {
            cachedTitle = playlistTitles[currentPlaylistName][index];
        }

        if (isPlayerReady && videoId) {
            // 1. Force the loading spinner immediately
            playerState.isBuffering = true;
            updatePlayButton();
            
            // Update the UI text instantly
            if (cachedTitle) {
                updateSongTitle(cachedTitle);
            } else {
                setTimeout(updateSongTitle, 200); // Fallback for default track
            }
            
            // Play or Cue based on current state
            if (playerState.isPlaying) {
                player.loadVideoById(videoId); // Play if currently playing
            } else {
                player.cueVideoById(videoId);  // Load without playing if paused
            }
        }
        
        updatePlayButton();
    }
    
    // Helper to load a specific song from history (handles jumping across playlists)
    function playFromHistory(historyItem) {
        if (!historyItem) return;
        
        let plName = historyItem[0];
        let index = historyItem[1];
        
        if (!plName) {
            // Use current playlist or first available if history is incomplete
            plName = currentPlaylistName || Object.keys(playlists)[0] || '';
            // Don't mutate history stack - create new item
            historyItem = [plName, index];
        }
        
        // If the history item is from a different playlist, switch back to it
        if (currentPlaylistName !== plName) {
            currentPlaylistName = plName;
            const selector = document.getElementById('playlistSelector');
            if (selector) selector.value = plName;
        }
        
        loadAndPlay(index);
    }

    // Play default song first
    function playDefaultSong() {
        // Only reset history pointer, don't destroy entire history
        historyPointer = 0;
        historyStack = [[currentPlaylistName, -1]];
        loadAndPlay(-1);
    }
    
    // Play next song from playlist
    function playNextSong() {
        // If we have "Forward" history (user clicked Back previously)
        if (historyPointer < historyStack.length - 1) {
            historyPointer++;
            const nextItem = historyStack[historyPointer];
            playFromHistory(nextItem); // Use the new helper
        } 
        // If we are at the newest song, pick a new random one
        else {
            const playlist = playlists[currentPlaylistName];
            if (!playlist || playlist.length === 0) return;

            const nextIndex = getNextSongIndex();
            if (nextIndex < 0) return;

            // Change this line to push the playlist name and index
            historyStack.push([currentPlaylistName, nextIndex]); 
            historyPointer++;
            loadAndPlay(nextIndex);
        }
    }
    
    // Play previous song from playlist
    function playPreviousSong() {
        // If we can go back in history
        if (historyPointer > 0) {
            historyPointer--;
            const prevItem = historyStack[historyPointer];
            playFromHistory(prevItem); // Use the new helper
        } 
        // If we are at the very first song, restart it
        else {
            if (isPlayerReady && player.seekTo) player.seekTo(0, true);
        }
    }
    
    // =========================================
    // MUSIC PLAYER MENU TOGGLE
    // =========================================
    
    // Get the collapse button
    const playerCollapseBtn = document.getElementById('playerCollapseBtn');
    
    // Open menu when clicking the music player button (PLAY MUSIC)
    if (musicPlayerBtn && musicPlayerExpanded) {
        musicPlayerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openMenu();
        });
    }
    
    // Collapse menu when clicking the collapse button
    if (playerCollapseBtn) {
        playerCollapseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMenu();
        });
    }
    
    function openMenu() {
        if (isMenuOpen) return;  // Already open
        
        isMenuOpen = true;
        // Expand the button into the menu
        musicPlayerBtn.style.display = 'none';
        musicPlayerExpanded.classList.add('open');
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
        playMusicText.textContent = 'Music Playing';
    }
    
    function closeMenu() {
        if (!isMenuOpen) return;  // Already closed
        
        isMenuOpen = false;
        // Collapse the menu back into the button
        musicPlayerExpanded.classList.remove('open');
        musicPlayerBtn.style.display = 'flex';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
        playMusicText.textContent = 'Play Music';
    }
});
