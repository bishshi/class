import type { PhotoItem } from "../photo-types";

export const wechatPhoto = (id: number, title: string, caption: string): PhotoItem => ({
  title,
  caption,
  image: `/assets/wechat-archive/wechat-${String(id).padStart(3, "0")}.webp`
});
