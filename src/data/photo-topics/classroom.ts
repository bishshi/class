import type { PhotoTopic } from "../photo-types";

export const classroomTopic: PhotoTopic = {
  slug: "classroom",
  title: "教室日常",
  text: "黑板、课桌、窗边、试卷，还有那些写在草稿纸边角的小情绪。",
  cover: "",
  photos: [
    {
      title: "窗边的座位",
      caption: "把真实照片放到 public/photos/classroom/window-seat.jpg 后，再把 image 改成对应路径。",
      image: ""
    },
    {
      title: "黑板角落",
      caption: "适合放倒计时、值日表、板书和课代表留下的提醒。",
      image: ""
    },
    {
      title: "堆满书的桌面",
      caption: "那些看起来很乱、后来又很想念的普通一天。",
      image: ""
    },
    {
      title: "晚自习灯光",
      caption: "可以放教室灯亮着、窗外天色暗下来的照片。",
      image: ""
    },
    {
      title: "课间十分钟",
      caption: "不用太正式，越像随手拍越有高中味道。",
      image: ""
    }
  ]
};
