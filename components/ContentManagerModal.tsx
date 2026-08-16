
import React, { useState, useEffect, useMemo } from 'react';
import { X, Download, CheckCircle2, AlertCircle, Database, FileText, Loader2, Wifi, WifiOff, MessageSquare, Swords, ShoppingBag, Trash2, RefreshCw, Ban, Layers, Music, Shield, ChevronRight, Image } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { PHRASE_URLS, fetchPhrases, fetchContentSize, MUSIC_URLS } from '../services/contentService';
import { EQUIPMENT_DATA_URL, CONSUMABLES_DATA_URL } from '../gameData';
import { fetchChallengeFileSize, fetchChallengeData } from '../services/challengeService';
import { fetchEquipmentData, fetchConsumablesData } from '../services/itemService';
import { PhrasePack, Proficiency, Item, QuizQuestion, ChallengeMetadata, UserSettings, ConsumableItem } from '../types';

interface ContentManagerModalProps {
  currentPhrases: PhrasePack;
  proficiencies: Proficiency[];
  shopItems: Item[];
  consumablesData?: ConsumableItem[];
  challengeIndex: ChallengeMetadata[];
  challengeLastUpdated: number;
  downloadedChallenges: Record<string, QuizQuestion[]>; 
  installedMusicPacks?: string[]; // New
  installedNpcImages?: boolean;
  installedEnemyImages?: boolean;
  installedConsumableImages?: boolean;
  detailedEnemies: any[];
  onUpdatePhrases: (newPhrases: Partial<PhrasePack>) => void;
  onUpdateSkillData: (skillName: string, data: QuizQuestion[] | null, category?: string) => void;
  onUpdateShop: (items: Item[]) => void;
  onUpdateConsumables?: (data: ConsumableItem[]) => void;
  onUpdateMusic: (packId: string) => void; // New
  onUpdateNpcImages: () => void;
  onUpdateEnemyImages: () => void;
  onUpdateConsumableImages: () => void;
  onRefreshChallenges: () => void;
  onUpdateEnemies: (data: any[] | null) => void;
  onClose: () => void;
}

type TabType = 'phrases' | 'challenges' | 'items' | 'music' | 'enemies' | 'assets';

import localforage from 'localforage';
import { QuotesModal } from './QuotesModal';

