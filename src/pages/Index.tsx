import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Item {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  price: number;
  icon: string;
}

interface UserData {
  username: string;
  stars: number;
  inventory: Item[];
  level: number;
  casesOpened: number;
  lastDailyCase?: number;
  usedPromocodes?: string[];
}

interface Promocode {
  code: string;
  reward: {
    stars?: number;
    items?: Item[];
  };
  active: boolean;
}

interface CaseOpenLog {
  username: string;
  item: Item;
  timestamp: number;
}

const cases = [
  { id: 0, name: 'Daily Case', price: 1, color: 'from-green-500 to-emerald-500', isDaily: true },
  { id: 1, name: 'Starter Case', price: 100, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Pro Case', price: 500, color: 'from-purple-500 to-pink-500' },
  { id: 3, name: 'Elite Case', price: 1000, color: 'from-orange-500 to-red-500' },
  { id: 4, name: 'Legend Case', price: 2500, color: 'from-yellow-500 to-amber-500' },
];

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-cyan-500',
  epic: 'from-purple-500 to-pink-500',
  legendary: 'from-yellow-500 to-amber-500',
  mythic: 'from-green-500 to-emerald-500',
};

const allPossibleItems: Item[] = [
  { id: 1, name: 'Common Star', rarity: 'common', price: 50, icon: '⭐' },
  { id: 2, name: 'Bronze Coin', rarity: 'common', price: 75, icon: '🪙' },
  { id: 3, name: 'Rare Gem', rarity: 'rare', price: 200, icon: '💎' },
  { id: 4, name: 'Silver Trophy', rarity: 'rare', price: 300, icon: '🥈' },
  { id: 5, name: 'Epic Crown', rarity: 'epic', price: 750, icon: '👑' },
  { id: 6, name: 'Epic Crystal', rarity: 'epic', price: 900, icon: '💠' },
  { id: 7, name: 'Chocolate', rarity: 'epic', price: 500, icon: '🍫' },
  { id: 8, name: 'Gold Trophy', rarity: 'legendary', price: 3000, icon: '🏆' },
  { id: 9, name: 'Fire Diamond', rarity: 'legendary', price: 4500, icon: '🔥' },
  { id: 10, name: 'PEPE', rarity: 'mythic', price: 1000000, icon: '🐸' },
];

const getRandomItem = (caseId: number): Item => {
  const random = Math.random() * 100;
  
  if (caseId === 0) {
    const availableItems = allPossibleItems.filter(i => i.rarity !== 'legendary' && i.rarity !== 'mythic');
    return availableItems[Math.floor(Math.random() * availableItems.length)];
  }
  
  if (caseId === 4 && random < 1) {
    return allPossibleItems[10];
  }
  
  if (random < 40) {
    const commonItems = allPossibleItems.filter(i => i.rarity === 'common');
    return commonItems[Math.floor(Math.random() * commonItems.length)];
  } else if (random < 70) {
    const rareItems = allPossibleItems.filter(i => i.rarity === 'rare');
    return rareItems[Math.floor(Math.random() * rareItems.length)];
  } else if (random < 90) {
    const epicItems = allPossibleItems.filter(i => i.rarity === 'epic');
    return epicItems[Math.floor(Math.random() * epicItems.length)];
  } else {
    const legendaryItems = allPossibleItems.filter(i => i.rarity === 'legendary');
    return legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
  }
};

