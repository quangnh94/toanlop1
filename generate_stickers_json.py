#!/usr/bin/env python3
"""
Tạo file stickers.json từ danh sách file ảnh trong thư mục stickers.
"""

import json
import os

# Cấu hình
STICKERS_DIR = "public/stickers"
OUTPUT_FILE = "data/stickers.json"

# Danh sách emoji theo rarity
COMMON_EMOJIS = ["🌟", "⭐", "✨", "💫", "🌈", "🎀", "💖", "💗", "💝", "💕", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🖤", "🐱", "🐭", "🐰", "🐻", "🐼", "🦊", "🐶", "🐧", "🐸", "🦋", "🌸", "🌺", "🌻", "🍀", "🍓", "🍒", "🍑", "🍎", "🍊", "🍋", "🍉", "🍇", "🎨", "🎭", "🎪"]
RARE_EMOJIS = ["👑", "💎", "🏆", "🥇", "🎖️", "⚜️", "🔱", "🎗️", "🏅", "🎊", "🎉", "🎁", "🎈", "🎇", "🎆", "✨", "💫", "⭐", "🌟", "🌙"]
EPIC_EMOJIS = ["🔮", "🌈", "🦄", "🐉", "🔥", "💫", "✨", "👑", "💎", "🏆", "⚔️", "🛡️", "🗡️", "🏹", "🎯", "🎪", "🎭", "🎨", "🎬", "🎤"]
LEGENDARY_EMOJIS = ["👑", "💎", "🏆", "🔥", "⚡", "🌟", "🌈", "🦄", "🐉", "🔮", "💫", "✨", "🎊", "🎉", "👑"]

def get_rarity(index, total):
    """Phân bổ rarity dựa trên vị trí."""
    # 40% common, 30% rare, 20% epic, 10% legendary
    if index < total * 0.4:
        return "common", "Phổ thông", "#9CA3AF", COMMON_EMOJIS
    elif index < total * 0.7:
        return "rare", "Hiếm", "#3B82F6", RARE_EMOJIS
    elif index < total * 0.9:
        return "epic", "Sử thi", "#A855F7", EPIC_EMOJIS
    else:
        return "legendary", "Huyền thoại", "#F59E0B", LEGENDARY_EMOJIS

def generate_stickers_json():
    """Tạo file stickers.json."""

    # Lấy danh sách file ảnh
    sticker_files = []
    for ext in ["webp", "gif", "avif", "jpg", "png"]:
        pattern = f"*.{ext}"
        import glob
        files = glob.glob(os.path.join(STICKERS_DIR, pattern))
        sticker_files.extend(files)

    # Loại bỏ file trùng lặp
    unique_files = []
    seen = set()
    for f in sticker_files:
        basename = os.path.basename(f)
        if "(" not in basename:  # Loại bỏ file trùng (1), (2), etc.
            if basename not in seen:
                seen.add(basename)
                unique_files.append(f)

    # Sắp xếp theo tên
    unique_files.sort(key=lambda x: os.path.basename(x))

    stickers = []

    for idx, filepath in enumerate(unique_files):
        filename = os.path.basename(filepath)
        name_without_ext = os.path.splitext(filename)[0]

        # Lấy rarity
        rarity, label, color, emojis = get_rarity(idx, len(unique_files))
        emoji = emojis[idx % len(emojis)]

        # Tạo sticker entry
        sticker = {
            "id": name_without_ext.replace("-", "_").replace(".", "_"),
            "name": name_without_ext.replace("-", " ").replace("_", " ").title(),
            "emoji": emoji,
            "image": f"/stickers/{filename}",
            "rarity": rarity,
            "rarityLabel": label,
            "color": color
        }

        stickers.append(sticker)

    # Tạo JSON structure
    json_data = {
        "stickers": stickers,
        "rarity": {
            "common": {
                "label": "Phổ thông",
                "color": "#9CA3AF",
                "chance": 40
            },
            "rare": {
                "label": "Hiếm",
                "color": "#3B82F6",
                "chance": 30
            },
            "epic": {
                "label": "Sử thi",
                "color": "#A855F7",
                "chance": 20
            },
            "legendary": {
                "label": "Huyền thoại",
                "color": "#F59E0B",
                "chance": 10
            }
        }
    }

    # Ghi file JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    print(f"✓ Đã tạo {len(stickers)} sticker trong {OUTPUT_FILE}")
    print(f"  - Common: {sum(1 for s in stickers if s['rarity'] == 'common')}")
    print(f"  - Rare: {sum(1 for s in stickers if s['rarity'] == 'rare')}")
    print(f"  - Epic: {sum(1 for s in stickers if s['rarity'] == 'epic')}")
    print(f"  - Legendary: {sum(1 for s in stickers if s['rarity'] == 'legendary')}")

if __name__ == "__main__":
    generate_stickers_json()
