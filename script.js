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
        isMuted: false,
        videoId: 'jtL_OQZc5g4',  // CHANGE THIS to your preferred YouTube video ID
        volume: 50                // Default volume (0-100)
    };

    let player;
    let ytApiLoaded = false;
    let isPlayerReady = false;

    // Default YouTube track - Change this to your preferred video ID
    // This is used if playerState.videoId doesn't work
    const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4';  // CHANGE THIS to your preferred YouTube video ID
    
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
                'onStateChange': onPlayerStateChange
            }
        });
        
        isPlayerReady = true;
        console.log('YouTube player initialized');
    }

    // ================== ON PLAYER READY ==================
    // Runs when the YouTube player is ready
    function onPlayerReady(event) {
        console.log('Player is ready');
        player.setVolume(playerState.volume);
        updateMuteIcon();
        
        // Update song title after a short delay
        setTimeout(() => {
            updateSongTitle();
        }, 1000);
        
        // Auto-play the song when player is ready
        // Note: Some browsers may block auto-play
        setTimeout(() => {
            console.log('Auto-playing music...');
            player.playVideo();
            playerState.isPlaying = true;
            updatePlayButton();
            startProgressUpdates();  // Start progress updates
        }, 1000);
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
        }
    }
    
    // ================== UPDATE PROGRESS BAR ==================
    // Updates the progress bar position while playing
    function updateProgressBar() {
        if (!playerState.isPlaying) return;
        
        if (isPlayerReady && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0 && !isNaN(duration)) {
                const percentage = (currentTime / duration) * 100;
                progressSlider.value = percentage;
                updateProgressFill(percentage);
                
                currentTimeEl.textContent = formatTime(currentTime);
                durationEl.textContent = formatTime(duration);
            }
            
            requestAnimationFrame(updateProgressBar);
        }
    }

    // =========================================
    // UI FUNCTIONS
    // =========================================
    
    // ================== DOM ELEMENTS ==================
    // Music player button and menu
    const musicPlayerBtn = document.getElementById('musicPlayerBtn');
    const musicPlayerMenu = document.getElementById('musicPlayerMenu');
    const playMusicText = document.querySelector('.play-music-text');
    const toggleIcon = document.querySelector('.player-toggle-icon i');
    
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

    // ================== UPDATE MUTE ICON ==================
    // Changes mute/unmute icon based on current state
    function updateMuteIcon() {
        const icon = muteBtn.querySelector('i');
        if (playerState.isMuted) {
            icon.className = 'fas fa-volume-mute';
        } else {
            icon.className = 'fas fa-volume-up';
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
        cancelAnimationFrame(progressInterval);
    }

    // ================== START PROGRESS UPDATES ==================
    function startProgressUpdates() {
        if (playerState.isPlaying) {
            updateProgressBar();
        }
    }

    // ================== MUSIC PLAYER BUTTON CLICK ==================
    // Toggle play/pause when clicking the music player button
    musicPlayerBtn.addEventListener('click', function(e) {
        // Don't toggle if clicking on mute button or progress bar
        if (e.target === muteBtn || e.target.closest('.progress-bar-container')) {
            return;
        }
        
        if (!isPlayerReady) {
            alert('Player is initializing... Please wait...');
            return;
        }
        
        if (playerState.isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    // ================== MUTE BUTTON CLICK ==================
    // Toggle mute/unmute when clicking the mute button
    muteBtn.addEventListener('click', function(e) {
        e.stopPropagation();  // Prevent triggering play/pause
        if (!isPlayerReady) return;
        
        if (playerState.isMuted) {
            player.unMute();
            playerState.isMuted = false;
            player.setVolume(playerState.volume);
        } else {
            player.mute();
            playerState.isMuted = true;
        }
        updateMuteIcon();
    });

    // =========================================
    // NAVIGATION SCROLL EFFECTS
    // =========================================
    
    const navBar = document.querySelector('.navbar');
    
    // Changes navbar style when user scrolls down
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navBar.style.background = 'rgba(15, 23, 42, 0.95)';
            navBar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navBar.style.background = 'rgba(15, 23, 42, 0.8)';
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
        
        // M key toggles mute
        if (e.code === 'KeyM') {
            if (isPlayerReady) {
                // Mute functionality can be added later if needed
                console.log('Mute shortcut - to be implemented');
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
    
    // Rewind button (10 seconds back)
    rewindBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isPlayerReady && player.getCurrentTime) {
            const currentTime = player.getCurrentTime();
            player.seekTo(Math.max(0, currentTime - 10), true);
        }
    });
    
    // Forward button (10 seconds forward)
    forwardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isPlayerReady && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            player.seekTo(Math.min(duration, currentTime + 10), true);
        }
    });

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
    // MUSIC PLAYER MENU TOGGLE
    // =========================================
    let isMenuOpen = false;
    
    console.log('Music player button:', musicPlayerBtn);
    console.log('Music player menu:', musicPlayerMenu);
    console.log('Toggle icon:', toggleIcon);
    
    if (musicPlayerBtn && musicPlayerMenu) {
        musicPlayerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Button clicked!');
            console.log('Menu open before:', isMenuOpen);
            toggleMenu();
            console.log('Menu open after:', isMenuOpen);
        });
    }
    
    function toggleMenu() {
        console.log('Toggle menu function called');
        isMenuOpen = !isMenuOpen;
        console.log('Is menu open:', isMenuOpen);
        
        if (isMenuOpen) {
            console.log('Adding open class to menu');
            musicPlayerMenu.classList.add('open');
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
            playMusicText.textContent = 'Music Playing';
        } else {
            console.log('Removing open class from menu');
            musicPlayerMenu.classList.remove('open');
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
            playMusicText.textContent = 'Play Music';
        }
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !musicPlayerBtn.contains(e.target) && !musicPlayerMenu.contains(e.target)) {
            toggleMenu();
        }
    });
});
