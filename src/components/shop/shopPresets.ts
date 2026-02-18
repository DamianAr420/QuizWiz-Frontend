export const SHOP_PRESETS = {
  getClassName: (imageUrl: string | null | undefined): string => {
    if (!imageUrl || !imageUrl.startsWith("preset:")) return "";
    return `item-preset-${imageUrl.split(":")[1]}`;
  },

  getInlineStyle: (
    imageUrl: string | null | undefined,
  ): Record<string, string> => {
    if (imageUrl?.startsWith("linear-gradient")) {
      return { background: imageUrl };
    }
    return {};
  },
};
