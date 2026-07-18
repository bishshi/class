import type { PhotoTopic } from "../photo-types";
import { wechatPhoto } from "./wechat-photo";

export const candidTopic: PhotoTopic = {
  slug: "candid",
  title: "没被摆拍的瞬间",
  text: "走廊、食堂、晚霞和笑场。真正会让人停下来的，常常是不太整齐的照片。",
  cover: "/assets/wechat-archive/wechat-499.webp",
  photos: [
    {
      title: "走廊偶遇",
      caption: "模糊一点也没关系，像真的从记忆里翻出来。",
      image: ""
    },
    {
      title: "食堂那一桌",
      caption: "饭菜不一定好吃，但聊天是真的好笑。",
      image: ""
    },
    {
      title: "操场晚霞",
      caption: "很多故事都发生在天快黑的时候。",
      image: ""
    },
    {
      title: "笑场",
      caption: "最不端正的照片，往往最像我们。",
      image: ""
    },
    wechatPhoto(490, "恶魔角合照", "没有正式站姿，反而最像我们真实的青春。"),
    wechatPhoto(499, "草地上的伙伴", "坐下来聊聊天，晚风把时间吹得很慢。")
  ]
};
