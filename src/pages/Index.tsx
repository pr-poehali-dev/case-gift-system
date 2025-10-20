import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
}

const cases = [
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
  { id: 7, name: 'Gold Trophy', rarity: 'legendary', price: 3000, icon: '🏆' },
  { id: 8, name: 'Fire Diamond', rarity: 'legendary', price: 4500, icon: '🔥' },
  { id: 9, name: 'PEPE', rarity: 'mythic', price: 1000000, icon: '🐸' },
];

const getRandomItem = (caseId: number): Item => {
  const random = Math.random() * 100;
  
  if (caseId === 4 && random < 1) {
    return allPossibleItems[8];
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

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'cases' | 'inventory' | 'profile' | 'rating'>('home');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const [rouletteItems, setRouletteItems] = useState<Item[]>([]);
  const rouletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      setIsLoggedIn(true);
    }
  }, []);

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

  const openCase = (caseId: number, casePrice: number) => {
    if (!userData || userData.stars < casePrice || isSpinning) return;

    const updatedUser = { ...userData, stars: userData.stars - casePrice };
    setUserData(updatedUser);
    setIsSpinning(true);
    setWonItem(null);

    const items: Item[] = [];
    for (let i = 0; i < 50; i++) {
      items.push(getRandomItem(caseId));
    }
    const winningItem = getRandomItem(caseId);
    items.push(winningItem);
    
    for (let i = 0; i < 20; i++) {
      items.push(getRandomItem(caseId));
    }
    
    setRouletteItems(items);

    setTimeout(() => {
      if (rouletteRef.current) {
        const itemWidth = 150;
        const targetPosition = -(50 * itemWidth - window.innerWidth / 2 + itemWidth / 2);
        rouletteRef.current.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        rouletteRef.current.style.transform = `translateX(${targetPosition}px)`;
      }
    }, 100);

    setTimeout(() => {
      setWonItem(winningItem);
      const newInventory = [...updatedUser.inventory, { ...winningItem, id: Date.now() }];
      const newCasesOpened = updatedUser.casesOpened + 1;
      const newLevel = Math.floor(newCasesOpened / 10);
      
      const finalUser = {
        ...updatedUser,
        inventory: newInventory,
        casesOpened: newCasesOpened,
        level: newLevel,
      };
      
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
      const updatedUser = {
        ...userData,
        stars: userData.stars + item.price,
        inventory: userData.inventory.filter(i => i.id !== itemId),
      };
      saveUserData(updatedUser);
    }
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
              { key: 'profile', label: 'Профиль', icon: 'User' },
              { key: 'rating', label: 'Рейтинг', icon: 'Trophy' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`p-6 bg-gradient-to-br ${caseItem.color} border-2 border-primary/50 hover:scale-105 transition-transform cursor-pointer animate-fade-in`}
                  onClick={() => openCase(caseItem.id, caseItem.price)}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📦</div>
                    <h3 className="text-2xl font-bold text-white">{caseItem.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-white">
                      <span className="text-xl">⭐</span>
                      <span className="text-xl font-bold">{caseItem.price}</span>
                    </div>
                    <Button 
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                      disabled={userData.stars < caseItem.price}
                    >
                      ОТКРЫТЬ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {isSpinning && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="relative w-full h-48 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-1 h-48 bg-primary shadow-[0_0_20px_hsl(var(--primary))]"></div>
                  </div>
                  
                  <div
                    ref={rouletteRef}
                    className="flex items-center h-full gap-4 px-4"
                    style={{ transform: 'translateX(0)' }}
                  >
                    {rouletteItems.map((item, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 w-32 h-32 bg-gradient-to-br ${rarityColors[item.rarity]} rounded-lg border-2 border-white/30 flex flex-col items-center justify-center`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`p-6 bg-gradient-to-br ${caseItem.color} border-2 border-primary/50 hover:scale-105 transition-transform cursor-pointer`}
                  onClick={() => openCase(caseItem.id, caseItem.price)}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📦</div>
                    <h3 className="text-2xl font-bold text-white">{caseItem.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-white">
                      <span className="text-xl">⭐</span>
                      <span className="text-xl font-bold">{caseItem.price}</span>
                    </div>
                    <Button 
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                      disabled={userData.stars < caseItem.price}
                    >
                      ОТКРЫТЬ
                    </Button>
                  </div>
                </Card>
              ))}
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
            <h2 className="text-4xl font-bold neon-glow">РЕЙТИНГ ИГРОКОВ</h2>
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
      </main>
    </div>
  );
}
