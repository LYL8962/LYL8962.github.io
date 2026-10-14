// =========================================
// LYL8962 Personal Website JavaScript
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    // =========================================
    // YouTube Player Setup
    // =========================================
    let playerState = {
        isPlaying: false,
        isMuted: false,
        videoId: 'jtL_OQZc5g4',
        volume: 50
    };

    let player;
    let ytApiLoaded = false;
    let isPlayerReady = false;

    // Default YouTube track
    const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4';
    
    // Get the song name from YouTube API
    function getSongTitle() {
        if (player && player.getVideoData) {
            const videoData = player.getVideoData();
            if (videoData && videoData.title) {
                return videoData.title;
            }
        }
        return 'Loading...';
    }

    // Try to initialize YouTube player
    function tryInitializeYouTubePlayer() {
        if (typeof YT !== 'undefined' && YT.Player) {
            console.log('YouTube API loaded successfully');
            onYouTubeIframeAPIReady();
            ytApiLoaded = true;
            return true;
        }
        return false;
    }

    // Initialize YouTube iframe API
    function onYouTubeIframeAPIReady() {
        console.log('Initializing YouTube player...');
        
        // Create the iframe
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player-container';
        document.body.appendChild(playerDiv);
        
        player = new YT.Player('youtube-player-container', {
            height: '100%',
            width: '100%',
            videoId: DEFAULT_VIDEO_ID,
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'controls': 0,
                'disablekb': 1,
                'showinfo': 0,
                'autohide': 1,
                'mute': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        
        isPlayerReady = true;
        console.log('YouTube player initialized');
    }

    function onPlayerReady(event) {
        console.log('Player is ready');
        player.setVolume(playerState.volume);
        updateMuteIcon();
        
        // Update song title
        setTimeout(() => {
            updateSongTitle();
        }, 1000);
        
        // Auto-play the song when player is ready
        setTimeout(() => {
            console.log('Auto-playing music...');
            player.playVideo();
            playerState.isPlaying = true;
            updatePlayButton();
        }, 1000);
    }

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

    // =========================================
    // UI Functions
    // =========================================
    
    // DOM Elements
    const musicPlayerBtn = document.getElementById('musicPlayerBtn');
    const muteBtn = document.getElementById('muteBtn');
    const progressSlider = document.getElementById('progressSlider');
    const progressFill = document.getElementById('progressFill');
    const playerTitle = document.querySelector('.player-title');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    
    // Check if YouTube API is available
    if (!tryInitializeYouTubePlayer()) {
        // Load YouTube API dynamically
        console.log('Loading YouTube API...');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    // Update song title
    function updateSongTitle() {
        const title = getSongTitle();
        if (title && title !== 'Loading...' && title !== 'undefined' && title !== '') {
            playerTitle.textContent = title;
        }
    }

    // Update play/pause button
    function updatePlayButton() {
        const icon = musicPlayerBtn.querySelector('.fas');
        const progressBar = musicPlayerBtn.querySelector('.progress-bar-container');
        
        if (playerState.isPlaying) {
            icon.className = 'fas fa-pause';
            progressBar.style.display = 'block';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    // Update mute icon
    function updateMuteIcon() {
        const icon = muteBtn.querySelector('i');
        if (playerState.isMuted) {
            icon.className = 'fas fa-volume-mute';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    // Format time (seconds to mm:ss)
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Progress slider functionality
    progressSlider.addEventListener('input', function() {
        if (isPlayerReady && player.seekTo) {
            const duration = player.getDuration();
            const newTime = (this.value / 100) * duration;
            player.seekTo(newTime, true);
            updateProgressFill(this.value);
        }
    });

    // Update progress display
    function updateProgressFill(percentage) {
        progressFill.style.width = percentage + '%';
    }

    // Update progress during playback
    function onPlayerProgress() {
        if (isPlayerReady && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const percentage = (currentTime / duration) * 100;
                progressSlider.value = percentage;
                updateProgressFill(percentage);
                
                currentTimeEl.textContent = formatTime(currentTime);
                durationEl.textContent = formatTime(duration);
            }
            
            requestAnimationFrame(onPlayerProgress);
        }
    }

    // Start progress updates
    onPlayerProgress();

    // Music player button click - toggle play/pause
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

    // Mute button
    muteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
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
    // Navigation Scroll Effects
    // =========================================
    
    const navBar = document.querySelector('.navbar');
    
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
    // Smooth Scrolling for Navigation Links
    // =========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =========================================
    // Project Card Hover Effects
    // =========================================
    
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // =========================================
    // Keyboard Shortcuts
    // =========================================
    
    document.addEventListener('keydown', function(e) {
        // Spacebar toggles play/pause
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
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
                muteBtn.click();
            }
        }
    });

    // =========================================
    // Initialize
    // =========================================
    
    // Add fade-in animation to sections
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
    // Custom YouTube Player Functions
    // =========================================
    
    // Function to change YouTube track
    window.changeYouTubeTrack = function(videoId) {
        if (isPlayerReady) {
            player.loadVideoById(videoId);
            playerState.videoId = videoId;
            player.playVideo();
            updateSongTitle();
        }
    };

    // Function to play a YouTube URL
    window.playYouTubeUrl = function(url) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
            window.changeYouTubeTrack(videoId);
        } else {
            alert('Invalid YouTube URL. Please try again.');
        }
    };

    // Helper function to extract YouTube video ID
    function extractYouTubeVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }
});
