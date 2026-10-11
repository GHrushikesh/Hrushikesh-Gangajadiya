/**
 * Dual-Theme Interactive Mini Music Player
 * 
 * Features:
 * - Spider-Man Comic Book theme in Light Mode
 * - Thor Thunder Asgardian Neon theme in Dark Mode
 * - 6 Tracks total (3 per theme):
 *     Light Mode:
 *       1. Post Malone, Swae Lee - Sunflower
 *       2. Phillip Phillips - Gone, Gone, Gone
 *       3. She & Him - I Thought I Saw Your Face Today
 *     Dark Mode:
 *       1. Led Zeppelin - Immigrant Song (Thor: Ragnarok)
 *       2. Brian Tyler - Asgard (The Dark World)
 *       3. Patrick Doyle - Thor Kills The Destroyer (Thor)
 * - Full controls: Play/Pause, Next/Prev, Seeker, Volume Slider, Power Off / Stop button, Track pills
 * - Smooth theme sync, Autoplay unlock, non-intrusive floating widget
 */
(function () {
    'use strict';

    var PLAYLISTS = {
        light: [
            {
                title: "Sunflower",
                artist: "Post Malone, Swae Lee",
                src: "mp3/Post Malone, Swae Lee - Sunflower (Spider-Man_ Into the Spider-Verse).mp3",
                tag: "Spider-Verse",
                badge: "🕷️ SPIDER-TUNES"
            },
            {
                title: "Gone, Gone, Gone",
                artist: "Phillip Phillips",
                src: "mp3/Phillip Phillips - Gone, Gone, Gone.mp3",
                tag: "TASM 2",
                badge: "🕷️ SPIDER-TUNES"
            },
            {
                title: "I Thought I Saw Your Face Today",
                artist: "She & Him",
                src: "mp3/She & Him - I Thought I Saw Your Face Today (Official Lyric Video).mp3",
                tag: "Classic Spidey",
                badge: "🕷️ SPIDER-TUNES"
            }
        ],
        dark: [
            {
                title: "Immigrant Song",
                artist: "Led Zeppelin",
                src: "mp3/Immigrant Song (Remaster).mp3",
                tag: "Thor: Ragnarok",
                badge: "⚡ THUNDER AUDIO"
            },
            {
                title: "Asgard",
                artist: "Brian Tyler",
                src: "mp3/Asgard (From Thor_ The Dark WorldScore).mp3",
                tag: "The Dark World",
                badge: "⚡ THUNDER AUDIO"
            },
            {
                title: "Thor Kills The Destroyer",
                artist: "Patrick Doyle",
                src: "mp3/thor kills the destroyer.mp3",
                tag: "Thor (2011)",
                badge: "⚡ THUNDER AUDIO"
            }
        ]
    };

    var state = {
        theme: getActiveTheme(),
        trackIndex: 0,
        volume: 0.40,
        isMuted: false,
        isPlaying: false,
        isPowerOff: false,
        isPlayerVisible: false,
        hasUserInteracted: false
    };

    var audio = new Audio();
    audio.preload = 'metadata';

    function getActiveTheme() {
        return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function initSavedState() {
        try {
            var savedVol = localStorage.getItem('portfolio_music_vol');
            if (savedVol !== null) {
                var v = parseFloat(savedVol);
                if (!isNaN(v)) state.volume = Math.max(0, Math.min(1, v));
            }
            var savedPower = localStorage.getItem('portfolio_music_power');
            if (savedPower === 'off') {
                state.isPowerOff = true;
            }
        } catch (e) {}
    }

    function formatTime(sec) {
        if (!sec || isNaN(sec)) return "0:00";
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

    function getCurrentTrack() {
        var list = PLAYLISTS[state.theme] || PLAYLISTS.light;
        var idx = Math.max(0, Math.min(list.length - 1, state.trackIndex));
        return list[idx];
    }

    function loadTrack(autoplay) {
        var track = getCurrentTrack();
        if (!track) return;

        var wasPlaying = autoplay || (state.isPlaying && !state.isPowerOff);
        audio.src = track.src;
        audio.volume = state.isMuted ? 0 : state.volume;

        updatePlayerUI();

        if (wasPlaying && !state.isPowerOff) {
            var p = audio.play();
            if (p !== undefined) {
                p.then(function () {
                    state.isPlaying = true;
                    updatePlayerUI();
                }).catch(function () {
                    state.isPlaying = false;
                    updatePlayerUI();
                    setupInteractionUnlock();
                });
            }
        } else {
            state.isPlaying = false;
            updatePlayerUI();
        }
    }

    function play() {
        state.isPowerOff = false;
        try { localStorage.setItem('portfolio_music_power', 'on'); } catch (e) {}

        audio.volume = state.isMuted ? 0 : state.volume;
        var p = audio.play();
        if (p !== undefined) {
            p.then(function () {
                state.isPlaying = true;
                updatePlayerUI();
            }).catch(function () {
                state.isPlaying = false;
                updatePlayerUI();
                setupInteractionUnlock();
            });
        }
    }

    function pause() {
        audio.pause();
        state.isPlaying = false;
        updatePlayerUI();
    }

    function turnOff() {
        audio.pause();
        audio.currentTime = 0;
        state.isPlaying = false;
        state.isPowerOff = true;
        try { localStorage.setItem('portfolio_music_power', 'off'); } catch (e) {}
        updatePlayerUI();
    }

    function togglePlayPause() {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    }

    function prevTrack() {
        var list = PLAYLISTS[state.theme];
        state.trackIndex = (state.trackIndex - 1 + list.length) % list.length;
        loadTrack(state.isPlaying || !state.isPowerOff);
    }

    function nextTrack() {
        var list = PLAYLISTS[state.theme];
        state.trackIndex = (state.trackIndex + 1) % list.length;
        loadTrack(state.isPlaying || !state.isPowerOff);
    }

    function setVolume(vol) {
        state.volume = Math.max(0, Math.min(1, vol));
        state.isMuted = state.volume === 0;
        audio.volume = state.isMuted ? 0 : state.volume;
        try { localStorage.setItem('portfolio_music_vol', state.volume.toFixed(2)); } catch (e) {}
        updatePlayerUI();
    }

    function toggleMute() {
        state.isMuted = !state.isMuted;
        audio.volume = state.isMuted ? 0 : state.volume;
        updatePlayerUI();
    }

    function setTrackIndex(idx) {
        var list = PLAYLISTS[state.theme];
        if (idx >= 0 && idx < list.length) {
            state.trackIndex = idx;
            loadTrack(true);
        }
    }

    function togglePlayerVisibility(forceState) {
        if (typeof forceState === 'boolean') {
            state.isPlayerVisible = forceState;
        } else {
            state.isPlayerVisible = !state.isPlayerVisible;
        }

        var playerEl = document.getElementById('portfolio-music-player');
        if (playerEl) {
            if (state.isPlayerVisible) {
                playerEl.classList.remove('is-hidden');
                playerEl.classList.add('is-visible');
            } else {
                playerEl.classList.remove('is-visible');
                playerEl.classList.add('is-hidden');
            }
        }
    }

    // ── Build DOM Elements ──
    function createPlayerDOM() {
        if (document.getElementById('portfolio-music-player')) return;

        var player = document.createElement('div');
        player.id = 'portfolio-music-player';
        player.className = 'portfolio_music_player is-hidden';

        player.innerHTML = [
            '<div class="pmp_header">',
            '  <div class="pmp_badge">',
            '    <span class="pmp_badge_icon">🕷️</span>',
            '    <span class="pmp_badge_text">SPIDER-TUNES</span>',
            '  </div>',
            '  <div class="pmp_header_actions">',
            '    <button type="button" class="pmp_btn_action pmp_btn_minimize" title="Hide Player" aria-label="Hide Player">',
            '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
            '    </button>',
            '  </div>',
            '</div>',
            '<div class="pmp_body">',
            '  <div class="pmp_disc_wrap">',
            '    <div class="pmp_disc">',
            '      <div class="pmp_disc_art"></div>',
            '      <div class="pmp_disc_center"></div>',
            '    </div>',
            '    <div class="pmp_waves">',
            '      <span class="pmp_wave_bar pmp_wave_bar--1"></span>',
            '      <span class="pmp_wave_bar pmp_wave_bar--2"></span>',
            '      <span class="pmp_wave_bar pmp_wave_bar--3"></span>',
            '      <span class="pmp_wave_bar pmp_wave_bar--4"></span>',
            '    </div>',
            '  </div>',
            '  <div class="pmp_meta">',
            '    <div class="pmp_track_tag">Spider-Verse</div>',
            '    <div class="pmp_title_marquee"><span class="pmp_title">Sunflower</span></div>',
            '    <div class="pmp_artist">Post Malone, Swae Lee</div>',
            '  </div>',
            '</div>',
            '<div class="pmp_seeker_area">',
            '  <div class="pmp_timeline_wrap" id="pmp-timeline">',
            '    <div class="pmp_timeline_bar">',
            '      <div class="pmp_timeline_fill" id="pmp-timeline-fill"></div>',
            '    </div>',
            '  </div>',
            '  <div class="pmp_timestamps">',
            '    <span class="pmp_time_current" id="pmp-time-cur">0:00</span>',
            '    <span class="pmp_time_duration" id="pmp-time-dur">0:00</span>',
            '  </div>',
            '</div>',
            '<div class="pmp_controls">',
            '  <button type="button" class="pmp_btn pmp_btn_prev" id="pmp-btn-prev" title="Previous Track" aria-label="Previous track">',
            '    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line></svg>',
            '  </button>',
            '  <button type="button" class="pmp_btn pmp_btn_play_pause" id="pmp-btn-play" title="Play or Pause" aria-label="Play or pause">',
            '    <svg class="pmp_icon_play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
            '    <svg class="pmp_icon_pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>',
            '  </button>',
            '  <button type="button" class="pmp_btn pmp_btn_next" id="pmp-btn-next" title="Next Track" aria-label="Next track">',
            '    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line></svg>',
            '  </button>',
            '  <button type="button" class="pmp_btn pmp_btn_power" id="pmp-btn-power" title="Turn Off Song" aria-label="Turn off song completely">',
            '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
            '      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>',
            '      <line x1="12" y1="2" x2="12" y2="12"></line>',
            '    </svg>',
            '    <span class="pmp_power_text">STOP</span>',
            '  </button>',
            '</div>',
            '<div class="pmp_volume_row">',
            '  <button type="button" class="pmp_vol_btn" id="pmp-btn-vol" title="Mute or Unmute" aria-label="Mute or Unmute">',
            '    <svg class="pmp_vol_icon_high" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
            '    <svg class="pmp_vol_icon_muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>',
            '  </button>',
            '  <input type="range" class="pmp_volume_slider" id="pmp-vol-slider" min="0" max="100" value="40" aria-label="Volume slider">',
            '  <span class="pmp_volume_num" id="pmp-vol-num">40%</span>',
            '</div>',
            '<div class="pmp_playlist_row" id="pmp-playlist-tabs">',
            '  <button type="button" class="pmp_song_pill is-active" data-index="0">1. Sunflower</button>',
            '  <button type="button" class="pmp_song_pill" data-index="1">2. Gone, Gone</button>',
            '  <button type="button" class="pmp_song_pill" data-index="2">3. She & Him</button>',
            '</div>'
        ].join('');

        document.body.appendChild(player);

        // Bind internal player events
        var btnMinimize = player.querySelector('.pmp_btn_minimize');
        if (btnMinimize) {
            btnMinimize.addEventListener('click', function (e) {
                e.stopPropagation();
                togglePlayerVisibility(false);
            });
        }

        var btnPlay = document.getElementById('pmp-btn-play');
        if (btnPlay) {
            btnPlay.addEventListener('click', function (e) {
                e.stopPropagation();
                togglePlayPause();
            });
        }

        var btnPrev = document.getElementById('pmp-btn-prev');
        if (btnPrev) {
            btnPrev.addEventListener('click', function (e) {
                e.stopPropagation();
                prevTrack();
            });
        }

        var btnNext = document.getElementById('pmp-btn-next');
        if (btnNext) {
            btnNext.addEventListener('click', function (e) {
                e.stopPropagation();
                nextTrack();
            });
        }

        var btnPower = document.getElementById('pmp-btn-power');
        if (btnPower) {
            btnPower.addEventListener('click', function (e) {
                e.stopPropagation();
                turnOff();
            });
        }

        var btnVol = document.getElementById('pmp-btn-vol');
        if (btnVol) {
            btnVol.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleMute();
            });
        }

        var sliderVol = document.getElementById('pmp-vol-slider');
        if (sliderVol) {
            sliderVol.addEventListener('input', function (e) {
                setVolume(parseInt(e.target.value, 10) / 100);
            });
        }

        var timelineWrap = document.getElementById('pmp-timeline');
        if (timelineWrap) {
            timelineWrap.addEventListener('click', function (e) {
                if (!audio.duration) return;
                var rect = timelineWrap.getBoundingClientRect();
                var clickPos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = clickPos * audio.duration;
            });
        }

        var playlistTabs = document.getElementById('pmp-playlist-tabs');
        if (playlistTabs) {
            playlistTabs.addEventListener('click', function (e) {
                var pill = e.target.closest('.pmp_song_pill');
                if (pill) {
                    var idx = parseInt(pill.getAttribute('data-index'), 10);
                    if (!isNaN(idx)) {
                        setTrackIndex(idx);
                    }
                }
            });
        }
    }

    // ── Update Full Player UI ──
    function updatePlayerUI() {
        var isLight = state.theme === 'light';
        var list = PLAYLISTS[state.theme] || PLAYLISTS.light;
        var track = getCurrentTrack();
        var playerEl = document.getElementById('portfolio-music-player');
        var toggleBtn = document.getElementById('js-music_toggle');

        if (!playerEl || !track) return;

        // Theme Classes
        if (isLight) {
            playerEl.classList.add('theme-spiderman');
            playerEl.classList.remove('theme-thor');
        } else {
            playerEl.classList.add('theme-thor');
            playerEl.classList.remove('theme-spiderman');
        }

        // Playing State
        if (state.isPlaying && !state.isPowerOff) {
            playerEl.classList.add('is-playing');
            playerEl.classList.remove('is-paused', 'is-off');
            if (toggleBtn) {
                toggleBtn.classList.add('is-playing');
                toggleBtn.classList.remove('is-muted');
                toggleBtn.setAttribute('aria-label', 'Open music player');
            }
        } else {
            playerEl.classList.remove('is-playing');
            if (state.isPowerOff) {
                playerEl.classList.add('is-off');
                playerEl.classList.remove('is-paused');
            } else {
                playerEl.classList.add('is-paused');
                playerEl.classList.remove('is-off');
            }
            if (toggleBtn) {
                toggleBtn.classList.remove('is-playing');
                toggleBtn.classList.add('is-muted');
                toggleBtn.setAttribute('aria-label', 'Open music player');
            }
        }

        // Header Badge
        var badgeIcon = playerEl.querySelector('.pmp_badge_icon');
        var badgeText = playerEl.querySelector('.pmp_badge_text');
        if (badgeIcon && badgeText) {
            badgeIcon.textContent = isLight ? '🕷️' : '⚡';
            badgeText.textContent = isLight ? 'SPIDER-TUNES' : 'THUNDER AUDIO';
        }

        // Track Meta
        var tagEl = playerEl.querySelector('.pmp_track_tag');
        var titleEl = playerEl.querySelector('.pmp_title');
        var artistEl = playerEl.querySelector('.pmp_artist');
        if (tagEl) tagEl.textContent = track.tag;
        if (titleEl) titleEl.textContent = track.title;
        if (artistEl) artistEl.textContent = track.artist;

        // Volume UI
        var sliderVol = document.getElementById('pmp-vol-slider');
        var numVol = document.getElementById('pmp-vol-num');
        var btnVol = document.getElementById('pmp-btn-vol');
        var volPercent = Math.round((state.isMuted ? 0 : state.volume) * 100);
        if (sliderVol) sliderVol.value = volPercent;
        if (numVol) numVol.textContent = volPercent + '%';
        if (btnVol) {
            if (state.isMuted || state.volume === 0) {
                btnVol.classList.add('is-muted');
            } else {
                btnVol.classList.remove('is-muted');
            }
        }

        // Playlist Pills
        var pills = playerEl.querySelectorAll('.pmp_song_pill');
        pills.forEach(function (pill, idx) {
            if (list[idx]) {
                pill.textContent = (idx + 1) + '. ' + list[idx].title;
                pill.style.display = 'inline-block';
                if (idx === state.trackIndex) {
                    pill.classList.add('is-active');
                } else {
                    pill.classList.remove('is-active');
                }
            } else {
                pill.style.display = 'none';
            }
        });
    }

    // ── Audio Native Event Listeners ──
    audio.addEventListener('timeupdate', function () {
        var fill = document.getElementById('pmp-timeline-fill');
        var curTime = document.getElementById('pmp-time-cur');
        var durTime = document.getElementById('pmp-time-dur');

        if (fill && audio.duration) {
            var percent = (audio.currentTime / audio.duration) * 100;
            fill.style.width = percent + '%';
        }
        if (curTime) curTime.textContent = formatTime(audio.currentTime);
        if (durTime && audio.duration) durTime.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('loadedmetadata', function () {
        var durTime = document.getElementById('pmp-time-dur');
        if (durTime && audio.duration) durTime.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', function () {
        nextTrack();
    });

    audio.addEventListener('play', function () {
        state.isPlaying = true;
        updatePlayerUI();
    });

    audio.addEventListener('pause', function () {
        state.isPlaying = false;
        updatePlayerUI();
    });

    // ── Header Toggle Button Handler ──
    function bindHeaderMusicButton() {
        var btn = document.getElementById('js-music_toggle');
        if (!btn) return;

        btn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            state.hasUserInteracted = true;

            // Toggle player visibility
            togglePlayerVisibility();

            // If it was powered off, auto-play when user opens player
            if (state.isPlayerVisible && (state.isPowerOff || !state.isPlaying)) {
                play();
            }
        };
    }

    // ── Autoplay Policy Interaction Unlock ──
    function setupInteractionUnlock() {
        if (state.hasUserInteracted) return;

        function unlock() {
            if (state.hasUserInteracted) return;
            state.hasUserInteracted = true;

            ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(function (ev) {
                window.removeEventListener(ev, unlock, true);
            });

            if (!state.isPowerOff) {
                play();
            }
        }

        ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(function (ev) {
            window.addEventListener(ev, unlock, { once: true, capture: true, passive: true });
        });
    }

    // ── Theme Switch Synchronizer ──
    window.addEventListener('themechange', function (e) {
        var newTheme = (e && e.detail && e.detail.theme) || getActiveTheme();
        if (state.theme === newTheme) return;

        state.theme = newTheme;
        state.trackIndex = 0; // Start first track of new theme playlist
        loadTrack(state.isPlaying && !state.isPowerOff);
    });

    // ── Bootstrapping ──
    function init() {
        state.theme = getActiveTheme();
        initSavedState();
        createPlayerDOM();
        bindHeaderMusicButton();

        loadTrack(false);

        if (!state.isPowerOff) {
            setupInteractionUnlock();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global API
    window.PortfolioMusic = {
        play: play,
        pause: pause,
        turnOff: turnOff,
        toggle: togglePlayPause,
        next: nextTrack,
        prev: prevTrack,
        togglePlayer: togglePlayerVisibility,
        setVolume: setVolume,
        getState: function () {
            return {
                theme: state.theme,
                track: getCurrentTrack(),
                isPlaying: state.isPlaying,
                isPowerOff: state.isPowerOff,
                volume: state.volume
            };
        }
    };
})();
