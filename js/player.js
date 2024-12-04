function initializePlayer(container) {
    if (container.getAttribute('data-initialized') === 'true') return;
    
    const player = new YT.Player(container.id, {
        videoId: 'live_stream',
        playerVars: {
            'controls': 0,
            'rel': 0,
            'modestbranding': 1,
            'channel': 'UCyYoY9S20IXXPLPrQWE5RfA',
            'autoplay': 1,
            'mute': isMuted ? 1 : 0,
            'fs': 0,
            'playsinline': 1,
            'enablejsapi': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    container.setAttribute('data-initialized', 'true');
}

// 全域變數
var players = [];
var isPlaying = true;  // 預設為播放狀態
var isMuted = true;  // 預設靜音
var currentVolume = 1; // 預設音量

// YouTube API 準備就緒時的初始化
function onYouTubeIframeAPIReady() {
    const playerIds = ['player-1', 'player-2', 'player-3', 'player-4'];
    
    playerIds.forEach(id => {
        const player = new YT.Player(id, {
            videoId: 'live_stream',
            playerVars: {
                'controls': 0,
                'rel': 0,
                'modestbranding': 1,
                'channel': 'UCyYoY9S20IXXPLPrQWE5RfA',
                'autoplay': 1,
                'mute': 1,
                'fs': 0,
                'playsinline': 1,
                'enablejsapi': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    });
}

// 播放器狀態變更處理
function onPlayerStateChange(event) {
    if (event.target === players[0]) {
        if (event.data == YT.PlayerState.PLAYING) {
            isPlaying = true;
            document.getElementById('playPauseBtn').textContent = '⏸';
        } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
            isPlaying = false;
            document.getElementById('playPauseBtn').textContent = '▶';
        }
    }
}

// 播放器準備就緒時的處理
function onPlayerReady(event) {
    players.push(event.target);
    event.target.playVideo();  // 確保每個播放器都會播放
    
    // 當所有播放器都準備就緒時初始化控制
    if (players.length === 4) {
        setupControls();
        document.getElementById('playPauseBtn').textContent = '⏸';  // 設置播放按鈕為暫停狀態
        
        // 載入儲存的音量設定
        const savedVolume = localStorage.getItem('playerVolume');
        const savedMuted = localStorage.getItem('playerMuted');
        
        if (savedVolume === null) {
            isMuted = true;
            currentVolume = 100;
            localStorage.setItem('playerVolume', currentVolume);
            localStorage.setItem('playerMuted', isMuted);
            muteBtn.innerHTML = volumeIcons.muted;
            muteBtn.classList.add('muted');
        } else {
            if (savedVolume !== null) {
                currentVolume = parseInt(savedVolume);
                volumeSlider.style.width = `${currentVolume}%`;  // 更新音量滑塊位置
            }
            if (savedMuted !== null) {
                isMuted = savedMuted === 'true';
                if (isMuted) {
                    muteBtn.innerHTML = volumeIcons.muted;
                    muteBtn.classList.add('muted');
                }
            }
        }

        // 套用音量設定
        players.forEach(player => {
            player.setVolume(currentVolume);
            if (isMuted) {
                player.mute();
            }
        });

        // 載入儲存的播放器數量設定
        const savedPlayerCount = localStorage.getItem('playerCount');
        if (savedPlayerCount) {
            playerCountSelect.value = savedPlayerCount;
            updatePlayerGrid(parseInt(savedPlayerCount));
        } else {
            // 如果沒有儲存的設定，儲存當前的預設值
            localStorage.setItem('playerCount', playerCountSelect.value);
        }
    }
}

// 音量圖示
const volumeIcons = {
    high: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>`,
    muted: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="muted-icon">
        <path d="M11 5L6 9H2v6h4l5 4V5z"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`
};

// 設置控制項
function setupControls() {
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeBar = document.querySelector('.volume-bar');
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressSlider = document.getElementById('progressSlider');
    const playerCountSelect = document.getElementById('playerCount');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    // 音量更新函數
    function updateVolume(volume) {
        currentVolume = Math.max(0, Math.min(100, volume));
        volumeSlider.style.width = `${currentVolume}%`;
        
        players.forEach(player => {
            player.setVolume(currentVolume);
            if (currentVolume === 0) {
                player.mute();
                muteBtn.innerHTML = volumeIcons.muted;
                isMuted = true;
            } else if (isMuted) {
                player.unMute();
                muteBtn.innerHTML = volumeIcons.high;
                isMuted = false;
            }
        });
        
        localStorage.setItem('playerVolume', currentVolume);
        localStorage.setItem('playerMuted', isMuted);
    }

    // 設置靜音按鈕
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.innerHTML = isMuted ? volumeIcons.muted : volumeIcons.high;
        players.forEach(player => {
            if (isMuted) {
                player.mute();
            } else {
                player.unMute();
                player.setVolume(currentVolume);
            }
        });
        localStorage.setItem('playerMuted', isMuted);
    });

    // 音量控制
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const volume = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        updateVolume(volume);
    });

    // 音量拖曳控制
    let isDragging = false;
    volumeBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        const rect = volumeBar.getBoundingClientRect();
        const volume = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        updateVolume(volume);
    });

    function onDrag(e) {
        if (!isDragging) return;
        const rect = volumeBar.getBoundingClientRect();
        const volume = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        updateVolume(volume);
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // 自動重新整理功能
    let autoRefreshInterval = null;
    const REFRESH_INTERVAL = 30 * 60 * 1000; // 30分鐘

    function startAutoRefresh() {
        if (autoRefreshInterval) return;
        autoRefreshBtn.classList.add('active');
        autoRefreshInterval = setInterval(() => {
            location.reload();
        }, REFRESH_INTERVAL);
        localStorage.setItem('autoRefreshEnabled', 'true');
    }

    function stopAutoRefresh() {
        if (!autoRefreshInterval) return;
        autoRefreshBtn.classList.remove('active');
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        localStorage.removeItem('autoRefreshEnabled');
    }

    // 檢查自動重新整理狀態
    if (localStorage.getItem('autoRefreshEnabled') === 'true') {
        startAutoRefresh();
    }

    autoRefreshBtn.addEventListener('click', () => {
        if (autoRefreshInterval) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    });

    // 播放器數量控制
    function updatePlayerGrid(count) {
        const container = document.querySelector('.player-container');
        const fragment = document.createDocumentFragment();
        const { observer, createPlayerContainer } = setupLazyLoading();
        
        requestAnimationFrame(() => {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            for (let i = 0; i < count; i++) {
                const playerContainer = createPlayerContainer(i);
                fragment.appendChild(playerContainer);
                observer.observe(playerContainer);
            }

            container.appendChild(fragment);

            const columns = Math.ceil(Math.sqrt(count));
            const rows = Math.ceil(count / columns);
            
            requestAnimationFrame(() => {
                container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            });
        });

        localStorage.setItem('playerCount', count);
    }

    // 更新播放狀態函數
    function updatePlayState(shouldPlay) {
        isPlaying = shouldPlay;
        playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
        players.forEach(player => {
            if (isPlaying) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        });
    }

    // 設置播放/暫停按鈕點擊事件
    playPauseBtn.addEventListener('click', () => {
        updatePlayState(!isPlaying);
    });

    // 鍵盤控制
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                updatePlayState(!isPlaying);
                break;
            case 'KeyM':
                e.preventDefault();
                muteBtn.click();
                break;
            case 'ArrowUp':
                e.preventDefault();
                updateVolume(Math.min(100, currentVolume + 5));
                break;
            case 'ArrowDown':
                e.preventDefault();
                updateVolume(Math.max(0, currentVolume - 5));
                break;
            case 'Enter':
                e.preventDefault();
                fullscreenBtn.click();
                break;
            case 'KeyA':
                e.preventDefault();
                autoRefreshBtn.click();
                break;
            case 'KeyN':
                e.preventDefault();
                playerCountSelect.focus();
                playerCountSelect.click();
                // 嘗試使用原生的 showPicker API（如果瀏覽器支援）
                if ('showPicker' in HTMLSelectElement.prototype) {
                    playerCountSelect.showPicker();
                }
                break;
            case 'KeyS':
                e.preventDefault();
                toggleAutoRefreshButton();
                break;
        }
    });

    // 全螢幕控制
    fullscreenBtn.addEventListener('click', () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // 初始化控制列狀態
    const floatingControls = document.querySelector('.floating-controls');
    floatingControls.style.opacity = '1';
    floatingControls.style.pointerEvents = 'auto';

    // 設置播放器數量變更事件
    playerCountSelect.addEventListener('change', (e) => {
        const count = parseInt(e.target.value);
        updatePlayerGrid(count);
    });

    // 載入儲存的播放器數量設定
    const savedPlayerCount = localStorage.getItem('playerCount');
    if (savedPlayerCount) {
        playerCountSelect.value = savedPlayerCount;
        updatePlayerGrid(parseInt(savedPlayerCount));
    }

    // 音量控制
    // 觸控事件處理
    let touchStartX = 0;
    let initialVolume = 0;

    volumeBar.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        initialVolume = currentVolume;
        e.preventDefault();  // 防止滾動
    });

    volumeBar.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const rect = volumeBar.getBoundingClientRect();
        const deltaX = touchX - touchStartX;
        const volumeChange = (deltaX / rect.width) * 100;
        const newVolume = Math.max(0, Math.min(100, initialVolume + volumeChange));
        updateVolume(newVolume);
        e.preventDefault();
    });

    // 音量點擊控制
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const volume = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        updateVolume(volume);
    });

    // 播放器數量控制
    // 為觸控裝置優化選單
    if ('ontouchstart' in window) {
        playerCountSelect.addEventListener('touchend', (e) => {
            e.preventDefault();
            playerCountSelect.focus();
            playerCountSelect.click();
        });
    }

    // 全螢幕控制
    // 檢測是否支援全螢幕
    const isFullscreenSupported = document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.msRequestFullscreen;

    if (!isFullscreenSupported) {
        fullscreenBtn.style.display = 'none';  // 如果不支援全螢幕就隱藏按鈕
    }

    // 雙擊切換全螢幕
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            // 雙擊切換全螢幕
            if (isFullscreenSupported) {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        }
        lastTap = currentTime;
    });

    // 自動隱藏控制列
    let controlsTimeout;
    function showControls() {
        floatingControls.style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (document.fullscreenElement) {
                floatingControls.style.opacity = '0.3';
            }
        }, 3000);
    }

    document.addEventListener('touchstart', showControls);
    floatingControls.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        showControls();
    });
}

