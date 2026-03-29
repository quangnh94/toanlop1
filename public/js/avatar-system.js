/**
 * Avatar System - Hệ thống thời trang cho avatar
 * Mua và trang trí avatar bằng gold kiếm được từ làm toán
 */

class AvatarSystem {
  constructor() {
    this.gold = 0;
    this.ownedItems = [];
    this.equippedItems = {
      hair: 'hair-1',
      top: 'top-1',
      bottom: 'bottom-1',
      shoes: 'shoes-1',
      accessory: null,
      hat: null,
      glasses: null,
      jewelry: null
    };
    this.items = [];

    this.loadAvatarData();
  }

  // Lưu dữ liệu avatar
  loadAvatarData() {
    const savedData = localStorage.getItem('avatarData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.gold = data.gold || 0;
      this.ownedItems = data.ownedItems || [];
      this.equippedItems = data.equippedItems || this.equippedItems;
    }
  }

  // Lưu dữ liệu avatar
  saveAvatarData() {
    const data = {
      gold: this.gold,
      ownedItems: this.ownedItems,
      equippedItems: this.equippedItems
    };
    localStorage.setItem('avatarData', JSON.stringify(data));
  }

  // Tải danh sách items từ server
  async loadItems() {
    try {
      const response = await fetch('/api/avatar-items');
      const data = await response.json();
      this.items = data.items;
      this.categories = data.categories;
      this.rarities = data.rarities;
      return data;
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu items:', error);
      return { items: [], categories: {}, rarities: {} };
    }
  }

  // Mua item
  async buyItem(itemId) {
    const item = this.items.find(i => i.id === itemId);

    if (!item) {
      return { success: false, message: 'Không tìm thấy item!' };
    }

    // Kiểm tra đã sở hữu chưa
    if (this.ownedItems.includes(itemId)) {
      return { success: false, message: 'Bạn đã sở hữu item này rồi!' };
    }

    // Kiểm tra đủ gold
    if (this.gold < item.price) {
      return { success: false, message: `Không đủ gold! Cần ${item.price} gold.` };
    }

    // Trừ gold và thêm item
    this.gold -= item.price;
    this.ownedItems.push(itemId);
    this.saveAvatarData();

    return {
      success: true,
      message: `Đã mua ${item.name}!`,
      item: item
    };
  }

  // Trang bị item
  equipItem(itemId) {
    const item = this.items.find(i => i.id === itemId);

    if (!item) {
      return { success: false, message: 'Không tìm thấy item!' };
    }

    // Kiểm tra đã sở hữu chưa
    if (!this.ownedItems.includes(itemId)) {
      return { success: false, message: 'Bạn chưa sở hữu item này!' };
    }

    // Trang bị item
    this.equippedItems[item.category] = itemId;
    this.saveAvatarData();

    return {
      success: true,
      message: `Đã trang bị ${item.name}!`,
      item: item
    };
  }

  // Tháo gỡ item
  unequipItem(category) {
    if (!this.equippedItems[category]) {
      return { success: false, message: 'Không có item để tháo!' };
    }

    this.equippedItems[category] = null;
    this.saveAvatarData();

    return {
      success: true,
      message: 'Đã tháo gỡ item!'
    };
  }

  // Lấy items theo category
  getItemsByCategory(category) {
    return this.items.filter(item => item.category === category);
  }

  // Lấy items đã sở hữu theo category
  getOwnedItemsByCategory(category) {
    const ownedInCategory = this.ownedItems.filter(itemId => {
      const item = this.items.find(i => i.id === itemId);
      return item && item.category === category;
    });
    return ownedInCategory.map(itemId => this.items.find(i => i.id === itemId));
  }

  // Kiểm tra item đã trang bị
  isEquipped(itemId) {
    return Object.values(this.equippedItems).includes(itemId);
  }

  // Kiểm tra item đã sở hữu
  isOwned(itemId) {
    return this.ownedItems.includes(itemId);
  }

  // Lấy item đang trang bị theo category
  getEquippedItem(category) {
    const itemId = this.equippedItems[category];
    if (!itemId) return null;
    return this.items.find(i => i.id === itemId);
  }

  // Cập nhật gold (từ pet system)
  updateGold(amount) {
    this.gold = amount;
    this.saveAvatarData();
  }

  // Lấy gold hiện tại
  getGold() {
    return this.gold;
  }

  // Lấy avatar preview
  getAvatarPreview() {
    const preview = {};

    for (const [category, itemId] of Object.entries(this.equippedItems)) {
      if (itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          preview[category] = item;
        }
      }
    }

    return preview;
  }

  // Đếm số item theo rarity
  countByRarity() {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };

    this.ownedItems.forEach(itemId => {
      const item = this.items.find(i => i.id === itemId);
      if (item) {
        counts[item.rarity] = (counts[item.rarity] || 0) + 1;
      }
    });

    return counts;
  }

  // Tổng giá trị items
  getTotalValue() {
    let total = 0;

    this.ownedItems.forEach(itemId => {
      const item = this.items.find(i => i.id === itemId);
      if (item) {
        total += item.price;
      }
    });

    return total;
  }
}

// Tạo singleton
const avatarSystem = new AvatarSystem();

// Export để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = avatarSystem;
}
