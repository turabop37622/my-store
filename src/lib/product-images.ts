import earbudsPearl from "@/assets/products/earbuds-pearl.jpg";
import earbudsBlack from "@/assets/products/earbuds-black.jpg";
import watchSilver from "@/assets/products/watch-silver.jpg";
import watchClassic from "@/assets/products/watch-classic.jpg";
import headphonesBeige from "@/assets/products/headphones-beige.jpg";
import speakerSage from "@/assets/products/speaker-sage.jpg";
import powerbank from "@/assets/products/powerbank.jpg";
import cable from "@/assets/products/cable.jpg";
import fanPink from "@/assets/products/fan-pink.jpg";

export const productImages: Record<string, string> = {
  "earbuds-pearl": earbudsPearl,
  "earbuds-black": earbudsBlack,
  "watch-silver": watchSilver,
  "watch-classic": watchClassic,
  "headphones-beige": headphonesBeige,
  "speaker-sage": speakerSage,
  powerbank: powerbank,
  cable: cable,
  "fan-pink": fanPink,
};

export function getProductImage(key: string | null | undefined): string {
  if (!key) return "/placeholder.svg";
  return productImages[key] ?? "/placeholder.svg";
}