export const ContentManagerModal: React.FC<ContentManagerModalProps> = ({ 
    currentPhrases, proficiencies, shopItems, consumablesData = [], challengeIndex, challengeLastUpdated, downloadedChallenges, installedMusicPacks = [], installedNpcImages = false, installedEnemyImages = false, installedConsumableImages = false, detailedEnemies,
    onUpdatePhrases, onUpdateSkillData, onUpdateShop, onUpdateConsumables, onUpdateMusic, onUpdateNpcImages, onUpdateEnemyImages, onUpdateConsumableImages, onRefreshChallenges, onUpdateEnemies, onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('phrases');
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [fileSizes, setFileSizes] = useState<Record<string, number | null>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [showQuotesModal, setShowQuotesModal] = useState(false);

  // Checkbox State for Startup
  const [hideOnStartup, setHideOnStartup] = useState(false);

  useEffect(() => {
    const loadHideOnStartup = async () => {
      try {
        const saved = await localforage.getItem<any>('rpg_tracker_state');
        if (saved && saved.user?.settings) {
          setHideOnStartup(saved.user.settings.hideContentManagerOnStartup || false);
        } else {
          const localSaved = localStorage.getItem('rpg_tracker_state');
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            setHideOnStartup(parsed.user?.settings?.hideContentManagerOnStartup || false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadHideOnStartup();
  }, []);

  const toggleHideOnStartup = async () => {
      const newValue = !hideOnStartup;
      setHideOnStartup(newValue);
      
      try {
        const saved = await localforage.getItem<any>('rpg_tracker_state');
        if (saved && saved.user && saved.user.settings) {
            saved.user.settings.hideContentManagerOnStartup = newValue;
            await localforage.setItem('rpg_tracker_state', saved);
        }
      } catch (e) {
        console.error(e);
      }
  };

  // Group challenges by category
  const categories = useMemo(() => {
      const grouped: Record<string, ChallengeMetadata[]> = {};
      challengeIndex.forEach(meta => {
          if (meta.skill === 'Fry Pan Meister') return;
          if (meta.category === 'Custom') return;

          if (!grouped[meta.category]) grouped[meta.category] = [];
          grouped[meta.category].push(meta);
      });
      return grouped;
  }, [challengeIndex]);

  useEffect(() => {
      const init = async () => {
          setIsChecking(true);
          setIsOnline(navigator.onLine);
          if (navigator.onLine) {
              const sizes: Record<string, number | null> = {};
              
              const promises: Promise<void>[] = [];

              // Phrases Sizes
              for (const key of Object.keys(PHRASE_URLS)) {
                  // @ts-ignore
                  const url = PHRASE_URLS[key];
                  promises.push(fetchContentSize(url).then(size => { sizes[`phrase_${key}`] = size; }));
              }

              // Challenge Sizes
              for (const meta of challengeIndex) {
                  if (meta.skill === 'Fry Pan Meister' || meta.category === 'Custom') continue;
                  promises.push(fetchChallengeFileSize(meta.url).then(size => { sizes[`challenge_${meta.skill}`] = size; }));
              }

              // Item Size
              promises.push(fetchContentSize(EQUIPMENT_DATA_URL).then(size => { sizes['items_catalog'] = size; }));
              promises.push(fetchContentSize(CONSUMABLES_DATA_URL).then(size => { sizes['consumables_catalog'] = size; }));

              // Enemies Size
              const ENEMY_URLS = [
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/DragonStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/GoblinStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/OrcStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/PocongStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/SkeletonStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/SlimeStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/UroborosStat.txt'
              ];
              promises.push(Promise.all(ENEMY_URLS.map(url => fetchContentSize(url))).then(enemySizes => {
                  const totalSize = enemySizes.reduce((acc, size) => (acc || 0) + (size || 0), 0);
                  sizes['enemies'] = totalSize;
              }));

              await Promise.all(promises);
              setFileSizes(sizes);
          }
          setIsChecking(false);
      };
      
      if (challengeIndex.length > 0 || activeTab !== 'challenges') {
          init();
      } else {
          setIsChecking(false);
      }

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, [challengeIndex]);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      setIsChecking(true);
      await onRefreshChallenges();
      setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDownloadAll = async () => {
      if (!isOnline) return;
      setIsDownloadingAll(true);
      let errorsOccurred = false;
      
      try {
          // 1. Download Phrases
          for (const key of Object.keys(PHRASE_URLS)) {
             setLoadingState(prev => ({ ...prev, [`phrase_${key}`]: true }));
             try {
                 // @ts-ignore
                 const url = PHRASE_URLS[key];
                 const phrases = await fetchPhrases(url);
                 // @ts-ignore
                 onUpdatePhrases({ [key]: phrases });
             } catch (e) {
                 console.error(`Failed phrases: ${key}`, e);
                 errorsOccurred = true;
             }
             setLoadingState(prev => ({ ...prev, [`phrase_${key}`]: false }));
          }

          // 2. Download Items
          setLoadingState(prev => ({ ...prev, items_catalog: true, consumables_catalog: true }));
          try {
              const items = await fetchEquipmentData(EQUIPMENT_DATA_URL);
              onUpdateShop(items);
          } catch (e) {
              console.error("Failed shop items", e);
              errorsOccurred = true;
          }
          try {
              if (onUpdateConsumables) {
                  const consumables = await fetchConsumablesData(CONSUMABLES_DATA_URL);
                  onUpdateConsumables(consumables);
              }
          } catch (e) {
              console.error("Failed consumables items", e);
              errorsOccurred = true;
          }
          setLoadingState(prev => ({ ...prev, items_catalog: false, consumables_catalog: false }));

          // 3. Download Challenges
          for (const meta of challengeIndex) {
               if (meta.skill === 'Fry Pan Meister' || meta.category === 'Custom') continue;
               setLoadingState(prev => ({ ...prev, [`challenge_${meta.skill}`]: true }));
               try {
                   const questions = await fetchChallengeData(meta.url, meta.skill, meta.category);
                   onUpdateSkillData(meta.skill, questions, meta.category);
               } catch (e) {
                   console.error(`Failed challenge: ${meta.skill}`, e);
                   errorsOccurred = true;
               }
               setLoadingState(prev => ({ ...prev, [`challenge_${meta.skill}`]: false }));
          }

          // 4. Download Music Packs
          const musicPacks = ['menu_pack', 'battle_pack'];
          for (const packId of musicPacks) {
              if (!installedMusicPacks.includes(packId)) {
                  setLoadingState(prev => ({ ...prev, [`music_${packId}`]: true }));
                  onUpdateMusic(packId);
                  setLoadingState(prev => ({ ...prev, [`music_${packId}`]: false }));
              }
          }

          // 5. Download Enemies
          setLoadingState(prev => ({ ...prev, 'enemies': true }));
          try {
              const urls = [
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/DragonStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/GoblinStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/OrcStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/PocongStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/SkeletonStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/SlimeStat.txt',
                  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/UroborosStat.txt'
              ];
              const responses = await Promise.all(urls.map(url => fetch(url)));
              const texts = await Promise.all(responses.map(r => r.text()));
              const { parseEnemyData } = await import('../services/enemyParser');
              let allEnemies: any[] = [];
              texts.forEach(text => {
                  allEnemies = [...allEnemies, ...parseEnemyData(text)];
              });
              onUpdateEnemies(allEnemies);
          } catch (e) {
              console.error("Failed enemies", e);
              errorsOccurred = true;
          }
          setLoadingState(prev => ({ ...prev, 'enemies': false }));

      } catch (e) {
          console.error("Critical batch error", e);
      } finally {
          setIsDownloadingAll(false);
      }
  };

  const handleDownloadPhrase = async (e: React.MouseEvent, key: string) => {
      e.stopPropagation();
      if (!isOnline) return;
      
      setLoadingState(prev => ({ ...prev, [`phrase_${key}`]: true }));
      try {
          // @ts-ignore
          const url = PHRASE_URLS[key];
          if (url) {
              const phrases = await fetchPhrases(url);
              // @ts-ignore
              onUpdatePhrases({ [key]: phrases });
          }
      } catch (err) {
          console.error(`Failed to download phrases for ${key}`, err);
      } finally {
          setLoadingState(prev => ({ ...prev, [`phrase_${key}`]: false }));
      }
  };

  const handleDownloadChallenge = async (e: React.MouseEvent, meta: ChallengeMetadata) => {
      e.stopPropagation();
      if (!isOnline) return;
      
      setLoadingState(prev => ({ ...prev, [`challenge_${meta.skill}`]: true }));
      try {
          const questions = await fetchChallengeData(meta.url, meta.skill, meta.category);
          onUpdateSkillData(meta.skill, questions, meta.category);
      } catch (err) {
          console.error(`Failed to download challenge for ${meta.skill}`, err);
      } finally {
          setLoadingState(prev => ({ ...prev, [`challenge_${meta.skill}`]: false }));
      }
  };

  const handleDownloadItems = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOnline) return;

      setLoadingState(prev => ({ ...prev, items_catalog: true }));
      try {
          const items = await fetchEquipmentData(EQUIPMENT_DATA_URL);
          onUpdateShop(items);
      } catch (err) {
          console.error("Failed to download shop items", err);
      } finally {
          setLoadingState(prev => ({ ...prev, items_catalog: false }));
      }
  };

  const handleDownloadConsumables = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isOnline || !onUpdateConsumables) return;

      setLoadingState(prev => ({ ...prev, consumables_catalog: true }));
      try {
          const items = await fetchConsumablesData(CONSUMABLES_DATA_URL);
          onUpdateConsumables(items);
      } catch (err) {
          console.error("Failed to download consumable items", err);
      } finally {
          setLoadingState(prev => ({ ...prev, consumables_catalog: false }));
      }
  };

  const handleDownloadMusic = async (e: React.MouseEvent, packId: string) => {
      e.stopPropagation();
      // For music, we just register the IDs as "installed" since browser caches the URLs upon access.
      // We simulate a small load time for feedback.
      setLoadingState(prev => ({ ...prev, [`music_${packId}`]: true }));
      setTimeout(() => {
          onUpdateMusic(packId);
          setLoadingState(prev => ({ ...prev, [`music_${packId}`]: false }));
      }, 800);
  };

  const handleDownloadNpcImages = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setLoadingState(prev => ({ ...prev, 'npcImages': true }));
      setTimeout(() => {
          onUpdateNpcImages();
          setLoadingState(prev => ({ ...prev, 'npcImages': false }));
      }, 800);
  };

  const handleDownloadEnemyImages = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setLoadingState(prev => ({ ...prev, 'enemyImages': true }));
      setTimeout(() => {
          onUpdateEnemyImages();
          setLoadingState(prev => ({ ...prev, 'enemyImages': false }));
      }, 800);
  };

  const handleDownloadConsumableImages = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setLoadingState(prev => ({ ...prev, 'consumableImages': true }));
      setTimeout(() => {
          onUpdateConsumableImages();
          setLoadingState(prev => ({ ...prev, 'consumableImages': false }));
      }, 800);
  };

  const handleDownloadEnemies = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setLoadingState(prev => ({ ...prev, 'enemies': true }));
      try {
          const urls = [
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/DragonStat.txt',
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/GoblinStat.txt',
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/OrcStat.txt',
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/PocongStat.txt',
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/SkeletonStat.txt',
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/SlimeStat.txt',
              'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyStats/UroborosStat.txt'
          ];
          
          const responses = await Promise.all(urls.map(url => fetch(url)));
          const texts = await Promise.all(responses.map(r => r.text()));
          
          const { parseEnemyData } = await import('../services/enemyParser');
          let allEnemies: any[] = [];
          texts.forEach(text => {
              allEnemies = [...allEnemies, ...parseEnemyData(text)];
          });
          
          onUpdateEnemies(allEnemies);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingState(prev => ({ ...prev, 'enemies': false }));
      }
  };

  const formatBytes = (bytes: number | null) => {
      if (bytes === null) return 'N/A';
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // --- Renderers ---

  const renderPhraseTab = () => (
      <motion.div 
          className="space-y-3"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
      >
          <div className="flex justify-end mb-2">
              <button 
                  onClick={() => setShowQuotesModal(true)}
                  className="px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 hover:text-purple-300 rounded-lg text-xs font-bold transition-colors border border-purple-500/30 flex items-center gap-2"
              >
                  <MessageSquare size={14} /> View Quote Library
              </button>
          </div>
          {[
              { key: 'screensaver', label: 'Motivational Phrases', desc: 'Screensaver & Notifications.' },
              { key: 'enemies', label: 'Enemy Taunts', desc: 'Insults from enemies.' },
              { key: 'character', label: 'Inner Thoughts', desc: 'Character monologues.' },
              { key: 'enemyReviveToxic', label: 'Toxic Revive Taunts', desc: 'Savage insults when you die.' }
          ].map(item => {
              // @ts-ignore
              const count = currentPhrases[item.key]?.length || 0;
              const isLoading = loadingState[`phrase_${item.key}`] || isDownloadingAll;
              const size = fileSizes[`phrase_${item.key}`];
              const isInstalled = count > 0;
              const isUnavailable = size === null;

              return (
                  <motion.div 
                      variants={itemVariants}
                      key={item.key} 
                      className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 hover:border-slate-600 transition-colors group"
                  >
                      <div className="flex-1">
                          <h4 className="text-white font-bold text-xs flex items-center gap-2">
                              {item.label}
                              {isInstalled && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle2 size={10}/> {count}</span>}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-slate-400">{item.desc}</p>
                              {isChecking ? (
                                  <span className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1"><Loader2 size={8} className="animate-spin"/> Checking</span>
                              ) : (
                                  size !== undefined && (
                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isUnavailable ? 'text-red-400 border-red-900/50 bg-red-950/20' : 'text-slate-500 border-slate-700/50 bg-slate-900/80'}`}>
                                          {isUnavailable ? 'Unavailable' : formatBytes(size)}
                                      </span>
                                  )
                              )}
                          </div>
                      </div>
                      
                      <button 
                        // @ts-ignore
                        onClick={(e) => { e.stopPropagation(); handleDownloadPhrase(e, item.key); }}
                        disabled={isLoading || !isOnline || isUnavailable}
                        className={`p-2 bg-slate-900 border rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${isUnavailable ? 'border-slate-800 text-slate-600 cursor-not-allowed' : isOnline ? 'border-slate-700 hover:bg-purple-600 hover:border-purple-500 hover:text-white text-slate-300 hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:-translate-y-0.5' : 'border-slate-800 text-slate-600 cursor-not-allowed'}`}
                        title={isUnavailable ? "Content Unavailable" : "Download"}
                      >
                         {isLoading ? <Loader2 size={16} className="animate-spin relative z-10"/> : isUnavailable ? <Ban size={16} className="relative z-10"/> : <Download size={16} className="relative z-10"/>}
                      </button>
                  </motion.div>
              );
          })}
      </motion.div>
  );

  const renderMusicTab = () => (
      <motion.div 
          className="space-y-3"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
      >
          {[
              { id: 'menu_pack', label: 'Main Menu Mix', desc: '5 tracks for UI & Navigation.', urlKey: 'menu_pack' },
              { id: 'battle_pack', label: 'Neural Combat', desc: '8 tracks for Focus Mode.', urlKey: 'battle_pack' }
          ].map(item => {
              const isInstalled = installedMusicPacks.includes(item.id);
              const isLoading = loadingState[`music_${item.id}`] || isDownloadingAll;
              
              return (
                  <motion.div 
                      variants={itemVariants}
                      key={item.id} 
                      className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 hover:border-slate-600 transition-colors group"
                  >
                      <div className="flex-1">
                          <h4 className="text-white font-bold text-xs flex items-center gap-2">
                              {item.label}
                              {isInstalled && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle2 size={10}/> Installed</span>}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDownloadMusic(e, item.id)}
                        disabled={isLoading || isInstalled}
                        className={`p-2 bg-slate-900 border rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${isInstalled ? 'border-emerald-500/50 text-emerald-500' : 'border-slate-700 hover:bg-pink-600 hover:border-pink-500 hover:text-white text-slate-300 hover:shadow-[0_0_15px_rgba(219,39,119,0.4)] hover:-translate-y-0.5'}`}
                      >
                         {isLoading ? <Loader2 size={16} className="animate-spin relative z-10"/> : isInstalled ? <CheckCircle2 size={16} className="relative z-10"/> : <Download size={16} className="relative z-10"/>}
                      </button>
                  </motion.div>
              );
          })}
          <motion.div variants={itemVariants} className="text-center py-2 text-[10px] text-slate-500 italic bg-slate-900/50 rounded-lg border border-slate-800/50">
              Base track "Level Up My Heart" is included by default.
          </motion.div>
      </motion.div>
  );

  const renderChallengesTab = () => {
      return (
          <motion.div 
              className="space-y-4"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              animate="visible"
          >
              <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      {challengeLastUpdated > 0 ? `Updated: ${new Date(challengeLastUpdated).toLocaleDateString()}` : 'Never Updated'}
                  </span>
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || !isOnline}
                    className="text-[10px] bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all hover:shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                  >
                      <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Refresh List
                  </button>
              </div>

              {Object.keys(categories).length === 0 && (
                  <motion.div variants={itemVariants} className="text-center py-8 text-slate-500 text-xs italic border-2 border-dashed border-slate-800/50 rounded-xl bg-slate-900/50">
                      No challenges found. Try refreshing the list.
                  </motion.div>
              )}

              {Object.entries(categories).map(([category, metas]: [string, ChallengeMetadata[]]) => (
                  <motion.div variants={itemVariants} key={category}>
                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 pl-1 border-b border-slate-800/80 pb-1.5 flex items-center gap-2">
                          <ChevronRight size={12} className="text-blue-500" /> {category}
                      </h5>
                      <div className="space-y-3">
                          {metas.map(meta => {
                              const skill = proficiencies.find(p => p.name === meta.skill);
                              // Prioritize downloaded cache count
                              const count = downloadedChallenges[meta.skill]?.length || 0;
                              const isLoading = loadingState[`challenge_${meta.skill}`] || isDownloadingAll;
                              const size = fileSizes[`challenge_${meta.skill}`];
                              const isInstalled = count > 0;
                              const isUnavailable = size === null;

                              return (
                                  <div key={meta.skill} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 hover:border-slate-600 transition-colors group">
                                      <div className="flex-1">
                                          <h4 className="text-white font-bold text-xs flex items-center gap-2">
                                              {meta.skill}
                                              {isInstalled ? (
                                                  <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle2 size={10}/> Installed</span>
                                              ) : (
                                                  !skill && !isUnavailable && <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full border border-slate-600">New Skill</span>
                                              )}
                                              {!isChecking && isUnavailable && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-900/50 flex items-center gap-1 shadow-[0_0_10px_rgba(248,113,113,0.1)]">In Dev</span>}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-1">
                                              <p className="text-[10px] text-slate-400">{isInstalled ? `${count} Questions` : (isUnavailable ? 'Data Not Found' : 'Data Pack')}</p>
                                              {isChecking ? (
                                                  <span className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1"><Loader2 size={8} className="animate-spin"/> Checking</span>
                                              ) : (
                                                  size !== undefined && (
                                                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isUnavailable ? 'text-red-400 border-red-900/50 bg-red-950/20' : 'text-slate-500 border-slate-700/50 bg-slate-900/80'}`}>
                                                          {isUnavailable ? 'Unavailable' : formatBytes(size)}
                                                      </span>
                                                  )
                                              )}
                                          </div>
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); if (!isUnavailable) handleDownloadChallenge(e, meta); }}
                                        disabled={isLoading || !isOnline || isUnavailable}
                                        className={`p-2 bg-slate-900 border rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${isUnavailable ? 'border-slate-800 text-slate-600 cursor-not-allowed' : isOnline ? 'border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-slate-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:-translate-y-0.5' : 'border-slate-800 text-slate-600 cursor-not-allowed'}`}
                                        title={isInstalled ? "Update" : (isUnavailable ? "Content Unavailable" : "Download")}
                                      >
                                          {isLoading ? <Loader2 size={16} className="animate-spin relative z-10"/> : isUnavailable ? <Ban size={16} className="relative z-10"/> : <Download size={16} className="relative z-10"/>}
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  </motion.div>
              ))}
          </motion.div>
      );
  };

  const renderItemsTab = () => {
      const count = shopItems.length;
      const isLoading = loadingState['items_catalog'] || isDownloadingAll;
      const size = fileSizes['items_catalog'];
      const isInstalled = count > 0;
      const isUnavailable = size === null;

      const consCount = consumablesData?.length || 0;
      const consIsLoading = loadingState['consumables_catalog'] || isDownloadingAll;
      const consSize = fileSizes['consumables_catalog'];
      const consIsInstalled = consCount > 0;
      const consIsUnavailable = consSize === null;

      return (
          <motion.div 
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              animate="visible"
              className="space-y-3"
          >
              <motion.div variants={itemVariants} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 hover:border-slate-600 transition-colors group">
                  <div className="flex-1">
                      <h4 className="text-white font-bold text-xs flex items-center gap-2">
                          Equipment Catalog
                          {isInstalled && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle2 size={10}/> {count} Items</span>}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-400">Shop inventory data.</p>
                          {isChecking ? (
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1"><Loader2 size={8} className="animate-spin"/> Checking</span>
                          ) : (
                              size !== undefined && (
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isUnavailable ? 'text-red-400 border-red-900/50 bg-red-950/20' : 'text-slate-500 border-slate-700/50 bg-slate-900/80'}`}>
                                      {isUnavailable ? 'Unavailable' : formatBytes(size)}
                                  </span>
                              )
                          )}
                      </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(!isUnavailable) handleDownloadItems(e); }}
                    disabled={isLoading || !isOnline || isUnavailable}
                    className={`p-2 bg-slate-900 border rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${isUnavailable ? 'border-slate-800 text-slate-600 cursor-not-allowed' : isOnline ? 'border-slate-700 hover:bg-yellow-600 hover:border-yellow-500 hover:text-white text-slate-300 hover:shadow-[0_0_15px_rgba(202,138,4,0.4)] hover:-translate-y-0.5' : 'border-slate-800 text-slate-600 cursor-not-allowed'}`}
                    title={isInstalled ? "Update" : (isUnavailable ? "Content Unavailable" : "Download")}
                  >
                      {isLoading ? <Loader2 size={16} className="animate-spin relative z-10"/> : isUnavailable ? <Ban size={16} className="relative z-10"/> : <Download size={16} className="relative z-10"/>}
                  </button>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 hover:border-slate-600 transition-colors group">
                  <div className="flex-1">
                      <h4 className="text-white font-bold text-xs flex items-center gap-2">
                          Consumable Catalog
                          {consIsInstalled && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle2 size={10}/> {consCount} Items</span>}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-400">Consumables and buffs data.</p>
                          {isChecking ? (
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1"><Loader2 size={8} className="animate-spin"/> Checking</span>
                          ) : (
                              consSize !== undefined && (
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${consIsUnavailable ? 'text-red-400 border-red-900/50 bg-red-950/20' : 'text-slate-500 border-slate-700/50 bg-slate-900/80'}`}>
                                      {consIsUnavailable ? 'Unavailable' : formatBytes(consSize)}
                                  </span>
                              )
                          )}
                      </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(!consIsUnavailable) handleDownloadConsumables(e); }}
                    disabled={consIsLoading || !isOnline || consIsUnavailable}
                    className={`p-2 bg-slate-900 border rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${consIsUnavailable ? 'border-slate-800 text-slate-600 cursor-not-allowed' : isOnline ? 'border-slate-700 hover:bg-yellow-600 hover:border-yellow-500 hover:text-white text-slate-300 hover:shadow-[0_0_15px_rgba(202,138,4,0.4)] hover:-translate-y-0.5' : 'border-slate-800 text-slate-600 cursor-not-allowed'}`}
                    title={consIsInstalled ? "Update" : (consIsUnavailable ? "Content Unavailable" : "Download")}
                  >
                      {consIsLoading ? <Loader2 size={16} className="animate-spin relative z-10"/> : consIsUnavailable ? <Ban size={16} className="relative z-10"/> : <Download size={16} className="relative z-10"/>}
                  </button>
              </motion.div>
          </motion.div>
      );
  };

  const renderEnemiesTab = () => {
      const isInstalled = detailedEnemies && detailedEnemies.length > 0;
      const isLoading = loadingState['enemies'];
      const size = fileSizes['enemies'];
      const isUnavailable = size === null;
      
      return (
          <motion.div 
              className="space-y-3"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              initial="hidden"
              animate="visible"
          >
              <motion.div variants={itemVariants} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between hover:bg-slate-800 hover:border-slate-600 transition-colors group">
                  <div className="flex-1">
                      <h4 className="text-white font-bold text-xs flex items-center gap-2">
                          Detailed Enemy Pack
                          {isInstalled && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.1)]"><CheckCircle2 size={10}/> Installed</span>}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-400">Downloads detailed stats, lore, and milestones for all enemies.</p>
                          {isChecking ? (
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1"><Loader2 size={8} className="animate-spin"/> Checking</span>
                          ) : (
                              size !== undefined && (
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isUnavailable ? 'text-red-400 border-red-900/50 bg-red-950/20' : 'text-slate-500 border-slate-700/50 bg-slate-900/80'}`}>
                                      {isUnavailable ? 'Unavailable' : formatBytes(size)}
                                  </span>
                              )
                          )}
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                          onClick={handleDownloadEnemies}
                          disabled={isLoading || !isOnline || isUnavailable}
                          className={`p-2 bg-slate-900 border rounded-xl transition-all disabled:opacity-50 relative overflow-hidden ${isUnavailable ? 'border-slate-800 text-slate-600 cursor-not-allowed' : isOnline ? 'border-slate-700 hover:bg-red-600 hover:border-red-500 hover:text-white text-slate-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:-translate-y-0.5' : 'border-slate-800 text-slate-600 cursor-not-allowed'}`}
                          title={isInstalled ? "Update" : (isUnavailable ? "Content Unavailable" : "Download")}
                      >
                          {isLoading ? <Loader2 size={16} className="animate-spin relative z-10" /> : isUnavailable ? <Ban size={16} className="relative z-10"/> : (isInstalled ? <RefreshCw size={16} className="relative z-10"/> : <Download size={16} className="relative z-10" />)}
                      </button>
                  </div>
              </motion.div>
          </motion.div>
      );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const renderAssetsTab = () => (
      <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
      >
          <motion.div 
              variants={itemVariants}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Image size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-sm">NPC Images</h4>
                      <p className="text-xs text-slate-400 mt-1">Immersive shopkeeper banners for the Store.</p>
                  </div>
              </div>
              <button
                  onClick={handleDownloadNpcImages}
                  disabled={installedNpcImages || loadingState['npcImages'] || isDownloadingAll}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                      installedNpcImages 
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                  {loadingState['npcImages'] || isDownloadingAll ? (
                      <><RefreshCw size={14} className="animate-spin" /> Downloading...</>
                  ) : installedNpcImages ? (
                      <><CheckCircle2 size={14} /> Installed</>
                  ) : (
                      <><Download size={14} /> Download</>
                  )}
              </button>
          </motion.div>
          <motion.div 
              variants={itemVariants}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-900/30 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <Image size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-sm">Enemy Images</h4>
                      <p className="text-xs text-slate-400 mt-1">High-quality visuals for all enemies.</p>
                  </div>
              </div>
              <button
                  onClick={handleDownloadEnemyImages}
                  disabled={installedEnemyImages || loadingState['enemyImages'] || isDownloadingAll}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                      installedEnemyImages 
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                  {loadingState['enemyImages'] || isDownloadingAll ? (
                      <><RefreshCw size={14} className="animate-spin" /> Downloading...</>
                  ) : installedEnemyImages ? (
                      <><CheckCircle2 size={14} /> Installed</>
                  ) : (
                      <><Download size={14} /> Download</>
                  )}
              </button>
          </motion.div>
          <motion.div 
              variants={itemVariants}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-900/30 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                      <Image size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-sm">Consumable Images</h4>
                      <p className="text-xs text-slate-400 mt-1">Custom icons for consumable items.</p>
                  </div>
              </div>
              <button
                  onClick={handleDownloadConsumableImages}
                  disabled={installedConsumableImages || loadingState['consumableImages'] || isDownloadingAll}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                      installedConsumableImages 
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                          : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                  {loadingState['consumableImages'] || isDownloadingAll ? (
                      <><RefreshCw size={14} className="animate-spin" /> Downloading...</>
                  ) : installedConsumableImages ? (
                      <><CheckCircle2 size={14} /> Installed</>
                  ) : (
                      <><Download size={14} /> Download</>
                  )}
              </button>
          </motion.div>

      </motion.div>
  );

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[120] p-4" onClick={onClose}>
          <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
          >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-purple-500/10 blur-[50px] pointer-events-none" />

              <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10 bg-slate-800/50 p-1.5 rounded-full backdrop-blur-sm transition-colors">
                  <X size={20} />
              </button>

              <div className="flex items-center justify-between mb-3 shrink-0 relative z-10 border-b border-slate-800/50 pb-3">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-inner">
                          <Database className="text-purple-400" size={16} />
                      </div>
                      <h2 className="text-base font-rpg font-bold text-white uppercase tracking-wider">Content Manager</h2>
                  </div>
                  <div className="flex justify-center items-center gap-2 pr-8">
                      <span className={`text-[9px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border ${isOnline ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]' : 'text-red-400 border-red-900/50 bg-red-950/30 shadow-[0_0_10px_rgba(248,113,113,0.1)]'}`}>
                          {isOnline ? <Wifi size={10}/> : <WifiOff size={10}/>} {isOnline ? 'Online' : 'Offline'}
                      </span>
                  </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap justify-center bg-slate-950/50 p-1 rounded-xl mb-3 shrink-0 border border-slate-800/50 gap-1 relative z-10">
                  {[
                      { id: 'phrases', icon: MessageSquare, label: 'Phrases' },
                      { id: 'challenges', icon: Swords, label: 'Challenges' },
                      { id: 'items', icon: ShoppingBag, label: 'Items' },
                      { id: 'music', icon: Music, label: 'BGM' },
                      { id: 'enemies', icon: Shield, label: 'Enemies' },
                      { id: 'assets', icon: Image, label: 'Assets' }
                  ].map(tab => {
                      const isActive = activeTab === tab.id;
                      return (
                          <button 
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as TabType)} 
                              className={`flex-1 min-w-[60px] py-1.5 px-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 relative ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                          >
                              {isActive && (
                                  <motion.div 
                                      layoutId="activeTab" 
                                      className="absolute inset-0 bg-gradient-to-b from-purple-600/80 to-indigo-600/80 rounded-lg shadow-md border border-purple-500/50"
                                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                              )}
                              <tab.icon size={14} className={`relative z-10 ${isActive ? 'text-white drop-shadow-md' : ''}`}/>
                              <span className="relative z-10 tracking-wide">{tab.label}</span>
                          </button>
                      );
                  })}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 mb-4 relative z-10 pr-1">
                  <AnimatePresence mode="wait">
                      <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                      >
                          {activeTab === 'phrases' && renderPhraseTab()}
                          {activeTab === 'challenges' && renderChallengesTab()}
                          {activeTab === 'items' && renderItemsTab()}
                          {activeTab === 'music' && renderMusicTab()}
                          {activeTab === 'enemies' && renderEnemiesTab()}
                          {activeTab === 'assets' && renderAssetsTab()}
                      </motion.div>
                  </AnimatePresence>
              </div>

              {/* Footer with Download All and Checkbox */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0 relative z-10 bg-slate-900">
                  <div className="flex items-center gap-2 bg-slate-950/30 py-1.5 px-2.5 rounded-lg border border-slate-800/50">
                      <div className="relative flex items-center">
                          <input 
                              type="checkbox" 
                              id="hideStartup" 
                              checked={hideOnStartup} 
                              onChange={toggleHideOnStartup}
                              className="peer appearance-none w-3.5 h-3.5 border border-slate-600 rounded bg-slate-800 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                          />
                          <CheckCircle2 size={10} className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                      </div>
                      <label htmlFor="hideStartup" className="text-[10px] text-slate-300 select-none cursor-pointer font-medium whitespace-nowrap">
                          Skip on startup
                      </label>
                  </div>
                  
                  <button 
                      onClick={handleDownloadAll}
                      disabled={isDownloadingAll || !isOnline || isChecking}
                      className={`flex-1 py-2 rounded-lg font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all relative overflow-hidden group ${
                          isDownloadingAll || !isOnline 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/50'
                      }`}
                  >
                      {(!isDownloadingAll && isOnline) && (
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                          {isDownloadingAll ? (
                              <><Loader2 size={18} className="animate-spin" /> Syncing Data...</>
                          ) : (
                              <><Layers size={18} /> Download All Content</>
                          )}
                      </span>
                  </button>
              </div>
          </motion.div>
      </div>
      {showQuotesModal && <QuotesModal phrases={currentPhrases} onClose={() => setShowQuotesModal(false)} />}
    </AnimatePresence>
  );
};
