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
        videoId: null,
        volume: 50
    };

    // Default YouTube track (YouTube Audio Library - Happy Music)
    // You can replace this with any YouTube video ID
    const DEFAULT_VIDEO_ID = 'jtL_OQZc5g4'; // Happy song from YouTube Audio Library
    
    // Initialize YouTube iframe API
    let player;
    
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('youtubePlayer', {
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
                'mute': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        // Set initial volume
        player.setVolume(playerState.volume);
        
        // Update UI to reflect muted state
        updateMuteIcon();
    }

    function onPlayerStateChange(event) {
        playerState.isPlaying = event.data === YT.PlayerState.PLAYING;
        updatePlayButton();
        
        if (playerState.isPlaying) {
            showAudioPlayer();
        }
    }

    // =========================================
    // UI Functions
    // =========================================
    
    // Start Music Button
    const startMusicBtn = document.getElementById('startMusic');
    const closePlayerBtn = document.getElementById('closePlayer');
    const playPauseBtn = document.getElementById('playPause');
    const muteBtn = document.getElementById('mute');
    const audioPlayer = document.getElementById('audioPlayer');
    const progressSlider = document.getElementById('progressSlider');
    const progressFill = document.getElementById('progressFill');
    
    // YouTube iframe
    const youtubePlayer = document.getElementById('youtubePlayer');
    
    // Check if YouTube API is loaded
    let ytApiLoaded = false;
    let apiLoadAttempts = 0;
    const MAX_API_LOAD_ATTEMPTS = 20;
    
    // Try to initialize YouTube player
    function tryInitializeYouTubePlayer() {
        if (typeof YT !== 'undefined' && YT.Player) {
            onYouTubeIframeAPIReady();
            ytApiLoaded = true;
            return true;
        }
        return false;
    }
    
    // Load YouTube API dynamically if not loaded
    if (!tryInitializeYouTubePlayer()) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    
    // Check periodically if API loaded (for cases where it loads before DOMContentLoaded)
    const apiCheckInterval = setInterval(() => {
        if (tryInitializeYouTubePlayer()) {
            clearInterval(apiCheckInterval);
        }
        apiLoadAttempts++;
        if (apiLoadAttempts >= MAX_API_LOAD_ATTEMPTS) {
            clearInterval(apiCheckInterval);
            console.warn('YouTube API failed to load after multiple attempts');
        }
    }, 100);

    // Start music button click
    startMusicBtn.addEventListener('click', function() {
        // Check if YouTube API is available
        if (typeof YT === 'undefined' || !YT.Player) {
            alert('Loading YouTube player... Please wait a few seconds and try again.');
            return;
        }
        
        if (!player) {
            alert('YouTube player is not initialized yet. Please wait...');
            return;
        }
        
        if (!playerState.videoId) {
            // Set default video if not set
            player.cueVideoById(DEFAULT_VIDEO_ID);
            playerState.videoId = DEFAULT_VIDEO_ID;
        }
        
        // Unmute and play
        player.unMute();
        playerState.isMuted = false;
        updateMuteIcon();
        player.playVideo();
    });

    // Close audio player
    closePlayerBtn.addEventListener('click', function() {
        audioPlayer.classList.remove('active');
        player.pauseVideo();
    });

    // Play/Pause button
    playPauseBtn.addEventListener('click', function() {
        if (playerState.isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    // Mute/Unmute button
    muteBtn.addEventListener('click', function() {
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

    // Update play/pause icon
    function updatePlayButton() {
        const icon = playPauseBtn.querySelector('i');
        if (playerState.isPlaying) {
            icon.className = 'fas fa-pause';
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

    // Show audio player when music starts
    function showAudioPlayer() {
        audioPlayer.classList.add('active');
        
        // Update player info
        const playerTitle = document.querySelector('.player-title');
        
        // Get video title from YouTube
        if (player.getVideoData) {
            const videoData = player.getVideoData();
            if (videoData && videoData.title) {
                playerTitle.textContent = videoData.title;
            } else {
                playerTitle.textContent = 'Playing Music...';
            }
        }
    }

    // Progress slider functionality
    progressSlider.addEventListener('input', function() {
        if (player && player.seekTo) {
            const duration = player.getDuration();
            const newTime = (this.value / 100) * duration;
            player.seekTo(newTime, true);
            
            // Update progress fill
            updateProgressFill(this.value);
        }
    });

    // Update progress display
    function updateProgressFill(percentage) {
        progressFill.style.width = percentage + '%';
    }

    // Update progress during playback
    function onPlayerProgress() {
        if (player && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const percentage = (currentTime / duration) * 100;
                progressSlider.value = percentage;
                updateProgressFill(percentage);
            }
            
            requestAnimationFrame(onPlayerProgress);
        }
    }

    // Start progress updates
    onPlayerProgress();

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
    // Contact Form (Placeholder)
    // =========================================
    
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }

    // =========================================
    // Keyboard Shortcuts
    // =========================================
    
    document.addEventListener('keydown', function(e) {
        // Spacebar toggles play/pause
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (playerState.isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
        
        // M key toggles mute
        if (e.code === 'KeyM') {
            muteBtn.click();
        }
        
        // Escape closes player
        if (e.code === 'Escape' && audioPlayer.classList.contains('active')) {
            audioPlayer.classList.remove('active');
            player.pauseVideo();
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
        player.loadVideoById(videoId);
        playerState.videoId = videoId;
        player.playVideo();
    };

    // Function to play a YouTube URL
    window.playYouTubeUrl = function(url) {
        // Extract video ID from URL
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

    // Expose function to window for external use
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
});

// =========================================
// Animation Functions
// =========================================

// Floating animation for background elements
function startBackgroundAnimations() {
    const elements = document.querySelectorAll('.hero::before, .hero::after');
    
    elements.forEach((el, index) => {
        const animationDuration = index === 0 ? '20s' : '25s';
        const animationName = 'float';
        
        el.style.animation = `${animationName} ${animationDuration} infinite alternate`;
    });
}

// Start background animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(startBackgroundAnimations, 100);
});
