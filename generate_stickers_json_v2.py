#!/usr/bin/env python3
"""
Generate stickers.json from actual image files.
Distributes rarity evenly across all stickers.
"""

import os
import json
import random

STICKERS_DIR = "/Users/bee/Documents/Bông/bong-toan-lop-1/public/stickers"
OUTPUT_FILE = "/Users/bee/Documents/Bông/bong-toan-lop-1/data/stickers.json"

# Image file extensions in order of preference (avif first, then webp, etc)
IMAGE_EXTENSIONS_PREFERENCE = ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.gif']

# Sticker names mapping (based on filename patterns)
STICKER_NAMES = {
    'tom-and-jerry': 'Tom & Jerry',
    'sticker_': 'Sticker'
}

# Emojis for different rarities
EMOJIS = {
    'common': ['🌟', '⭐', '✨', '💫', '🌈', '🎀', '💖', '💗', '💝', '💕', '❤️', '🧡'],
    'rare': ['🎈', '🎇', '🎆', '🌙', '👑', '🦋', '🌸', '🍀', '🎀', '💎'],
    'epic': ['🐉', '🔥', '🦄', '🌈', '⚡', '🔮', '👑', '🎊', '🎉', '💫'],
    'legendary': ['🏆', '👑', '💎', '🔥', '⭐', '🌟', '🦄', '🐉', '🎊', '🎉']
}

def get_preferred_format_files():
    """Get one file per sticker, preferring the best format."""
    from collections import defaultdict

    # First get all files
    all_files = []
    for filename in os.listdir(STICKERS_DIR):
        if filename.startswith('.'):
            continue
        all_files.append(filename)

    # Group by base name (without extension)
    file_groups = defaultdict(list)

    for filename in all_files:
        base_name = os.path.splitext(filename)[0]
        ext = os.path.splitext(filename)[1].lower()
        if ext in IMAGE_EXTENSIONS_PREFERENCE:
            file_groups[base_name].append((ext, filename))

    # For each group, pick the preferred format
    selected_files = []
    for base_name, files in file_groups.items():
        # Sort by preference
        files.sort(key=lambda x: IMAGE_EXTENSIONS_PREFERENCE.index(x[0]))
        # Pick the first (most preferred)
        selected_files.append(files[0][1])

    return sorted(selected_files)

def get_all_sticker_files():
    """Get all sticker image files from the directory."""
    return get_preferred_format_files()

def get_sticker_name(filename):
    """Generate a nice name for the sticker."""
    name_without_ext = os.path.splitext(filename)[0]

    # Handle Tom & Jerry stickers
    if 'tom-and-jerry' in name_without_ext:
        num = name_without_ext.split('-')[-1] if '-' in name_without_ext else ''
        return f"Tom & Jerry {num}".strip()

    # Handle numbered stickers
    if 'sticker_' in name_without_ext:
        return name_without_ext.replace('_', ' ').title()

    return name_without_ext.replace('-', ' ').title()

def get_sticker_id(filename):
    """Generate unique ID for sticker."""
    # Remove extension and special characters
    name_without_ext = os.path.splitext(filename)[0]
    return name_without_ext.replace(' ', '-').lower()

def distribute_rarity(sticker_count):
    """
    Distribute stickers across rarities evenly.
    Returns a list of rarity values in random order.
    """
    # Calculate counts for each rarity
    common_count = int(sticker_count * 0.40)  # 40%
    rare_count = int(sticker_count * 0.30)    # 30%
    epic_count = int(sticker_count * 0.20)    # 20%
    legendary_count = sticker_count - common_count - rare_count - epic_count  # Remainder

    # Create rarity distribution
    rarities = (
        ['common'] * common_count +
        ['rare'] * rare_count +
        ['epic'] * epic_count +
        ['legendary'] * legendary_count
    )

    # Shuffle rarities so they're evenly distributed
    random.shuffle(rarities)

    return rarities

def generate_stickers_json():
    """Generate the stickers.json file."""
    sticker_files = get_all_sticker_files()
    print(f"Found {len(sticker_files)} sticker files")

    if not sticker_files:
        print("No sticker files found!")
        return

    # Distribute rarities evenly
    rarities = distribute_rarity(len(sticker_files))

    stickers = []
    for i, filename in enumerate(sticker_files):
        rarity = rarities[i]

        # Pick random emoji for this rarity
        emoji = random.choice(EMOJIS[rarity])

        sticker = {
            "id": get_sticker_id(filename),
            "name": get_sticker_name(filename),
            "emoji": emoji,
            "image": f"/stickers/{filename}",
            "rarity": rarity,
            "rarityLabel": {
                'common': 'Phổ thông',
                'rare': 'Hiếm',
                'epic': 'Sử thi',
                'legendary': 'Huyền thoại'
            }[rarity],
            "color": {
                'common': '#9CA3AF',
                'rare': '#3B82F6',
                'epic': '#A855F7',
                'legendary': '#F59E0B'
            }[rarity]
        }
        stickers.append(sticker)

    # Count stickers by rarity
    rarity_counts = {}
    for s in stickers:
        rarity_counts[s['rarity']] = rarity_counts.get(s['rarity'], 0) + 1

    print(f"\nRarity distribution:")
    for r in ['common', 'rare', 'epic', 'legendary']:
        print(f"  {r}: {rarity_counts.get(r, 0)} stickers")

    # Create output JSON
    output = {
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

    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Generated {OUTPUT_FILE} with {len(stickers)} stickers")

if __name__ == '__main__':
    # Set random seed for different distribution each time
    random.seed()

    generate_stickers_json()
