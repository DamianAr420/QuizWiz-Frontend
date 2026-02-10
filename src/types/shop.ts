export const ItemRarity = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
} as const;

export type ItemRarity = (typeof ItemRarity)[keyof typeof ItemRarity];

export const ItemRarityLabels: Record<ItemRarity, string> = {
  [ItemRarity.Common]: "Common",
  [ItemRarity.Rare]: "Rare",
  [ItemRarity.Epic]: "Epic",
  [ItemRarity.Legendary]: "Legendary",
};

export const ItemType = {
  AvatarFrame: 0,
  Background: 1,
  Badge: 2,
  Ticket: 3,
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export interface ShopItem {
  id: number;
  title: string;
  description: string;
  price: number;
  type: ItemType;
  imageUrl?: string;
  rarity: ItemRarity;
  requiredLevel: number;
  isAvailable: boolean;
  stockQuantity?: number;
}

export interface UserInventory {
  id: number;
  shopItemId: number;
  shopItem: ShopItem;
  purchasedAt: string;
}
