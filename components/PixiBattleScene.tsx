import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface PixiBattleSceneProps {
  userAvatar: string;
  enemyImage: string;
  targetHit: boolean;
  isDead: boolean;
  isAttacking?: boolean;
  isEnemyAttacking?: boolean;
  isEnemyDead?: boolean;
  isUndying?: boolean;
  isEnemyUndying?: boolean;
  enemySize: number;
  playerRef: React.RefObject<HTMLDivElement>;
  enemyRef: React.RefObject<HTMLDivElement>;
  installedEnemyImages?: boolean;
  hitVfx?: 'crit' | 'overcrit' | 'plus-ultra' | 'revive' | 'death' | 'spawn' | null;
}

export const PixiBattleScene: React.FC<PixiBattleSceneProps> = ({
  userAvatar,
  enemyImage,
  targetHit,
  isDead,
  isAttacking,
  isEnemyAttacking,
  isEnemyDead,
  isUndying,
  isEnemyUndying,
  enemySize,
  playerRef,
  enemyRef,
  installedEnemyImages,
  hitVfx
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const spritesRef = useRef<any>({});
  const enemySizeRef = useRef(enemySize);
  const [isPixiReady, setIsPixiReady] = React.useState(false);

  useEffect(() => {
    enemySizeRef.current = enemySize;
  }, [enemySize]);

  // Initialize PixiJS app once
  useEffect(() => {
    let isMounted = true;
    const initPixi = async () => {
      const app = new PIXI.Application();
      await app.init({ 
        backgroundAlpha: 0, 
        width: canvasRef.current?.clientWidth || 800,
        height: canvasRef.current?.clientHeight || 600,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });
      
      if (!isMounted) {
        app.destroy(true, { children: true });
        return;
      }
      
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
        app.canvas.style.position = 'absolute';
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.top = '0';
        app.canvas.style.left = '0';
      }
      appRef.current = app;

      const playerGlow = new PIXI.Sprite();
      playerGlow.anchor.set(0.5);
      const playerBlur = new PIXI.BlurFilter();
      playerBlur.blur = 15;
      playerGlow.filters = [playerBlur];
      playerGlow.tint = 0xfacc15; // yellow-400
      app.stage.addChild(playerGlow);

      const player = new PIXI.Sprite();
      player.anchor.set(0.5);
      app.stage.addChild(player);

      const playerMask = new PIXI.Graphics();
      app.stage.addChild(playerMask);
      player.mask = playerMask;
      
      const enemyGlow = new PIXI.Sprite();
      enemyGlow.anchor.set(0.5);
      const enemyBlur = new PIXI.BlurFilter();
      enemyBlur.blur = 15;
      enemyGlow.filters = [enemyBlur];
      enemyGlow.tint = 0xfacc15; // yellow-400
      app.stage.addChild(enemyGlow);

      const enemy = new PIXI.Sprite();
      enemy.anchor.set(0.5);
      app.stage.addChild(enemy);
      
      // VFX Container
      const vfxContainer = new PIXI.Container();
      app.stage.addChild(vfxContainer);

      spritesRef.current = { player, playerGlow, enemy, enemyGlow, playerMask, vfxContainer, lastPWidth: 0, lastPHeight: 0, vfxState: null, vfxTime: 0 };
      setIsPixiReady(true);

      app.ticker.add((ticker) => {
        // Update positions and scales based on HTML refs
        if (playerRef.current && canvasRef.current && spritesRef.current.player.texture && spritesRef.current.player.texture.width > 0) {
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const pRect = playerRef.current.getBoundingClientRect();
          
          // Use offsetWidth/Height for base size to avoid bounding box wobble
          const baseWidth = playerRef.current.offsetWidth;
          const baseHeight = playerRef.current.offsetHeight;

          const pX = pRect.left - canvasRect.left + pRect.width / 2;
          const pY = pRect.top - canvasRect.top + pRect.height / 2;

          player.x = pX;
          player.y = pY;
          
          // Apply manual scale and rotation based on state
          let targetScale = 1;
          let targetRotation = 0;
          if (spritesRef.current.isAttacking) {
              targetScale = 1.1;
              targetRotation = 3 * (Math.PI / 180);
          } else if (spritesRef.current.isDead) {
              targetScale = 0.95;
              targetRotation = -5 * (Math.PI / 180);
          }
          
          player.rotation = targetRotation;
          
          // Mimic object-fit: cover
          const pTexAspect = spritesRef.current.player.texture.width / spritesRef.current.player.texture.height;
          const pRectAspect = baseWidth / baseHeight;
          
          let targetWidth, targetHeight;
          if (pTexAspect > pRectAspect) {
            targetHeight = baseHeight;
            targetWidth = baseHeight * pTexAspect;
          } else {
            targetWidth = baseWidth;
            targetHeight = baseWidth / pTexAspect;
          }

          player.width = targetWidth * targetScale;
          player.height = targetHeight * targetScale;
          
          spritesRef.current.playerGlow.texture = player.texture;
          spritesRef.current.playerGlow.x = player.x;
          spritesRef.current.playerGlow.y = player.y;
          spritesRef.current.playerGlow.width = player.width;
          spritesRef.current.playerGlow.height = player.height;
          spritesRef.current.playerGlow.rotation = player.rotation;
          spritesRef.current.playerGlow.visible = spritesRef.current.isUndying;
          spritesRef.current.playerGlow.alpha = 0.6 + Math.sin(Date.now() / 150) * 0.2; // pulse effect

          // Only redraw mask if size changes
          if (baseWidth !== spritesRef.current.lastPWidth || baseHeight !== spritesRef.current.lastPHeight) {
            spritesRef.current.playerMask.clear();
            spritesRef.current.playerMask.roundRect(-baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight, 12);
            spritesRef.current.playerMask.fill(0xffffff);
            spritesRef.current.lastPWidth = baseWidth;
            spritesRef.current.lastPHeight = baseHeight;
          }
          
          spritesRef.current.playerMask.x = pX;
          spritesRef.current.playerMask.y = pY;
          spritesRef.current.playerMask.scale.set(targetScale);
          spritesRef.current.playerMask.rotation = targetRotation;

          if (spritesRef.current.isDead) {
            player.tint = 0x555555;
          } else {
            player.tint = 0xffffff;
          }
        }

        if (enemyRef.current && canvasRef.current && spritesRef.current.enemy.texture && spritesRef.current.enemy.texture.width > 0) {
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const eRect = enemyRef.current.getBoundingClientRect();
          
          const baseWidth = enemyRef.current.offsetWidth;
          const baseHeight = enemyRef.current.offsetHeight;

          const eX = eRect.left - canvasRect.left + eRect.width / 2;
          const eY = eRect.top - canvasRect.top + eRect.height / 2;

          enemy.x = eX;
          enemy.y = eY;
          
          let targetScale = 1;
          let targetRotation = 0;
          let targetAlpha = 1;
          let targetYOffset = 0;
          
          if (spritesRef.current.isEnemyDead) {
              // Death animation: shrink, rotate, fade out
              targetScale = 0.5;
              targetRotation = Math.PI; // 180 degrees
              targetAlpha = 0;
              
              // Animate towards target
              enemy.scale.x += (targetScale * (enemySizeRef.current / 100) - enemy.scale.x) * 0.1;
              enemy.scale.y += (targetScale * (enemySizeRef.current / 100) - enemy.scale.y) * 0.1;
              enemy.rotation += (targetRotation - enemy.rotation) * 0.1;
              enemy.alpha += (targetAlpha - enemy.alpha) * 0.1;
          } else {
              if (spritesRef.current.hitVfx === 'spawn') {
                  // Spawn animation: fade in, scale up
                  if (enemy.alpha === 0) {
                      enemy.scale.set(0);
                      spritesRef.current.spawnYOffset = -50;
                  }
                  targetScale = 1;
                  targetAlpha = 1;
                  
                  spritesRef.current.spawnYOffset = spritesRef.current.spawnYOffset || 0;
                  spritesRef.current.spawnYOffset += (0 - spritesRef.current.spawnYOffset) * 0.05;
                  enemy.y += spritesRef.current.spawnYOffset;
                  
                  enemy.scale.x += (targetScale * (enemySizeRef.current / 100) - enemy.scale.x) * 0.05;
                  enemy.scale.y += (targetScale * (enemySizeRef.current / 100) - enemy.scale.y) * 0.05;
                  enemy.alpha += (targetAlpha - enemy.alpha) * 0.05;
                  enemy.rotation = 0;
              } else {
                  enemy.alpha = 1;
                  if (spritesRef.current.isEnemyAttacking) {
                      targetScale = 1.25;
                      targetRotation = -5 * (Math.PI / 180);
                  }
                  
                  enemy.rotation = targetRotation;
              }
              
              // Mimic object-fit: contain
              const eTexAspect = spritesRef.current.enemy.texture.width / spritesRef.current.enemy.texture.height;
              const eRectAspect = baseWidth / baseHeight;
              
              let targetWidth, targetHeight;
              if (eTexAspect > eRectAspect) {
                targetWidth = baseWidth;
                targetHeight = baseWidth / eTexAspect;
              } else {
                targetHeight = baseHeight;
                targetWidth = baseHeight * eTexAspect;
              }

              enemy.width = targetWidth * (enemySizeRef.current / 100) * targetScale;
              enemy.height = targetHeight * (enemySizeRef.current / 100) * targetScale;
          }
          
          spritesRef.current.enemyGlow.texture = enemy.texture;
          spritesRef.current.enemyGlow.x = enemy.x;
          spritesRef.current.enemyGlow.y = enemy.y;
          spritesRef.current.enemyGlow.width = enemy.width;
          spritesRef.current.enemyGlow.height = enemy.height;
          spritesRef.current.enemyGlow.rotation = enemy.rotation;
          spritesRef.current.enemyGlow.visible = spritesRef.current.isEnemyUndying && spritesRef.current.enemy.visible;
          spritesRef.current.enemyGlow.alpha = 0.6 + Math.sin(Date.now() / 150) * 0.2; // pulse effect

          if (spritesRef.current.targetHit && !spritesRef.current.isEnemyDead) {
            enemy.tint = 0xff0000;
          } else {
            enemy.tint = 0xffffff;
          }
        }
        
        // Handle VFX
        const vfx = spritesRef.current.vfxState;
        if (vfx && spritesRef.current.vfxContainer) {
            spritesRef.current.vfxTime += ticker.deltaTime;
            const container = spritesRef.current.vfxContainer as PIXI.Container;
            
            const duration = vfx === 'death' ? 120 : (vfx === 'spawn' ? 90 : 30); // ~2s for death, ~1.5s for spawn, ~0.5s for others
            
            if (spritesRef.current.vfxTime > duration) {
                container.removeChildren();
                spritesRef.current.vfxState = null;
            } else {
                if (vfx === 'death') {
                    // Animate particles
                    container.children.forEach((child: any, index) => {
                        if (index === 0) {
                            // The main explosion circle
                            child.scale.x += 0.05;
                            child.scale.y += 0.05;
                            child.alpha = 1 - (spritesRef.current.vfxTime / duration);
                        } else {
                            // Particles
                            child.x += child.vx;
                            child.y += child.vy;
                            child.vy += 0.5; // gravity
                            child.alpha = 1 - (spritesRef.current.vfxTime / duration);
                        }
                    });
                } else if (vfx === 'spawn') {
                    // Animate spawn particles
                    container.children.forEach((child: any) => {
                        child.x += child.vx;
                        child.y += child.vy;
                        child.alpha = 1 - (spritesRef.current.vfxTime / duration);
                    });
                } else {
                    // Simple fade out
                    container.alpha = 1 - (spritesRef.current.vfxTime / duration);
                }
            }
        }
      });
    };
    
    initPixi();

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, []); // Empty dependency array, only run once

  // Handle texture updates
  useEffect(() => {
      const loadTextures = async () => {
      if (!isPixiReady || !appRef.current || !spritesRef.current.player) return;

      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = url;
        });
      };

      try {
        const img = await loadImage(userAvatar);
        const playerTex = PIXI.Texture.from(img);
        if (appRef.current) {
          spritesRef.current.player.texture = playerTex;
        }
      } catch (e) {
        console.error("Failed to load player texture", e);
      }

      try {
        if (installedEnemyImages && enemyImage) {
            if (appRef.current) {
              spritesRef.current.enemy.visible = false; // Hide while loading
            }
            const img = await loadImage(enemyImage);
            const enemyTex = PIXI.Texture.from(img);
            if (appRef.current) {
              spritesRef.current.enemy.texture = enemyTex;
              spritesRef.current.enemy.visible = true;
            }
        } else {
            if (appRef.current) {
              spritesRef.current.enemy.visible = false;
            }
        }
      } catch (e) {
        console.error("Failed to load enemy texture", e);
      }
    };

    loadTextures();
  }, [userAvatar, enemyImage, installedEnemyImages, isPixiReady]);

  // Update refs for ticker
  useEffect(() => {
    spritesRef.current.isDead = isDead;
    spritesRef.current.targetHit = targetHit;
    spritesRef.current.isAttacking = isAttacking;
    spritesRef.current.isEnemyAttacking = isEnemyAttacking;
    spritesRef.current.isEnemyDead = isEnemyDead;
    spritesRef.current.isUndying = isUndying;
    spritesRef.current.isEnemyUndying = isEnemyUndying;
    spritesRef.current.hitVfx = hitVfx;
  }, [isDead, targetHit, isAttacking, isEnemyAttacking, isEnemyDead, isUndying, isEnemyUndying, hitVfx]);
  
  // Trigger VFX
  useEffect(() => {
      if (hitVfx && isPixiReady && appRef.current && canvasRef.current) {
          spritesRef.current.vfxState = hitVfx;
          spritesRef.current.vfxTime = 0;
          
          const container = spritesRef.current.vfxContainer as PIXI.Container;
          container.removeChildren();
          container.alpha = 1;
          
          const width = canvasRef.current.clientWidth;
          const height = canvasRef.current.clientHeight;
          
          if (hitVfx === 'crit') {
              const slash = new PIXI.Graphics();
              slash.fill(0xfacc15);
              slash.rect(-width, -10, width * 3, 20);
              slash.x = width / 2;
              slash.y = height / 2;
              slash.rotation = -Math.PI / 4;
              container.addChild(slash);
          } else if (hitVfx === 'overcrit') {
              const slash1 = new PIXI.Graphics();
              slash1.fill(0xef4444);
              slash1.rect(-width, -15, width * 3, 30);
              slash1.x = width / 2;
              slash1.y = height / 2;
              slash1.rotation = Math.PI / 4;
              container.addChild(slash1);
              
              const slash2 = new PIXI.Graphics();
              slash2.fill(0xa855f7);
              slash2.rect(-width, -15, width * 3, 30);
              slash2.x = width / 2;
              slash2.y = height / 2;
              slash2.rotation = -Math.PI / 4;
              container.addChild(slash2);
          } else if (hitVfx === 'plus-ultra') {
              const slash = new PIXI.Graphics();
              slash.fill(0x000000);
              slash.rect(-width, -40, width * 3, 80);
              slash.x = width / 2;
              slash.y = height / 2;
              slash.rotation = Math.PI / 12;
              container.addChild(slash);
          } else if (hitVfx === 'death') {
              const explosion = new PIXI.Graphics();
              explosion.circle(0, 0, width / 2);
              explosion.fill({ color: 0xff0000, alpha: 0.5 });
              explosion.x = width / 2;
              explosion.y = height / 2;
              container.addChild(explosion);
              
              // Add some particles
              for (let i = 0; i < 20; i++) {
                  const particle = new PIXI.Graphics();
                  particle.circle(0, 0, Math.random() * 10 + 5);
                  particle.fill({ color: 0xffaa00, alpha: 0.8 });
                  particle.x = width / 2 + (Math.random() - 0.5) * 100;
                  particle.y = height / 2 + (Math.random() - 0.5) * 100;
                  
                  // Store initial velocity in custom properties
                  (particle as any).vx = (Math.random() - 0.5) * 20;
                  (particle as any).vy = (Math.random() - 0.5) * 20;
                  
                  container.addChild(particle);
              }
          } else if (hitVfx === 'spawn') {
              // Spawn particles
              for (let i = 0; i < 30; i++) {
                  const particle = new PIXI.Graphics();
                  particle.circle(0, 0, Math.random() * 5 + 2);
                  particle.fill({ color: 0x00ffff, alpha: 0.8 });
                  particle.x = width / 2 + (Math.random() - 0.5) * 200;
                  particle.y = height / 2 + (Math.random() - 0.5) * 200;
                  (particle as any).vx = (width / 2 - particle.x) * 0.05;
                  (particle as any).vy = (height / 2 - particle.y) * 0.05;
                  container.addChild(particle);
              }
          }
      }
  }, [hitVfx, isPixiReady]);

  // Handle resize with ResizeObserver
  useEffect(() => {
    if (!canvasRef.current || !appRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (appRef.current) {
          appRef.current.renderer.resize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    
    resizeObserver.observe(canvasRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isPixiReady]);

  return <div ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />;
};
