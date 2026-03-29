/**
 * World Map System - Hệ thống bản đồ phiêu lưu
 * Mở khóa vùng đất mới, khám phá sticker và pet
 */

class WorldMapSystem {
  constructor() {
    this.worlds = [];
    this.unlockedWorlds = ['starter-village'];
    this.currentWorld = 'starter-village';
    this.completedQuests = [];

    this.loadWorldData();
  }

  // Lưu dữ liệu bản đồ
  loadWorldData() {
    const savedData = localStorage.getItem('worldMapData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.unlockedWorlds = data.unlockedWorlds || ['starter-village'];
      this.currentWorld = data.currentWorld || 'starter-village';
      this.completedQuests = data.completedQuests || [];
    }
  }

  // Lưu dữ liệu bản đồ
  saveWorldData() {
    const data = {
      unlockedWorlds: this.unlockedWorlds,
      currentWorld: this.currentWorld,
      completedQuests: this.completedQuests
    };
    localStorage.setItem('worldMapData', JSON.stringify(data));
  }

  // Tải dữ liệu bản đồ từ server
  async loadWorlds() {
    try {
      const response = await fetch('/api/world-map');
      const data = await response.json();
      this.worlds = data.worlds;
      this.connections = data.connections || [];
      return data;
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu bản đồ:', error);
      return { worlds: [], connections: [] };
    }
  }

  // Lấy worlds đã unlock
  getUnlockedWorlds() {
    return this.worlds.filter(world => this.unlockedWorlds.includes(world.id));
  }

  // Lấy world theo ID
  getWorld(worldId) {
    return this.worlds.find(world => world.id === worldId);
  }

  // Kiểm tra world đã unlock chưa
  isWorldUnlocked(worldId) {
    return this.unlockedWorlds.includes(worldId);
  }

  // Unlock world
  unlockWorld(worldId) {
    if (this.isWorldUnlocked(worldId)) {
      return { success: false, message: 'World đã được unlock!' };
    }

    const world = this.getWorld(worldId);

    if (!world) {
      return { success: false, message: 'Không tìm thấy world!' };
    }

    // Kiểm tra level yêu cầu
    const userLevel = petSystem.getLevel();

    if (userLevel < world.unlockLevel) {
      return {
        success: false,
        message: `Cần Level ${world.unlockLevel} để mở ${world.name}!`
      };
    }

    // Kiểm tra world cha đã unlock chưa
    if (world.parent && !this.isWorldUnlocked(world.parent)) {
      return {
        success: false,
        message: `Cần mở ${this.getWorld(world.parent)?.name} trước!`
      };
    }

    // Unlock world
    this.unlockedWorlds.push(worldId);
    this.saveWorldData();

    // Thưởng reward
    if (world.rewards) {
      if (world.rewards.gold) {
        // Thêm gold (sẽ cần implement petSystem.addGold)
      }

      if (world.rewards.pet) {
        petSystem.unlockPet(world.rewards.pet);
      }
    }

    return {
      success: true,
      message: `Đã mở ${world.name}!`,
      world: world,
      rewards: world.rewards
    };
  }

  // Lấy world tiếp theo có thể unlock
  getNextUnlockableWorld() {
    for (const world of this.worlds) {
      if (!this.isWorldUnlocked(world.id)) {
        const canUnlock = this.canUnlockWorld(world.id);
        if (canUnlock.canUnlock) {
          return world;
        }
      }
    }
    return null;
  }

  // Kiểm tra có thể unlock world không
  canUnlockWorld(worldId) {
    const world = this.getWorld(worldId);

    if (!world) {
      return { canUnlock: false, reason: 'Không tìm thấy world!' };
    }

    const userLevel = petSystem.getLevel();

    if (userLevel < world.unlockLevel) {
      return {
        canUnlock: false,
        reason: `Cần Level ${world.unlockLevel}`,
        currentLevel: userLevel,
        requiredLevel: world.unlockLevel
      };
    }

    if (world.parent && !this.isWorldUnlocked(world.parent)) {
      return {
        canUnlock: false,
        reason: `Cần mở ${this.getWorld(world.parent)?.name} trước`
      };
    }

    return { canUnlock: true };
  }

  // Lấy danh sách worlds theo thứ tự unlock
  getWorldsInOrder() {
    const worldsByLevel = {};
    const maxLevel = Math.max(...this.worlds.map(w => w.unlockLevel));

    for (let level = 1; level <= maxLevel; level++) {
      worldsByLevel[level] = this.worlds.filter(w => w.unlockLevel === level);
    }

    return worldsByLevel;
  }

  // Lấy kết nối giữa các worlds
  getConnections() {
    return this.connections || [];
  }

  // Lấy worlds có thể đi từ world hiện tại
  getReachableWorlds(fromWorldId = null) {
    const from = fromWorldId || this.currentWorld;
    const connections = this.getConnections()
      .filter(conn => conn.from === from);

    return connections.map(conn => this.getWorld(conn.to));
  }

  // Chuyển đến world khác
  travelToWorld(worldId) {
    if (!this.isWorldUnlocked(worldId)) {
      return { success: false, message: 'World chưa được unlock!' };
    }

    // Kiểm tra có đường đi đến không
    const reachable = this.getReachableWorlds();
    const canReach = reachable.find(w => w && w.id === worldId);

    if (!canReach && worldId !== this.currentWorld) {
      return { success: false, message: 'Không thể đi đến world này!' };
    }

    this.currentWorld = worldId;
    this.saveWorldData();

    return {
      success: true,
      message: `Đã đến ${this.getWorld(worldId)?.name}!`,
      world: this.getWorld(worldId)
    };
  }

  // Lấy tiến độ (bao nhiêu world đã unlock)
  getProgress() {
    return {
      unlocked: this.unlockedWorlds.length,
      total: this.worlds.length,
      percentage: Math.round((this.unlockedWorlds.length / this.worlds.length) * 100)
    };
  }

  // Lấy stickers từ world
  getWorldStickers(worldId) {
    const world = this.getWorld(worldId);
    return world ? world.stickers : [];
  }

  // Kiểm tra boss đã đánh bại chưa
  isBossDefeated(bossId) {
    return this.completedQuests.includes(bossId);
  }

  // Đánh bại boss
  defeatBoss(bossId) {
    if (this.isBossDefeated(bossId)) {
      return { success: false, message: 'Boss đã bị đánh bại!' };
    }

    this.completedQuests.push(bossId);

    // Thưởng đặc biệt
    const rewards = {
      xp: 500,
      gold: 1000,
      sticker: 'boss-' + bossId
    };

    this.saveWorldData();

    return {
      success: true,
      message: 'Đã đánh bại boss!',
      rewards: rewards
    };
  }
}

// Tạo singleton
const worldMapSystem = new WorldMapSystem();

// Export để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = worldMapSystem;
}
