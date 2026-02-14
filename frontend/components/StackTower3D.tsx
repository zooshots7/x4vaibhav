'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Shield, Award, X, Play, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Block {
  id: number;
  type: 'weather' | 'crypto' | 'ai' | 'fact' | 'fraud';
  value: number;
  color: string;
  emoji: string;
  position: number;
  falling: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const BLOCK_TYPES = {
  weather: { value: 0.005, color: '#06b6d4', emoji: '🌤️', name: 'Weather' },
  crypto: { value: 0.003, color: '#10b981', emoji: '💰', name: 'Crypto' },
  ai: { value: 0.01, color: '#8b5cf6', emoji: '🤖', name: 'AI Summary' },
  fact: { value: 0.001, color: '#f59e0b', emoji: '🎲', name: 'Random Fact' },
  fraud: { value: -0.02, color: '#ef4444', emoji: '⚠️', name: 'FRAUD' }
};

export default function StackTower3D({ creditScore = 750 }: { creditScore?: number }) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [tower, setTower] = useState<Block[]>([]);
  const [fallingBlock, setFallingBlock] = useState<Block | null>(null);
  const [blockCounter, setBlockCounter] = useState(0);
  const [combo, setCombo] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first', title: 'First Stack!', description: 'Stack your first block', icon: '🎯', unlocked: false },
    { id: 'combo5', title: 'Hot Streak', description: '5x combo', icon: '🔥', unlocked: false },
    { id: 'whale', title: 'Whale', description: 'Score 0.1 STX', icon: '🐋', unlocked: false },
    { id: 'fraud_dodge', title: 'Fraud Fighter', description: 'Dodge 5 fraud blocks', icon: '🛡️', unlocked: false }
  ]);
  const [particles, setParticles] = useState<any[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [fraudDodged, setFraudDodged] = useState(0);

  // Credit score multiplier
  const getSpeedMultiplier = () => {
    if (creditScore >= 800) return 0.6; // 40% slower
    if (creditScore >= 700) return 0.8; // 20% slower
    if (creditScore >= 600) return 1.0; // Normal
    return 1.3; // 30% faster (harder)
  };

  const getScoreMultiplier = () => {
    if (creditScore >= 800) return 1.3; // 30% bonus
    if (creditScore >= 700) return 1.15; // 15% bonus
    if (creditScore >= 600) return 1.0; // Normal
    return 0.9; // 10% penalty
  };

  // Generate random block
  const generateBlock = useCallback(() => {
    const types = ['weather', 'crypto', 'ai', 'fact'];
    
    // 15% chance of fraud block
    if (Math.random() < 0.15) {
      types.push('fraud');
    }
    
    const type = types[Math.floor(Math.random() * types.length)] as keyof typeof BLOCK_TYPES;
    const blockType = BLOCK_TYPES[type];
    
    return {
      id: blockCounter,
      type,
      value: blockType.value,
      color: blockType.color,
      emoji: blockType.emoji,
      position: Math.random() * 80, // Random horizontal position
      falling: true
    };
  }, [blockCounter]);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTower([]);
    setCombo(0);
    setFraudDodged(0);
    setBlockCounter(0);
    setFallingBlock(generateBlock());
  };

  // Stack block
  const stackBlock = useCallback(() => {
    if (!fallingBlock || gameState !== 'playing') return;
    
    if (fallingBlock.type === 'fraud') {
      // Hit fraud - lose points and combo
      setScore(prev => Math.max(0, prev + fallingBlock.value));
      setCombo(0);
      toast.error('💥 Fraud block! Lost combo!', {
        style: { background: '#1C1210', border: '1px solid #ef4444' }
      });
      
      // Shake tower
      createParticles(fallingBlock.color, 20);
    } else {
      // Successful stack!
      const points = fallingBlock.value * getScoreMultiplier() * (1 + combo * 0.1);
      setScore(prev => prev + points);
      setTower(prev => [...prev, { ...fallingBlock, falling: false }]);
      setCombo(prev => prev + 1);
      
      // Create success particles
      createParticles(fallingBlock.color, 15);
      
      // Check achievements
      checkAchievements();
      
      // Record payment to backend
      recordPayment(fallingBlock);
    }
    
    // Generate next block
    setBlockCounter(prev => prev + 1);
    setTimeout(() => {
      setFallingBlock(generateBlock());
    }, 300);
    
  }, [fallingBlock, gameState, combo, creditScore]);

  // Miss block (fell off screen)
  const missBlock = useCallback(() => {
    if (!fallingBlock || gameState !== 'playing') return;
    
    if (fallingBlock.type === 'fraud') {
      // Dodged fraud - good!
      setFraudDodged(prev => prev + 1);
      toast.success('🛡️ Fraud dodged!', {
        style: { background: '#1C1210', border: '1px solid #10b981' }
      });
    } else {
      // Missed payment - lose combo
      setCombo(0);
    }
    
    setBlockCounter(prev => prev + 1);
    setFallingBlock(generateBlock());
  }, [fallingBlock, gameState]);

  // Create particle explosion
  const createParticles = (color: string, count: number) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      color,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10
    }));
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  // Check and unlock achievements
  const checkAchievements = () => {
    const newAchievements = [...achievements];
    
    // First stack
    if (!newAchievements[0].unlocked && tower.length === 0) {
      newAchievements[0].unlocked = true;
      showAchievementPopup(newAchievements[0]);
    }
    
    // 5x combo
    if (!newAchievements[1].unlocked && combo >= 4) {
      newAchievements[1].unlocked = true;
      showAchievementPopup(newAchievements[1]);
    }
    
    // 0.1 STX score
    if (!newAchievements[2].unlocked && score >= 0.1) {
      newAchievements[2].unlocked = true;
      showAchievementPopup(newAchievements[2]);
    }
    
    // Dodge 5 fraud
    if (!newAchievements[3].unlocked && fraudDodged >= 5) {
      newAchievements[3].unlocked = true;
      showAchievementPopup(newAchievements[3]);
    }
    
    setAchievements(newAchievements);
  };

  const showAchievementPopup = (achievement: Achievement) => {
    setShowAchievement(achievement);
    toast.success(`🏆 ${achievement.title}!`, {
      style: { background: '#1C1210', border: '1px solid #FF6A00' }
    });
    setTimeout(() => setShowAchievement(null), 3000);
  };

  // Record payment to backend
  const recordPayment = async (block: Block) => {
    try {
      await fetch('http://localhost:3001/api/test/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: 'success',
          endpoint: `/api/${block.type === 'weather' ? 'weather' : block.type === 'crypto' ? 'crypto-price' : block.type === 'ai' ? 'ai-summary' : 'random-fact'}`,
          amount: block.value.toString()
        })
      });
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        stackBlock();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stackBlock, gameState]);

  // Block falling animation
  useEffect(() => {
    if (gameState !== 'playing' || !fallingBlock) return;
    
    const speed = 50 * getSpeedMultiplier();
    const interval = setInterval(() => {
      setFallingBlock(prev => {
        if (!prev) return null;
        
        // Check if block fell off screen
        if (prev.position < -10) {
          missBlock();
          return prev;
        }
        
        return { ...prev, position: prev.position - 2 };
      });
    }, speed);
    
    return () => clearInterval(interval);
  }, [gameState, fallingBlock, missBlock]);

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E0E0F] via-[#1C1210] to-[#2A0F0B] p-8">
      {/* Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 1, x: particle.x + '%', y: particle.y + '%' }}
            animate={{
              opacity: 0,
              scale: 0,
              x: (particle.x + particle.vx) + '%',
              y: (particle.y + particle.vy) + '%'
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color, boxShadow: `0 0 10px ${particle.color}` }}
          />
        ))}
      </AnimatePresence>

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-[#FF6A00] to-[#F24C00] p-6 rounded-2xl shadow-2xl border-2 border-[#FF8C42] glow-orange-intense">
              <div className="text-4xl mb-2 text-center">{showAchievement.icon}</div>
              <div className="text-white font-bold text-lg text-center">{showAchievement.title}</div>
              <div className="text-white/80 text-sm text-center mt-1">{showAchievement.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-center"
          >
            <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-[#FF6A00] via-[#F24C00] to-[#D84315] bg-clip-text text-transparent text-glow-orange">
              STACK TOWER 3D
            </h1>
            <p className="text-xl text-[#CFCFCF] mb-8">Stack payments, build your tower, earn STX!</p>
            
            <div className="bg-[#1C1210]/90 border border-[#FF6A00]/30 rounded-2xl p-6 mb-8 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left">
                  <div className="text-sm text-[#9E9E9E]">Your Credit Score</div>
                  <div className="text-3xl font-bold text-[#FF7A1A]">{creditScore}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#9E9E9E]">Score Bonus</div>
                  <div className="text-3xl font-bold text-[#10b981]">+{((getScoreMultiplier() - 1) * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="text-xs text-[#CFCFCF]">
                💡 Higher credit score = slower blocks + bonus points!
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-[#FF6A00] to-[#F24C00] rounded-xl font-bold text-2xl text-white shadow-[0_0_40px_rgba(255,106,0,0.5)] hover:shadow-[0_0_60px_rgba(255,106,0,0.8)] transition-all flex items-center gap-3 mx-auto"
            >
              <Play className="w-8 h-8" />
              START GAME
            </motion.button>

            <div className="mt-8 text-sm text-[#9E9E9E]">
              Press SPACE or Click to stack blocks
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Game Screen */}
      {gameState === 'playing' && (
        <div className="relative h-full">
          {/* HUD */}
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#1C1210]/90 border border-[#FF6A00]/30 rounded-xl p-4 glow-orange">
              <div className="text-sm text-[#9E9E9E]">Score</div>
              <div className="text-3xl font-black text-[#FF7A1A]">{score.toFixed(6)} STX</div>
              {combo > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm text-[#10b981] font-bold mt-1"
                >
                  🔥 {combo}x COMBO
                </motion.div>
              )}
            </div>

            <div className="bg-[#1C1210]/90 border border-[#FF6A00]/30 rounded-xl p-4">
              <div className="text-sm text-[#9E9E9E]">Tower Height</div>
              <div className="text-3xl font-black text-[#FF7A1A]">{tower.length}</div>
            </div>
          </div>

          {/* Game Area */}
          <div className="relative h-[400px] bg-[#0E0E0F]/50 border-2 border-[#FF6A00]/20 rounded-2xl overflow-hidden">
            {/* Falling Block */}
            {fallingBlock && (
              <motion.div
                onClick={stackBlock}
                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                style={{
                  top: `${100 - fallingBlock.position}%`,
                  transition: 'top 0.05s linear'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className="w-20 h-16 rounded-lg flex items-center justify-center text-3xl font-bold border-4 shadow-2xl transform hover:rotate-3 transition-all"
                  style={{
                    backgroundColor: fallingBlock.color + '20',
                    borderColor: fallingBlock.color,
                    boxShadow: `0 0 30px ${fallingBlock.color}`,
                    animation: fallingBlock.type === 'fraud' ? 'pulse 0.5s infinite' : 'none'
                  }}
                >
                  {fallingBlock.emoji}
                </div>
              </motion.div>
            )}

            {/* Tower */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center gap-1">
              {tower.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ scale: 0, y: -50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  className="w-20 h-16 rounded-lg flex items-center justify-center text-2xl font-bold border-4"
                  style={{
                    backgroundColor: block.color + '20',
                    borderColor: block.color,
                    boxShadow: `0 0 20px ${block.color}`
                  }}
                >
                  {block.emoji}
                </motion.div>
              ))}
            </div>

            {/* Click Hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[#FF7A1A] font-bold text-lg"
              >
                ⬇️ CLICK OR SPACE ⬇️
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
