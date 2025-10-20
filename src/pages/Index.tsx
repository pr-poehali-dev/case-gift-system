import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Item {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  icon: string;
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
};

const mockItems: Item[] = [
  { id: 1, name: 'Common Star', rarity: 'common', price: 50, icon: '⭐' },
  { id: 2, name: 'Rare Gem', rarity: 'rare', price: 200, icon: '💎' },
  { id: 3, name: 'Epic Coin', rarity: 'epic', price: 750, icon: '🪙' },
  { id: 4, name: 'Legendary Trophy', rarity: 'legendary', price: 3000, icon: '🏆' },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<'home' | 'cases' | 'inventory' | 'shop' | 'profile' | 'rating'>('home');
  const [stars, setStars] = useState(5000);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<Item | null>(null);

  const openCase = (casePrice: number) => {
    if (stars < casePrice || isSpinning) return;
    
    setStars(stars - casePrice);
    setIsSpinning(true);
    setWonItem(null);

    setTimeout(() => {
      const random = Math.random();
      let item: Item;
      if (random < 0.5) item = mockItems[0];
      else if (random < 0.8) item = mockItems[1];
      else if (random < 0.95) item = mockItems[2];
      else item = mockItems[3];

      setWonItem(item);
      setInventory([...inventory, { ...item, id: Date.now() }]);
      setIsSpinning(false);
    }, 3000);
  };

  const sellItem = (itemId: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      setStars(stars + item.price);
      setInventory(inventory.filter(i => i.id !== itemId));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold neon-glow">CASE SPINNER</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg neon-border">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold">{stars.toLocaleString()}</span>
            </div>
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
              { key: 'shop', label: 'Магазин', icon: 'ShoppingCart' },
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`p-6 bg-gradient-to-br ${caseItem.color} border-2 border-primary/50 hover:scale-105 transition-transform cursor-pointer animate-fade-in`}
                  onClick={() => openCase(caseItem.price)}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📦</div>
                    <h3 className="text-2xl font-bold text-white">{caseItem.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-white">
                      <span className="text-xl">⭐</span>
                      <span className="text-xl font-bold">{caseItem.price}</span>
                    </div>
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold">
                      ОТКРЫТЬ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {isSpinning && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="text-6xl animate-spin">🎰</div>
                  <p className="text-2xl font-bold neon-glow">ОТКРЫВАЕМ КЕЙС...</p>
                  <Progress value={66} className="w-64" />
                </div>
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
                      <span className="text-2xl font-bold">{wonItem.price}</span>
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
                  onClick={() => openCase(caseItem.price)}
                >
                  <div className="text-center space-y-4">
                    <div className="text-6xl">📦</div>
                    <h3 className="text-2xl font-bold text-white">{caseItem.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-white">
                      <span className="text-xl">⭐</span>
                      <span className="text-xl font-bold">{caseItem.price}</span>
                    </div>
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold">
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
            {inventory.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Package" size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Инвентарь пуст. Открой кейсы!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {inventory.map((item) => (
                  <Card
                    key={item.id}
                    className={`p-4 bg-gradient-to-br ${rarityColors[item.rarity]} border-2 border-primary/30`}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-5xl">{item.icon}</div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <div className="flex items-center justify-center gap-1 text-white text-sm">
                        <span>⭐</span>
                        <span className="font-bold">{item.price}</span>
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

        {activeTab === 'shop' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold neon-glow">МАГАЗИН</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card border-2 border-primary/30">
                <div className="text-center space-y-4">
                  <div className="text-6xl">⭐</div>
                  <h3 className="text-2xl font-bold">1000 Звёзд</h3>
                  <p className="text-3xl font-bold text-primary">$4.99</p>
                  <Button className="w-full">КУПИТЬ</Button>
                </div>
              </Card>
              <Card className="p-6 bg-card border-2 border-secondary/30">
                <div className="text-center space-y-4">
                  <div className="text-6xl">⭐</div>
                  <h3 className="text-2xl font-bold">5000 Звёзд</h3>
                  <p className="text-3xl font-bold text-secondary">$19.99</p>
                  <Button className="w-full">КУПИТЬ</Button>
                </div>
              </Card>
              <Card className="p-6 bg-card border-2 border-accent/30">
                <div className="text-center space-y-4">
                  <div className="text-6xl gold-glow">⭐</div>
                  <h3 className="text-2xl font-bold">15000 Звёзд</h3>
                  <p className="text-3xl font-bold text-accent">$49.99</p>
                  <Button className="w-full">КУПИТЬ</Button>
                </div>
              </Card>
            </div>
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
                  <h2 className="text-3xl font-bold">Player #42069</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Star" size={16} />
                      Уровень 15
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Package" size={16} />
                      Открыто кейсов: {inventory.length}
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
                    <span>Всего открыто кейсов</span>
                    <span className="font-bold">{inventory.length}</span>
                  </div>
                  <Progress value={(inventory.length / 100) * 100} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">{stars.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Текущий баланс</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-secondary">{inventory.length}</div>
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
                {[
                  { rank: 1, name: 'ProGamer2000', stars: 125000, icon: '🥇' },
                  { rank: 2, name: 'LuckyStar', stars: 98000, icon: '🥈' },
                  { rank: 3, name: 'CaseKing', stars: 87000, icon: '🥉' },
                  { rank: 4, name: 'Player #42069', stars: stars, icon: '👤' },
                  { rank: 5, name: 'Spinner123', stars: 45000, icon: '⭐' },
                ].map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.name === 'Player #42069'
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold w-8">{player.rank}</span>
                      <span className="text-3xl">{player.icon}</span>
                      <span className="text-xl font-semibold">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      <span className="text-xl font-bold">{player.stars.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
