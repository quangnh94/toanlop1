/**
 * Pet System - Hệ thống nuôi pet ảo
 * Pet đi cùng bé trong hành trình học toán
 */

class PetSystem {
  constructor() {
    this.activePet = null;
    this.petCollection = [];
    this.gold = 100; // Gold ban đầu
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;

    this.loadPetData();
  }

  // Lưu dữ liệu pet
  loadPetData() {
    const savedData = localStorage.getItem('petData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.activePet = data.activePet;
      this.petCollection = data.petCollection || [];
      this.gold = data.gold || 100;
      this.xp = data.xp || 0;
      this.level = data.level || 1;
      this.xpToNextLevel = data.xpToNextLevel || 100;
    }
  }

  // Lưu dữ liệu pet
  savePetData() {
    const data = {
      activePet: this.activePet,
      petCollection: this.petCollection,
      gold: this.gold,
      xp: this.xp,
      level: this.level,
      xpToNextLevel: this.xpToNextLevel
    };
    localStorage.setItem('petData', JSON.stringify(data));
  }

  // Chọn pet ban đầu
  chooseStarterPet(petId) {
    const starterPets = ['cat-white', 'dog-golden', 'rabbit-pink'];

    if (!starterPets.includes(petId)) {
      return { success: false, message: 'Pet không hợp lệ!' };
    }

    // Tạo pet mới
    this.activePet = this.createPet(petId);
    this.petCollection.push(this.activePet);
    this.savePetData();

    return { success: true, pet: this.activePet };
  }

  // Tạo pet mới
  createPet(petId) {
    const petsData = this.getPetsData();
    const petTemplate = petsData.pets.find(p => p.id === petId);

    if (!petTemplate) {
      return null;
    }

    return {
      id: petId,
      name: petTemplate.name,
      emoji: petTemplate.emoji,
      rarity: petTemplate.rarity,
      level: 1,
      xp: 0,
      xpToNextLevel: 50,
      hunger: petTemplate.baseStats.hunger,
      happiness: petTemplate.baseStats.happiness,
      energy: petTemplate.baseStats.energy,
      maxHunger: 100,
      maxHappiness: 100,
      maxEnergy: 100,
      accessories: [],
      createdAt: new Date().toISOString(),
      lastFed: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };
  }

  // Lấy dữ liệu pet từ server
  async getPetsData() {
    try {
      const response = await fetch('/api/pets');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu pet:', error);
      return { pets: [], food: [], toys: [], accessories: [] };
    }
  }

  // Cho pet ăn
  feedPet(foodId) {
    if (!this.activePet) {
      return { success: false, message: 'Chưa có pet!' };
    }

    if (this.activePet.hunger >= 100) {
      return { success: false, message: 'Pet đã no rồi!' };
    }

    return this.getPetsData().then(data => {
      const food = data.food.find(f => f.id === foodId);

      if (!food) {
        return { success: false, message: 'Không tìm thấy thức ăn!' };
      }

      if (this.gold < food.cost) {
        return { success: false, message: `Không đủ gold! Cần ${food.cost} gold.` };
      }

      // Trừ gold và tăng hunger/happiness
      this.gold -= food.cost;
      this.activePet.hunger = Math.min(100, this.activePet.hunger + food.hunger);
      this.activePet.happiness = Math.min(100, this.activePet.happiness + food.happiness);
      this.activePet.lastFed = new Date().toISOString();

      this.savePetData();
      return { success: true, message: `Cho ${this.activePet.name} ăn ${food.name}!`, food: food };
    });
  }

  // Chơi với pet
  playWithPet(toyId) {
    if (!this.activePet) {
      return { success: false, message: 'Chưa có pet!' };
    }

    if (this.activePet.energy < 20) {
      return { success: false, message: 'Pet quá mệt, cần nghỉ!' };
    }

    return this.getPetsData().then(data => {
      const toy = data.toys.find(t => t.id === toyId);

      if (!toy) {
        return { success: false, message: 'Không tìm thấy đồ chơi!' };
      }

      if (this.gold < toy.cost) {
        return { success: false, message: `Không đủ gold! Cần ${toy.cost} gold.` };
      }

      // Trừ gold và tăng happiness/energy
      this.gold -= toy.cost;
      this.activePet.happiness = Math.min(100, this.activePet.happiness + toy.happiness);
      this.activePet.energy = Math.max(0, this.activePet.energy - toy.energy);
      this.activePet.lastPlayed = new Date().toISOString();

      // Tăng XP cho pet
      this.addPetXP(15);

      this.savePetData();
      return { success: true, message: `Chơi với ${this.activePet.name} bằng ${toy.name}!`, toy: toy };
    });
  }

  // Thêm pet XP
  addPetXP(amount) {
    if (!this.activePet) return;

    this.activePet.xp += amount;

    // Kiểm tra level up
    while (this.activePet.xp >= this.activePet.xpToNextLevel) {
      this.activePet.xp -= this.activePet.xpToNextLevel;
      this.activePet.level++;
      this.activePet.xpToNextLevel = Math.floor(this.activePet.xpToNextLevel * 1.5);

      // Kiểm tra evolution
      this.checkEvolution();
    }

    this.savePetData();
  }