// 切換自動重新整理按鈕顯示狀態
function toggleAutoRefreshButton() {
    const floatingControls = document.querySelector('.floating-controls');
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    
    if (autoRefreshBtn.style.display === 'none') {
        autoRefreshBtn.style.display = 'flex';
        floatingControls.classList.add('show-auto-refresh');
    } else {
        autoRefreshBtn.style.display = 'none';
        floatingControls.classList.remove('show-auto-refresh');
    }
}

// 添加 setupLazyLoading 函數（之前漏掉了）
function setupLazyLoading() {
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const playerContainer = entry.target;
                initializePlayer(playerContainer);
                observer.unobserve(playerContainer);
            }
        });
    }, options);

    function createPlayerContainer(index) {
        const container = document.createElement('div');
        container.id = `player-${index + 1}`;
        container.className = 'player';
        container.setAttribute('data-initialized', 'false');
        
        const loadingPlaceholder = document.createElement('div');
        loadingPlaceholder.className = 'player-placeholder';
        loadingPlaceholder.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">載入中...</div>
        `;
        container.appendChild(loadingPlaceholder);
        
        return container;
    }

    function initializePlayer(container) {
        if (container.getAttribute('data-initialized') === 'true') return;
        
        const player = new YT.Player(container.id, {
            videoId: 'live_stream',
            playerVars: {
                'controls': 0,
                'rel': 0,
                'modestbranding': 1,
                'channel': 'UCyYoY9S20IXXPLPrQWE5RfA',
                'autoplay': 1,
                'mute': isMuted ? 1 : 0,
                'fs': 0,
                'playsinline': 1,
                'enablejsapi': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });

        container.setAttribute('data-initialized', 'true');
    }

    return { observer, createPlayerContainer };
}

// 其餘所有 JavaScript 函數... 