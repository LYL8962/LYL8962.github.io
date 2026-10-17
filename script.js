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
        videoId: 'jtL_OQZc5g4',  // CHANGE THIS to your preferred YouTube video ID
        volume: 50                // Default volume (0-100)
    };

    let player;
    let ytApiLoaded = false;
    let isPlayerReady = false;

    // Default YouTube track - Change this to your preferred video ID
    // This is used if playerState.videoId doesn't work
    const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4';  // CHANGE THIS to your preferred YouTube video ID
    
    // ================== PLAYLIST SETTINGS ==================
    // Set your default playlist URL here
    // The player will extract video IDs from this playlist
    // Example: 'https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx'
    const DEFAULT_PLAYLIST_URL = 'https://youtube.com/playlist?list=PLSHWNSkbahOm4vbLiqF2fBJ8xf1DPnSlc&si=mxgpt3ycvEyYzq4k';  // Leave empty to use hardcoded playlist IDs below
    
    // ================== PLAYLIST DATA ==================
    // Define your playlists here with YouTube video IDs
    // Replace the video IDs below with your actual YouTube video IDs
    // Get YouTube video IDs from: https://www.youtube.com/watch?v=VIDEO_ID_HERE
    // These are used if DEFAULT_PLAYLIST_URL is empty
    const playlists = {
        'Chill Vibes': [
            '3JZ_D3ELwOQ', '2zNSgSzhBfM', 'K63rlQV8WVE', '7Gld1t3p1qY', '1a2b3c4d5e6',
            'f5e4d3c2b1a', 'z9y8x7w6v5u', 't4s3r2q1p0o', 'n9m8l7k6j5i', 'h4g3f2e1d0c'
        ],
        'LoFi Beats': [
            'jWfXkZa1BcD', 'eFgHiJkLmNo', 'pQrStUvWxYz', '1a2b3c4d5e6', '7f8g9h0i1j2',
            'KlMnOpQrStU', 'VwXyZ123456', 'AbCdEfGhIjK', 'LmNoPqRsTuV', 'WxYz0123456'
        ],
        'Focus Music': [
            '5yFzQJvW0aI', '3JZ_D3ELwOQ', '2zNSgSzhBfM', 'K63rlQV8WVE', '7Gld1t3p1qY',
            'n9m8l7k6j5i', 'h4g3f2e1d0c', 'b9a8z7y6x5w', 'v4u3t2s1r0q', 'p9o8n7m6l5k'
        ]
    };
    
    // Playlist state
    let currentPlaylistName = 'Chill Vibes';
    let playedIndices = [];
    let currentSongIndex = -1;
    let defaultSongPlayed = false;
    
    // Menu state
    let isMenuOpen = false;
    
    // ================== EXTRACT PLAYLIST VIDEOS FUNCTION ==================
    // Function to extract video IDs from a YouTube playlist URL
    // Usage: window.extractPlaylistVideos('https://youtube.com/playlist?list=PLAYLIST_ID')
    // Note: Requires YouTube Data API key to fetch actual video IDs
    // Get API key from: https://console.cloud.google.com/
    window.extractPlaylistVideos = async function(playlistUrl) {
        try {
            // Extract playlist ID from URL
            const playlistIdMatch = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);
            if (!playlistIdMatch) {
                alert('Invalid YouTube playlist URL');
                return [];
            }
            const playlistId = playlistIdMatch[1];
            
            const apiKey = 'YOUR_YOUTUBE_API_KEY'; // Replace with your actual API key
            
            if (apiKey === 'YOUR_YOUTUBE_API_KEY') {
                console.warn('YouTube API key not set. Returning playlist ID only.');
                return { playlistId: playlistId, videoIds: [] };
            }
            
            const videoIds = [];
            let nextPageToken = null;
            
            do {
                const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;
                
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                if (data.error) {
                    console.error('YouTube API error:', data.error);
                    return [];
                }
                
                data.items.forEach(item => {
                    const videoId = item.contentDetails.videoId;
                    if (videoId) {
                        videoIds.push(videoId);
                    }
                });
                
                nextPageToken = data.nextPageToken;
            } while (nextPageToken);
            
            return videoIds;
        } catch (error) {
            console.error('Error extracting playlist videos:', error);
            return [];
        }
    };
    
    // Initialize playlists - fetch from URL if provided, otherwise use hardcoded data
    async function initializePlaylists() {
        if (DEFAULT_PLAYLIST_URL && DEFAULT_PLAYLIST_URL.trim() !== '') {
            console.log('Fetching playlist from URL:', DEFAULT_PLAYLIST_URL);
            try {
                // Extract video IDs from the playlist URL
                const result = await window.extractPlaylistVideos(DEFAULT_PLAYLIST_URL);
                
                if (result.playlistId && result.videoIds && result.videoIds.length > 0) {
                    // Create a new playlist with the fetched videos
                    const playlistName = 'My Playlist';
                    playlists[playlistName] = result.videoIds;
                    currentPlaylistName = playlistName;
                    
                    // Update the dropdown
                    const selector = document.getElementById('playlistSelector');
                    if (selector) {
                        // Check if option already exists
                        let option = selector.querySelector(`option[value="${playlistName}"]`);
                        if (!option) {
                            option = document.createElement('option');
                            option.value = playlistName;
                            option.textContent = playlistName;
                            selector.appendChild(option);
                        }
                        selector.value = playlistName;
                    }
                    
                    console.log(`Loaded ${result.videoIds.length} videos from playlist`);
                    return;
                }
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        }
        
        // Use default playlist if URL extraction failed or not provided
        console.log('Using hardcoded playlists');
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
            ytApiLoaded = true;
            return true;
        }
        return false;
    }

    // ================== YOUTUBE PLAYER ERROR HANDLER ==================
    function onPlayerError(error) {
        console.error('YouTube player error:', error);
        
        // Try to skip to the next song on error
        if (error === 100 || error === 150) {
            // Video not found or private - skip to next
            playNextSong();
            return;
        }
        
        // Show error message
        if (playerTitle) {
            playerTitle.textContent = 'Player Error - Check Console';
        }
    }

    // ================== INITIALIZE YOUTUBE IFRAME API ==================
    // This creates the YouTube player when the API is ready
    function onYouTubeIframeAPIReady() {
        console.log('Initializing YouTube player...');
        
        // Create the iframe container
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player-container';
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
            playNextSong();
        }
    }
    
    // Start progress updates when music starts
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
    // Updates the displayed song title
    function updateSongTitle() {
        const title = getSongTitle();
        if (title && title !== 'Loading...' && title !== 'undefined' && title !== '') {
            playerTitle.textContent = title;
        }
    }

    // ================== UPDATE PLAY/PAUSE BUTTON ==================
    // Changes play icon to pause icon and vice versa
    function updatePlayButton() {
        // Update menu button
        const menuIcon = playPauseBtn.querySelector('.fas');
        if (playerState.isPlaying) {
            menuIcon.className = 'fas fa-pause';
        } else {
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
    let progressInterval;
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
    
    // ================== CANCEL PROGRESS UPDATES ==================
    // Stops updating progress bar when paused
    function stopProgressBar() {
        if (progressInterval) {
            cancelAnimationFrame(progressInterval);
            progressInterval = null;
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
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
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
    // CUSTOM YOUTUBE PLAYER FUNCTIONS
    // =========================================
    
    // Function to change YouTube track - Call window.changeYouTubeTrack('VIDEO_ID')
    window.changeYouTubeTrack = function(videoId) {
        if (isPlayerReady) {
            player.loadVideoById(videoId);
            playerState.videoId = videoId;
            player.playVideo();
            updateSongTitle();
        }
    };

    // Function to play a YouTube URL - Call window.playYouTubeUrl('URL')
    window.playYouTubeUrl = function(url) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
            window.changeYouTubeTrack(videoId);
        } else {
            alert('Invalid YouTube URL. Please try again.');
        }
    };

    // Helper function to extract YouTube video ID from various URL formats
    function extractYouTubeVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }
    
    // =========================================
    // PLAYLIST FUNCTIONS
    // =========================================
    
    // Switch to a different playlist
    function switchPlaylist(playlistName) {
        currentPlaylistName = playlistName;
        playedIndices = [];
        defaultSongPlayed = false;
        currentSongIndex = -1;
        
        // Just update the dropdown - the user will click play to start
        console.log('Playlist switched to:', playlistName);
    }
    
    // Get next song index (random, no repeats until 75% played)
    function getNextSongIndex() {
        const playlist = playlists[currentPlaylistName];
        const threshold = Math.floor(playlist.length * 0.75);
        
        // Count unique songs that have been played
        const uniquePlayed = new Set(playedIndices);
        
        // If we've played less than 75%, only pick from unplayed songs
        if (uniquePlayed.size < threshold) {
            const unplayedIndices = playlist
                .map((_, idx) => idx)
                .filter(idx => !uniquePlayed.has(idx));
            
            if (unplayedIndices.length === 0) {
                // Reset if all played
                uniquePlayed.clear();
                playedIndices = [];
                const randomIdx = Math.floor(Math.random() * playlist.length);
                playedIndices.push(randomIdx);
                return randomIdx;
            }
            
            const randomIdx = unplayedIndices[Math.floor(Math.random() * unplayedIndices.length)];
            playedIndices.push(randomIdx);
            return randomIdx;
        }
        
        // After 75%, allow repeats
        const randomIdx = Math.floor(Math.random() * playlist.length);
        playedIndices.push(randomIdx);
        return randomIdx;
    }
    
    // Play default song first
    function playDefaultSong() {
        defaultSongPlayed = true;
        currentSongIndex = -1; // Special marker for default song
        if (isPlayerReady) {
            player.loadVideoById(DEFAULT_VIDEO_ID);
            player.playVideo();
            playerState.videoId = DEFAULT_VIDEO_ID;
            setTimeout(updateSongTitle, 1000);
        }
        updatePlayButton();
    }
    
    // Play next song from playlist
    function playNextSong() {
        const nextIndex = getNextSongIndex();
        currentSongIndex = nextIndex;
        const nextVideoId = playlists[currentPlaylistName][nextIndex];
        
        if (isPlayerReady) {
            player.loadVideoById(nextVideoId);
            player.playVideo();
            playerState.videoId = nextVideoId;
            setTimeout(updateSongTitle, 1000);
        }
        updatePlayButton();
    }
    
    // Play previous song from playlist
    function playPreviousSong() {
        // If currently on default song
        if (currentSongIndex === -1 && defaultSongPlayed) {
            // If we have played songs, go to the last one
            if (playedIndices.length > 0) {
                const prevIndex = playedIndices[playedIndices.length - 1];
                currentSongIndex = prevIndex;
                const prevVideoId = playlists[currentPlaylistName][prevIndex];
                
                if (isPlayerReady) {
                    player.loadVideoById(prevVideoId);
                    player.playVideo();
                    playerState.videoId = prevVideoId;
                    setTimeout(updateSongTitle, 1000);
                }
                updatePlayButton();
            } else {
                // No previous songs, stay on default
                playDefaultSong();
            }
            return;
        }
        
        // If in playlist mode, go to previous song
        if (playedIndices.length > 1) {
            // Remove the last index (current) and get the new last (previous)
            playedIndices.pop();
            const prevIndex = playedIndices[playedIndices.length - 1];
            currentSongIndex = prevIndex;
            const prevVideoId = playlists[currentPlaylistName][prevIndex];
            
            if (isPlayerReady) {
                player.loadVideoById(prevVideoId);
                player.playVideo();
                playerState.videoId = prevVideoId;
                setTimeout(updateSongTitle, 1000);
            }
            updatePlayButton();
        } else if (playedIndices.length === 1) {
            // Only one song played, go back to default
            currentSongIndex = -1;
            playDefaultSong();
        } else {
            // No songs played yet, stay on default
            playDefaultSong();
        }
    }
    
    // =========================================
    // MUSIC PLAYER MENU TOGGLE
    // =========================================    
    console.log('Music player button:', musicPlayerBtn);
    console.log('Music player expanded:', musicPlayerExpanded);
    console.log('Toggle icon:', toggleIcon);
    
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