  // Kiểm tra và thực hiện evolution
  checkEvolution() {
    const petsData = this.getPetsData();

    petsData.then(data => {
      const petTemplate = data.pets.find(p => p.id === this.activePet.id);
      if (!petTemplate || !petTemplate.evolution) return;

      const level = this.activePet.level;

      // Kiểm tra evolution level 5
      if (level === 5 && petTemplate.evolution.level5) {
        this.evolvePet(petTemplate.evolution.level5);
      }
      // Kiểm tra evolution level 10
      else if (level === 10 && petTemplate.evolution.level10) {
        this.evolvePet(petTemplate.evolution.level10);
      }
      // Kiểm tra evolution level 15
      else if (level === 15 && petTemplate.evolution.level15) {
        this.evolvePet(petTemplate.evolution.level15);
      }
      // Kiểm tra evolution level 20
      else if (level === 20 && petTemplate.evolution.level20) {
        this.evolvePet(petTemplate.evolution.level20);
      }
    });
  }

  // Tiến hóa pet
  evolvePet(newPetId) {
    const petsData = this.getPetsData();

    petsData.then(data => {
      const newPetTemplate = data.pets.find(p => p.id === newPetId);

      if (!newPetTemplate) return;

      // Giữ lại level và XP
      const oldLevel = this.activePet.level;
      const oldXP = this.activePet.xp;

      // Cập nhật pet
      this.activePet = this.createPet(newPetId);
      this.activePet.level = oldLevel;
      this.activePet.xp = oldXP;

      // Thông báo evolution (sẽ được xử lý ở UI)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('petEvolved', {
          detail: { oldPet: this.activePet, newPet: newPetTemplate }
        }));
      }

      this.savePetData();
    });
  }

  // Thêm XP từ làm bài
  addExamXP(score, correctCount) {
    const baseXP = 20;
    const bonusXP = score * 2;
    const totalXP = baseXP + bonusXP;

    this.xp += totalXP;

    // Kiểm tra level up
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.3);

      // Thưởng gold khi level up
      this.gold += 50;

      // Thông báo level up (sẽ được xử lý ở UI)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('levelUp', {
          detail: { level: this.level, reward: 50 }
        }));
      }
    }

    // Thêm XP cho pet
    this.addPetXP(correctCount * 10);

    // Thưởng gold từ làm bài
    this.gold += score;

    this.savePetData();

    return { level: this.level, xp: this.xp, gold: this.gold };
  }

  // Mua accessory
  buyAccessory(accessoryId) {
    return this.getPetsData().then(data => {
      const accessory = data.accessories.find(a => a.id === accessoryId);

      if (!accessory) {
        return { success: false, message: 'Không tìm thấy phụ kiện!' };
      }

      if (this.gold < accessory.cost) {
        return { success: false, message: `Không đủ gold! Cần ${accessory.cost} gold.` };
      }

      if (!this.activePet) {
        return { success: false, message: 'Chưa có pet!' };
      }

      // Kiểm tra đã có accessory chưa
      if (this.activePet.accessories.includes(accessoryId)) {
        return { success: false, message: 'Đã có phụ kiện này rồi!' };
      }

      // Mua accessory
      this.gold -= accessory.cost;
      this.activePet.accessories.push(accessoryId);

      this.savePetData();
      return { success: true, message: `Đã mua ${accessory.name}!`, accessory: accessory };
    });
  }

  // Chuyển đổi pet active
  switchActivePet(petId) {
    const pet = this.petCollection.find(p => p.id === petId);

    if (!pet) {
      return { success: false, message: 'Không tìm thấy pet!' };
    }

    this.activePet = pet;
    this.savePetData();

    return { success: true, pet: pet };
  }

  // Unlock pet mới
  unlockPet(petId) {
    // Kiểm tra đã unlock chưa
    const alreadyUnlocked = this.petCollection.find(p => p.id === petId);

    if (alreadyUnlocked) {
      return { success: false, message: 'Pet đã được unlock rồi!' };
    }

    const newPet = this.createPet(petId);

    if (!newPet) {
      return { success: false, message: 'Không tìm thấy pet!' };
    }

    this.petCollection.push(newPet);

    if (!this.activePet) {
      this.activePet = newPet;
    }

    this.savePetData();

    return { success: true, pet: newPet };
  }

  // Lấy danh sách pet
  getPetCollection() {
    return this.petCollection;
  }

  // Lấy pet đang active
  getActivePet() {
    return this.activePet;
  }

  // Lấy gold
  getGold() {
    return this.gold;
  }

  // Lấy level
  getLevel() {
    return this.level;
  }

  // Lấy XP
  getXP() {
    return this.xp;
  }
}

// Tạo singleton
const petSystem = new PetSystem();

// Export để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = petSystem;
}