const upgradeChances: Record<string, Record<string, { chance: number, items: string[] }>> = {
  'common': {
    'rare': { chance: 80, items: ['Rare Gem', 'Silver Trophy'] },
  },
  'rare': {
    'epic': { chance: 60, items: ['Epic Crown', 'Epic Crystal', 'Chocolate'] },
  },
  'epic': {
    'legendary': { chance: 40, items: ['Gold Trophy', 'Fire Diamond'] },
  },
  'legendary': {
    'mythic': { chance: 5, items: ['PEPE'] },
  },
};

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'cases' | 'inventory' | 'upgrade' | 'profile' | 'rating' | 'admin'>('home');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [rouletteItems, setRouletteItems] = useState<Item[]>([]);
  const [dailyTimeLeft, setDailyTimeLeft] = useState('');
  const rouletteRef = useRef<HTMLDivElement>(null);
  
  const [selectedItemFrom, setSelectedItemFrom] = useState<Item | null>(null);
  const [selectedItemTo, setSelectedItemTo] = useState<Item | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<'success' | 'fail' | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  
  const [promocode, setPromocode] = useState('');
  const [promocodes, setPromocodes] = useState<Promocode[]>([]);
  const [caseOpenLogs, setCaseOpenLogs] = useState<CaseOpenLog[]>([]);
  const [ratingTimer, setRatingTimer] = useState(15);
  
  const [adminNewPromocode, setAdminNewPromocode] = useState('');
  const [adminPromoStars, setAdminPromoStars] = useState(0);
  const [adminGiftStars, setAdminGiftStars] = useState(0);
  const [adminGiftItem, setAdminGiftItem] = useState<Item | null>(null);
  
  const playRouletteTickSound = () => {
    const audioContext = new AudioContext();
    let tickCount = 0;
    const maxTicks = 30;
    const baseInterval = 50;
    
    const playTick = () => {
      if (tickCount >= maxTicks) return;
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      osc.start();
      osc.stop(audioContext.currentTime + 0.05);
      
      tickCount++;
      const nextInterval = baseInterval + tickCount * 3;
      if (tickCount < maxTicks) {
        setTimeout(playTick, nextInterval);
      }
    };
    
    playTick();
  };

  const playSound = (type: 'open' | 'spin' | 'win' | 'legendary' | 'mythic') => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'open') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'spin') {
      playRouletteTickSound();
      return;
    } else if (type === 'win') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'legendary') {
      for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(400 + i * 200, audioContext.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
      }
    } else if (type === 'mythic') {
      for (let i = 0; i < 5; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(523 + i * 100, audioContext.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.4);
        osc.start(audioContext.currentTime + i * 0.08);
        osc.stop(audioContext.currentTime + i * 0.08 + 0.4);
      }
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      setIsLoggedIn(true);
    }
    
    const savedPromocodes = localStorage.getItem('promocodes');
    if (savedPromocodes) {
      setPromocodes(JSON.parse(savedPromocodes));
    }
    
    const savedLogs = localStorage.getItem('caseOpenLogs');
    if (savedLogs) {
      setCaseOpenLogs(JSON.parse(savedLogs));
    }
  }, []);
  
  useEffect(() => {
    if (activeTab === 'rating') {
      const interval = setInterval(() => {
        setRatingTimer((prev) => {
          if (prev <= 1) {
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userData?.lastDailyCase) {
        const now = Date.now();
        const timeLeft = 24 * 60 * 60 * 1000 - (now - userData.lastDailyCase);
        
        if (timeLeft <= 0) {
          setDailyTimeLeft('');
        } else {
          const hours = Math.floor(timeLeft / (60 * 60 * 1000));
          const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
          setDailyTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [userData]);

  const handleAuth = () => {
    if (!username || !password) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (isRegistering) {
      if (users[username]) {
        alert('Пользователь уже существует!');
        return;
      }
      const newUser: UserData = {
        username,
        stars: 5000,
        inventory: [],
        level: 0,
        casesOpened: 0,
      };
      users[username] = { password, data: newUser };
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setUserData(newUser);
      setIsLoggedIn(true);
    } else {
      if (!users[username] || users[username].password !== password) {
        alert('Неверный логин или пароль!');
        return;
      }
      const user = users[username].data;
      setUserData(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsLoggedIn(true);
    }
  };

  const saveUserData = (data: UserData) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[data.username]) {
      users[data.username].data = data;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(data));
      setUserData(data);
    }
  };

  const canOpenDailyCase = () => {
    if (!userData?.lastDailyCase) return true;
    const now = Date.now();
    return now - userData.lastDailyCase >= 24 * 60 * 60 * 1000;
  };

  const openCase = (caseId: number, casePrice: number) => {
    if (!userData || userData.stars < casePrice || isSpinning) return;
    
    if (caseId === 0 && !canOpenDailyCase()) return;

    playSound('open');
    
    const updatedUser = { ...userData, stars: userData.stars - casePrice };
    if (caseId === 0) {
      updatedUser.lastDailyCase = Date.now();
    }
    setUserData(updatedUser);
    setIsSpinning(true);
    setWonItem(null);

    const winningItem = getRandomItem(caseId);
    const items: Item[] = [];
    
    for (let i = 0; i < 50; i++) {
      items.push(getRandomItem(caseId));
    }
    items.push(winningItem);
    
    for (let i = 0; i < 20; i++) {
      items.push(getRandomItem(caseId));
    }
    
    setRouletteItems(items);
    setWonItem(winningItem);

    setTimeout(() => {
      playSound('spin');
      if (rouletteRef.current) {
        const containerWidth = window.innerWidth;
        const itemWidth = 150;
        const gap = 16;
        const itemWithGap = itemWidth + gap;
        const winningIndex = 50;
        const centerOffset = containerWidth / 2;
        const targetPosition = -(winningIndex * itemWithGap + itemWidth / 2 - centerOffset);
        
        rouletteRef.current.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        rouletteRef.current.style.transform = `translateX(${targetPosition}px)`;
      }
    }, 100);

    setTimeout(() => {
      if (winningItem.rarity === 'mythic') {
        playSound('mythic');
      } else if (winningItem.rarity === 'legendary') {
        playSound('legendary');
      } else {
        playSound('win');
      }
      const newInventory = [...updatedUser.inventory, { ...winningItem, id: Date.now() }];
      const newCasesOpened = updatedUser.casesOpened + 1;
      const newLevel = Math.floor(newCasesOpened / 10);
      
      const finalUser = {
        ...updatedUser,
        inventory: newInventory,
        casesOpened: newCasesOpened,
        level: newLevel,
      };
      
      const newLog: CaseOpenLog = {
        username: finalUser.username,
        item: winningItem,
        timestamp: Date.now(),
      };
      const updatedLogs = [newLog, ...caseOpenLogs].slice(0, 10);
      setCaseOpenLogs(updatedLogs);
      localStorage.setItem('caseOpenLogs', JSON.stringify(updatedLogs));
      
      saveUserData(finalUser);
      setIsSpinning(false);
      
      if (rouletteRef.current) {
        rouletteRef.current.style.transition = 'none';
        rouletteRef.current.style.transform = 'translateX(0)';
      }
    }, 3200);
  };

  const sellItem = (itemId: number) => {
    if (!userData) return;
    const item = userData.inventory.find(i => i.id === itemId);
    if (item) {
      playSound('win');
      const updatedUser = {
        ...userData,
        stars: userData.stars + item.price,
        inventory: userData.inventory.filter(i => i.id !== itemId),
      };
      saveUserData(updatedUser);
    }
  };

  const getAvailableUpgrades = (fromRarity: string) => {
    const upgrades = upgradeChances[fromRarity];
    if (!upgrades) return [];
    
    const result: { rarity: string, items: Item[], chance: number }[] = [];
    Object.entries(upgrades).forEach(([toRarity, config]) => {
      const items = allPossibleItems.filter(i => config.items.includes(i.name));
      result.push({ rarity: toRarity, items, chance: config.chance });
    });
    return result;
  };

  const startUpgrade = () => {
    if (!selectedItemFrom || !selectedItemTo || !userData || isUpgrading) return;
    
    const upgradeConfig = upgradeChances[selectedItemFrom.rarity]?.[selectedItemTo.rarity];
    if (!upgradeConfig) {
      alert('Невозможное улучшение!');
      return;
    }
    
    const chance = upgradeConfig.chance;
    
    setIsUpgrading(true);
    playRouletteTickSound();
    
    const successAngle = chance * 3.6;
    const randomResult = Math.random() * 100 < chance;
    const targetRotation = 1800 + (randomResult ? Math.random() * successAngle : successAngle + Math.random() * (360 - successAngle));
    
    setWheelRotation(targetRotation);
    
    setTimeout(() => {
      if (randomResult) {
        if (selectedItemTo.rarity === 'mythic') {
          playSound('mythic');
        } else if (selectedItemTo.rarity === 'legendary') {
          playSound('legendary');
        } else {
          playSound('win');
        }
        setUpgradeResult('success');
        const newInventory = userData.inventory.filter(i => i.id !== selectedItemFrom.id);
        newInventory.push({ ...selectedItemTo, id: Date.now() });
        saveUserData({ ...userData, inventory: newInventory });
      } else {
        playSound('open');
        setUpgradeResult('fail');
        const newInventory = userData.inventory.filter(i => i.id !== selectedItemFrom.id);
        saveUserData({ ...userData, inventory: newInventory });
      }
      
      setTimeout(() => {
        setIsUpgrading(false);
        setUpgradeResult(null);
        setWheelRotation(0);
        setSelectedItemFrom(null);
        setSelectedItemTo(null);
      }, 2000);
    }, 3000);
  };

  const activatePromocode = () => {
    if (!userData || !promocode.trim()) return;
    
    const promo = promocodes.find(p => p.code === promocode.toUpperCase() && p.active);
    if (!promo) {
      alert('Промокод недействителен!');
      return;
    }
    
    if (userData.usedPromocodes?.includes(promo.code)) {
      alert('Вы уже использовали этот промокод!');
      return;
    }
    
    const updatedUser = { ...userData };
    if (promo.reward.stars) {
      updatedUser.stars += promo.reward.stars;
    }
    if (promo.reward.items) {
      updatedUser.inventory = [...updatedUser.inventory, ...promo.reward.items.map(item => ({ ...item, id: Date.now() + Math.random() }))];
    }
    updatedUser.usedPromocodes = [...(updatedUser.usedPromocodes || []), promo.code];
    
    saveUserData(updatedUser);
    setPromocode('');
    alert(`Промокод активирован! ${promo.reward.stars ? `+${promo.reward.stars} звезд` : ''}`);
  };
  
  const adminCreatePromocode = () => {
    if (!adminNewPromocode.trim() || userData?.username !== 'Arbuz0') return;
    
    const newPromo: Promocode = {
      code: adminNewPromocode.toUpperCase(),
      reward: { stars: adminPromoStars },
      active: true,
    };
    
    const updated = [...promocodes, newPromo];
    setPromocodes(updated);
    localStorage.setItem('promocodes', JSON.stringify(updated));
    setAdminNewPromocode('');
    setAdminPromoStars(0);
    alert('Промокод создан!');
  };
  
  const adminDeletePromocode = (code: string) => {
    if (userData?.username !== 'Arbuz0') return;
    const updated = promocodes.filter(p => p.code !== code);
    setPromocodes(updated);
    localStorage.setItem('promocodes', JSON.stringify(updated));
  };
  
  const adminGiveGift = () => {
    if (userData?.username !== 'Arbuz0') return;
    
    const updatedUser = { ...userData };
    if (adminGiftStars > 0) {
      updatedUser.stars += adminGiftStars;
    }
    if (adminGiftItem) {
      updatedUser.inventory = [...updatedUser.inventory, { ...adminGiftItem, id: Date.now() }];
    }
    
    saveUserData(updatedUser);
    setAdminGiftStars(0);
    setAdminGiftItem(null);
    alert('Подарок выдан!');
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setUserData(null);
    setUsername('');
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-2 border-primary/30 neon-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold neon-glow mb-2">CASE SPINNER</h1>
            <p className="text-muted-foreground">
              {isRegistering ? 'Создать аккаунт' : 'Войти в аккаунт'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="mt-2"
              />
            </div>
            
            <Button onClick={handleAuth} className="w-full">
              {isRegistering ? 'ЗАРЕГИСТРИРОВАТЬСЯ' : 'ВОЙТИ'}
            </Button>
            
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-sm text-primary hover:underline"
            >
              {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!userData) return null;

  const getUpgradeChance = () => {
    if (!selectedItemFrom || !selectedItemTo) return 0;
    const config = upgradeChances[selectedItemFrom.rarity]?.[selectedItemTo.rarity];
    return config?.chance || 0;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold neon-glow">CASE SPINNER</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg neon-border">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold">{userData.stars.toLocaleString()}</span>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-primary/20 bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'home', label: 'Главная', icon: 'Home' },
              { key: 'cases', label: 'Кейсы', icon: 'Package' },
              { key: 'inventory', label: 'Инвентарь', icon: 'Backpack' },
              { key: 'upgrade', label: 'Улучшения', icon: 'ArrowUpCircle' },
              { key: 'profile', label: 'Профиль', icon: 'User' },
              { key: 'rating', label: 'Рейтинг', icon: 'Trophy' },
              ...(userData.username === 'Arbuz0' ? [{ key: 'admin', label: 'Админ', icon: 'Shield' }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'text-primary border-b-2 border-primary neon-glow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon as any} size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card className="p-4 bg-card/80 border-primary/30">
                  <h3 className="text-lg font-bold mb-3 neon-glow">🎁 ПОСЛЕДНИЕ ДРОПЫ</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {caseOpenLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Пока никто не открывал кейсы</p>
                    ) : (
                      caseOpenLogs.map((log, idx) => (
                        <div key={idx} className={`p-2 rounded-lg bg-gradient-to-r ${rarityColors[log.item.rarity]} border border-white/20 animate-fade-in`}>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{log.item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{log.username}</p>
                              <p className="text-xs text-white/80 truncate">{log.item.name}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
                
                <Card className="p-4 bg-card/80 border-primary/30">
                  <h3 className="text-lg font-bold mb-3">🎟️ ПРОМОКОД</h3>
                  <div className="space-y-2">
                    <Input
                      value={promocode}
                      onChange={(e) => setPromocode(e.target.value.toUpperCase())}
                      placeholder="ВВЕДИ КОД"
                      className="text-center font-bold"
                    />
                    <Button onClick={activatePromocode} className="w-full">
                      АКТИВИРОВАТЬ
                    </Button>
                  </div>
                </Card>
              </div>
              
              <div className="lg:col-span-3 space-y-4">
                <div className="text-center space-y-4">
                  <h2 className="text-6xl font-bold neon-glow animate-pulse-glow">
                    ОТКРЫВАЙ КЕЙСЫ
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Получай эксклюзивные NFT и продавай их за звёзды
                  </p>
                  <p className="text-2xl font-bold text-accent gold-glow">
                    🐸 PEPE - 1% шанс в Legend Case!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cases.map((caseItem) => {
                const isDaily = caseItem.isDaily;
                const canOpen = isDaily ? canOpenDailyCase() : userData.stars >= caseItem.price;
                
                return (
                  <Card
                    key={caseItem.id}
                    className={`p-6 bg-gradient-to-br ${caseItem.color} border-2 border-primary/50 hover:scale-105 transition-transform cursor-pointer animate-fade-in ${!canOpen ? 'opacity-50' : ''}`}
                    onClick={() => canOpen && openCase(caseItem.id, caseItem.price)}
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl">📦</div>
                      <h3 className="text-2xl font-bold text-white">{caseItem.name}</h3>
                      {isDaily && !canOpen ? (
                        <div className="text-white text-sm">
                          <div className="font-bold">⏰ {dailyTimeLeft}</div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <span className="text-xl">⭐</span>
                          <span className="text-xl font-bold">{caseItem.price}</span>
                        </div>
                      )}
                      <Button 
                        className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                        disabled={!canOpen}
                      >
                        {isDaily && !canOpen ? 'ЖДИТЕ' : 'ОТКРЫТЬ'}
                      </Button>
                    </div>
                  </Card>
                );
                  })}
                </div>
              </div>
            </div>

            {isSpinning && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="relative w-full h-48 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-1 h-48 bg-primary shadow-[0_0_20px_hsl(var(--primary))]"></div>
                  </div>
                  
                  <div
                    ref={rouletteRef}
                    className="flex items-center h-full px-4"
                    style={{ transform: 'translateX(0)', gap: '16px' }}
                  >
                    {rouletteItems.map((item, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 bg-gradient-to-br ${rarityColors[item.rarity]} rounded-lg border-2 border-white/30 flex flex-col items-center justify-center`}
                        style={{ width: '150px', height: '128px' }}
                      >
                        <div className="text-5xl">{item.icon}</div>
                        <div className="text-xs text-white font-bold mt-1">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="text-2xl font-bold neon-glow mt-8">ОТКРЫВАЕМ КЕЙС...</p>
              </div>
            )}

            {wonItem && !isSpinning && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <Card className={`p-8 bg-gradient-to-br ${rarityColors[wonItem.rarity]} border-4 border-white animate-fade-in`}>
                  <div className="text-center space-y-4">
                    <div className="text-8xl">{wonItem.icon}</div>
                    <h3 className="text-4xl font-bold text-white">{wonItem.name}</h3>
                    <Badge className="text-lg px-4 py-2">{wonItem.rarity.toUpperCase()}</Badge>
                    <div className="flex items-center justify-center gap-2 text-white">
                      <span className="text-2xl">⭐</span>
                      <span className="text-2xl font-bold">{wonItem.price.toLocaleString()}</span>
                    </div>
                    <Button onClick={() => setWonItem(null)} className="bg-white text-black hover:bg-gray-200">
                      ЗАБРАТЬ
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold neon-glow">ВСЕ КЕЙСЫ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {cases.map((caseItem) => {
                const isDaily = caseItem.isDaily;
                const canOpen = isDaily ? canOpenDailyCase() : userData.stars >= caseItem.price;
                
                return (
                  <Card
                    key={caseItem.id}
                    className={`p-6 bg-gradient-to-br ${caseItem.color} border-2 border-primary/50 hover:scale-105 transition-transform cursor-pointer ${!canOpen ? 'opacity-50' : ''}`}
                    onClick={() => canOpen && openCase(caseItem.id, caseItem.price)}
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl">📦</div>
                      <h3 className="text-2xl font-bold text-white">{caseItem.name}</h3>
                      {isDaily && !canOpen ? (
                        <div className="text-white text-sm">
                          <div className="font-bold">⏰ {dailyTimeLeft}</div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <span className="text-xl">⭐</span>
                          <span className="text-xl font-bold">{caseItem.price}</span>
                        </div>
                      )}
                      <Button 
                        className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                        disabled={!canOpen}
                      >
                        {isDaily && !canOpen ? 'ЖДИТЕ' : 'ОТКРЫТЬ'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold neon-glow">МОЙ ИНВЕНТАРЬ</h2>
            {userData.inventory.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Package" size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Инвентарь пуст. Открой кейсы!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {userData.inventory.map((item) => (
                  <Card
                    key={item.id}
                    className={`p-4 bg-gradient-to-br ${rarityColors[item.rarity]} border-2 border-primary/30`}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-5xl">{item.icon}</div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <div className="flex items-center justify-center gap-1 text-white text-sm">
                        <span>⭐</span>
                        <span className="font-bold">{item.price.toLocaleString()}</span>
                      </div>
                      <Button
                        onClick={() => sellItem(item.id)}
                        size="sm"
                        className="w-full bg-white/20 hover:bg-white/30 text-white"
                      >
                        ПРОДАТЬ
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold neon-glow text-center">УЛУЧШЕНИЯ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 bg-card border-2 border-primary/30">
                <h3 className="text-xl font-bold mb-4">Что улучшаем?</h3>
                <Select onValueChange={(value) => {
                  const item = userData.inventory.find(i => i.id === Number(value));
                  setSelectedItemFrom(item || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {userData.inventory.filter(i => i.rarity !== 'mythic').map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.icon} {item.name} ({item.rarity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedItemFrom && (
                  <div className="mt-4">
                    <Card className={`p-4 bg-gradient-to-br ${rarityColors[selectedItemFrom.rarity]}`}>
                      <div className="text-center">
                        <div className="text-6xl">{selectedItemFrom.icon}</div>
                        <div className="text-white font-bold mt-2">{selectedItemFrom.name}</div>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-card border-2 border-secondary/30">
                <h3 className="text-xl font-bold mb-4">Что хотим получить?</h3>
                <Select 
                  disabled={!selectedItemFrom}
                  onValueChange={(value) => {
                    const item = allPossibleItems.find(i => `${i.name}-${i.rarity}` === value);
                    setSelectedItemTo(item ? { ...item, id: Date.now() } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedItemFrom ? "Выберите предмет" : "Сначала выберите предмет для улучшения"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedItemFrom && getAvailableUpgrades(selectedItemFrom.rarity).map(upgrade => 
                      upgrade.items.map((item) => (
                        <SelectItem key={`${item.name}-${item.rarity}`} value={`${item.name}-${item.rarity}`}>
                          {item.icon} {item.name} ({item.rarity}) - {upgrade.chance}%
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                
                {selectedItemTo && (
                  <div className="mt-4">
                    <Card className={`p-4 bg-gradient-to-br ${rarityColors[selectedItemTo.rarity]}`}>
                      <div className="text-center">
                        <div className="text-6xl">{selectedItemTo.icon}</div>
                        <div className="text-white font-bold mt-2">{selectedItemTo.name}</div>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            </div>

            {selectedItemFrom && selectedItemTo && (
              <Card className="p-8 bg-card border-2 border-accent/30">
                <div className="text-center space-y-6">
                  <div className="relative w-80 h-80 mx-auto">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        strokeDasharray={`${getUpgradeChance() * 2.827} ${(100 - getUpgradeChance()) * 2.827}`}
                        className="drop-shadow-[0_0_10px_hsl(var(--primary))]" 
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--destructive))"
                        strokeWidth="10"
                        strokeDasharray={`${(100 - getUpgradeChance()) * 2.827} ${getUpgradeChance() * 2.827}`}
                        strokeDashoffset={`${-getUpgradeChance() * 2.827}`}
                        className="drop-shadow-[0_0_10px_hsl(var(--destructive))]"
                      />
                    </svg>
                    
                    <div 
                      className="absolute top-0 left-1/2 origin-bottom"
                      style={{ 
                        transform: `translateX(-50%) rotate(${wheelRotation}deg)`,
                        transition: isUpgrading ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                        height: '50%'
                      }}
                    >
                      <svg width="24" height="40" viewBox="0 0 24 40" className="drop-shadow-[0_0_10px_white]">
                        <polygon points="12,0 0,40 24,40" fill="white" />
                      </svg>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/90 rounded-full w-32 h-32 flex items-center justify-center border-4 border-primary/50">
                        <div className="text-4xl font-bold neon-glow">
                          {getUpgradeChance()}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl">Шанс успеха: <span className="font-bold text-primary">{getUpgradeChance()}%</span></p>
                    <p className="text-sm text-muted-foreground">При неудаче предмет будет утерян!</p>
                  </div>
                  
                  <Button 
                    onClick={startUpgrade} 
                    disabled={isUpgrading || getUpgradeChance() === 0}
                    className="w-full max-w-xs"
                    size="lg"
                  >
                    {isUpgrading ? 'УЛУЧШАЕМ...' : 'УЛУЧШИТЬ'}
                  </Button>
                </div>
              </Card>
            )}

            {upgradeResult && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <Card className={`p-8 ${upgradeResult === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-orange-500'} border-4 border-white animate-fade-in`}>
                  <div className="text-center space-y-4">
                    <div className="text-8xl">{upgradeResult === 'success' ? '✅' : '❌'}</div>
                    <h3 className="text-4xl font-bold text-white">
                      {upgradeResult === 'success' ? 'УСПЕХ!' : 'НЕУДАЧА!'}
                    </h3>
                    <p className="text-xl text-white">
                      {upgradeResult === 'success' ? 'Предмет улучшен!' : 'Предмет потерян!'}
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-8 bg-card border-2 border-primary/30">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl neon-border">
                  👤
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">{userData.username}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Star" size={16} />
                      Уровень {userData.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Package" size={16} />
                      Открыто кейсов: {userData.casesOpened}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-2 border-primary/30">
              <h3 className="text-2xl font-bold mb-4">Статистика</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Прогресс до следующего уровня</span>
                    <span className="font-bold">{userData.casesOpened % 10}/10</span>
                  </div>
                  <Progress value={(userData.casesOpened % 10) * 10} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">{userData.stars.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Текущий баланс</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-secondary">{userData.inventory.length}</div>
                    <div className="text-sm text-muted-foreground">В инвентаре</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'rating' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold neon-glow">РЕЙТИНГ ИГРОКОВ</h2>
              <Card className="p-3 bg-primary/20 border-primary/30">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={20} />
                  <span className="text-lg font-bold">Обновление через: {ratingTimer}с</span>
                </div>
              </Card>
            </div>
            <Card className="p-6 bg-card border-2 border-primary/30">
              <div className="space-y-4">
                {(() => {
                  const users = JSON.parse(localStorage.getItem('users') || '{}');
                  const allUsers = Object.values(users).map((u: any) => u.data) as UserData[];
                  allUsers.sort((a, b) => b.stars - a.stars);
                  
                  const topUsers = allUsers.slice(0, 10);
                  
                  return topUsers.map((user, index) => (
                    <div
                      key={user.username}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        user.username === userData.username
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold w-8">{index + 1}</span>
                        <span className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                        </span>
                        <div>
                          <div className="text-xl font-semibold">{user.username}</div>
                          <div className="text-sm text-muted-foreground">Уровень {user.level}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⭐</span>
                        <span className="text-xl font-bold">{user.stars.toLocaleString()}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'admin' && userData.username === 'Arbuz0' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold neon-glow">⚡ АДМИН ПАНЕЛЬ</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-2 border-primary/30">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Gift" size={24} />
                  Выдать себе подарки
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label>Звезды</Label>
                    <Input
                      type="number"
                      value={adminGiftStars}
                      onChange={(e) => setAdminGiftStars(Number(e.target.value))}
                      placeholder="Количество звезд"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Выбрать предмет</Label>
                    <Select onValueChange={(value) => {
                      const item = allPossibleItems.find(i => i.name === value);
                      setAdminGiftItem(item || null);
                    }}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        {allPossibleItems.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.icon} {item.name} ({item.rarity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {adminGiftItem && (
                    <Card className={`p-4 bg-gradient-to-br ${rarityColors[adminGiftItem.rarity]}`}>
                      <div className="text-center">
                        <div className="text-4xl">{adminGiftItem.icon}</div>
                        <div className="text-white font-bold">{adminGiftItem.name}</div>
                      </div>
                    </Card>
                  )}
                  
                  <Button onClick={adminGiveGift} className="w-full" size="lg">
                    ВЫДАТЬ ПОДАРОК
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 bg-card border-2 border-primary/30">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Ticket" size={24} />
                  Управление промокодами
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Новый промокод</Label>
                    <Input
                      value={adminNewPromocode}
                      onChange={(e) => setAdminNewPromocode(e.target.value.toUpperCase())}
                      placeholder="КОД"
                      className="mt-2 font-bold"
                    />
                  </div>
                  
                  <div>
                    <Label>Награда (звезды)</Label>
                    <Input
                      type="number"
                      value={adminPromoStars}
                      onChange={(e) => setAdminPromoStars(Number(e.target.value))}
                      placeholder="Количество звезд"
                      className="mt-2"
                    />
                  </div>
                  
                  <Button onClick={adminCreatePromocode} className="w-full" size="lg">
                    СОЗДАТЬ ПРОМОКОД
                  </Button>
                  
                  <div className="mt-6 space-y-2">
                    <h4 className="font-bold">Активные промокоды:</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {promocodes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Нет промокодов</p>
                      ) : (
                        promocodes.map((promo) => (
                          <div key={promo.code} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <div className="font-bold">{promo.code}</div>
                              <div className="text-sm text-muted-foreground">
                                {promo.reward.stars && `⭐ ${promo.reward.stars} звезд`}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => adminDeletePromocode(promo.code)}
                            >
                              Удалить
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}