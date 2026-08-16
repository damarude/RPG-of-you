
import { MUSIC_URLS } from './contentService';

class AudioService {
  private context: 'MENU' | 'BATTLE' = 'MENU';
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private currentTrackUrl: string | null = null;
  
  private menuPlaylist: string[] = [];
  private battlePlaylist: string[] = [];

  constructor() {
    // Initialize with base tracks
    this.menuPlaylist = [...MUSIC_URLS.base];
    this.battlePlaylist = [...MUSIC_URLS.base];

    // PRE-SET Track URL to avoid "No Track" state on startup
    if (this.menuPlaylist.length > 0) {
        this.currentTrackUrl = this.menuPlaylist[0];
    }

    if (typeof window !== 'undefined') {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.volume;
      
      // PRE-LOAD src if available
      if (this.currentTrackUrl) {
          this.bgmAudio.src = this.currentTrackUrl;
      }
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  public updatePlaylists(menuTracks: string[], battleTracks: string[]) {
    this.menuPlaylist = menuTracks;
    this.battlePlaylist = battleTracks;
    // If no track is currently set (rare), set it now
    if (!this.currentTrackUrl && this.menuPlaylist.length > 0) {
        this.currentTrackUrl = this.menuPlaylist[0];
        if (this.bgmAudio) this.bgmAudio.src = this.currentTrackUrl;
    }
  }

  public setContext(context: 'MENU' | 'BATTLE') {
    this.context = context;
  }

  public getCurrentContext() {
    return this.context;
  }

  public setMasterMute(muted: boolean) {
    this.isMuted = muted;
    // Do not mute bgmAudio here, as this is intended for non-music sounds only
  }
  
  public setMusicEnabled(enabled: boolean) {
      if (!this.bgmAudio) return;
      if (enabled) {
          if (this.bgmAudio.paused) {
              this.startBGM();
          }
      } else {
          this.bgmAudio.pause();
      }
  }
  
  public setEnabled(soundEnabled: boolean) {
      if (!this.audioCtx) return;
      if (!soundEnabled) {
          this.audioCtx.suspend();
      } else {
          this.audioCtx.resume();
      }
  }

  public getVolume() {
    return this.volume;
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.volume;
    }
  }

  public startBGM() {
    if (this.bgmAudio && this.bgmAudio.paused) {
      // Logic update: Ensure we have a src if one isn't set or if it's somehow reset
      if (!this.bgmAudio.src || this.bgmAudio.src === window.location.href) {
          const tracks = this.context === 'MENU' ? this.menuPlaylist : this.battlePlaylist;
          if (tracks.length > 0) {
              this.currentTrackUrl = tracks[0];
              this.bgmAudio.src = tracks[0];
          }
      }
      
      // Handle Autoplay Policy Robustly
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
          playPromise.catch(error => {
              // Auto-play was prevented. This is normal on mobile/first load.
              // The Global Click Listener in App.tsx will handle the actual start.
              console.warn("Audio autoplay blocked by browser policy. Interaction required.", error);
          });
      }
    }
  }

  public suspend() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }
  
  public skip() {
      const tracks = this.context === 'MENU' ? this.menuPlaylist : this.battlePlaylist;
      if (tracks.length === 0) return;
      
      let nextIndex = 0;
      // Note: Comparing urls might need decoding if browser encodes them differently, but simple check usually works or defaults to 0
      const currentUrl = this.currentTrackUrl;
      const currentIndex = tracks.findIndex(t => t === currentUrl);
      
      if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
          nextIndex = currentIndex + 1;
      } else {
          nextIndex = 0;
      }
      
      this.playSpecificTrack(tracks[nextIndex]);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0, vol: number = 0.1) {
    if (this.isMuted || !this.audioCtx || this.audioCtx.state === 'suspended') return;
    try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, this.audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + delay);
        osc.stop(this.audioCtx.currentTime + delay + duration);
    } catch (e) {
        console.error("Audio Context Error", e);
    }
  }

  public playStart() {
    this.playTone(400, 'sine', 0.1, 0, 0.1);
    this.playTone(600, 'sine', 0.4, 0.1, 0.1);
  }

  public playSuccess() {
    this.playTone(600, 'sine', 0.1, 0, 0.1);
    this.playTone(800, 'sine', 0.2, 0.1, 0.1);
  }

  public playLevelUp() {
      this.playTone(400, 'square', 0.1, 0, 0.1);
      this.playTone(500, 'square', 0.1, 0.1, 0.1);
      this.playTone(600, 'square', 0.1, 0.2, 0.1);
      this.playTone(800, 'square', 0.3, 0.3, 0.1);
  }
  
  public playPurchase() {
      this.playTone(1200, 'sine', 0.1, 0, 0.1);
      this.playTone(2000, 'sine', 0.2, 0.1, 0.1);
  }
  
  public playEquip() {
      this.playTone(200, 'sawtooth', 0.1, 0, 0.1);
  }
  
  public playSelect() {
      this.playTone(600, 'triangle', 0.05, 0, 0.05);
  }

  public playError() {
    this.playTone(150, 'sawtooth', 0.3, 0, 0.1);
  }

  public playClick() {
    this.playTone(800, 'sine', 0.05, 0, 0.05);
  }

  public playCombatHit() {
    this.playTone(100, 'square', 0.1, 0, 0.1);
  }

  public getCurrentTrackName(url?: string): string {
    const target = url || this.currentTrackUrl;
    if (!target) return "No Track";
    return target.split('/').pop()?.replace(/%20/g, ' ').replace('.mp3', '') || "Unknown Track";
  }

  public getCurrentTrackUrl() {
    return this.currentTrackUrl || "";
  }

  public getMenuTracks() {
    return this.menuPlaylist;
  }

  public getBattleTracks() {
    return this.battlePlaylist;
  }

  public playSpecificTrack(url: string) {
    if (!this.bgmAudio) return;
    this.currentTrackUrl = url;
    this.bgmAudio.src = url;
    this.startBGM();
  }

  public setPlaylistAndPlay(type: 'MENU' | 'BATTLE', random: boolean = false) {
    this.setContext(type);
    const tracks = type === 'MENU' ? this.getMenuTracks() : this.getBattleTracks();
    if (tracks.length > 0) {
        if (random) {
            const randomIndex = Math.floor(Math.random() * tracks.length);
            this.playSpecificTrack(tracks[randomIndex]);
        } else {
            this.playSpecificTrack(tracks[0]);
        }
    }
  }
}

export const audio = new AudioService();
