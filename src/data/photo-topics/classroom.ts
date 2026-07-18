import type { PhotoTopic } from "../photo-types";
import { wechatPhoto } from "./wechat-photo";

export const classroomTopic: PhotoTopic = {
  slug: "classroom",
  title: "教室日常",
  text: "黑板、课桌、窗边、试卷，还有那些写在草稿纸边角的小情绪。",
  cover: "/assets/wechat-archive/wechat-373.webp",
  photos: [
    {
      title: "窗边",
      caption: "走廊尽头的窗户",
      image: "https://pic.biss.click/image/d4aa5275-9581-4d43-8d7e-ef3f44f8c497.jpg"
    },
    {
      title: "黑板角落",
      caption: "倒计时、值日表、板书和课代表留下的提醒。",
      image: "https://pic.biss.click/image/049b8074-fde1-423c-b9b5-b89cfe4430e9.jpg"
    },
    {
      title: "黑板上的一句话",
      caption: "",
      image: "https://pic.biss.click/image/d37b224b-81ea-40cf-87aa-1dfa02312ba7.jpg"
    },
    {
      title: "高考加油",
      caption: "",
      image: "https://pic.biss.click/image/d06e370e-39a7-497e-a47d-eed7a759a67a.jpg"
    },
    {
      title: "询问老师",
      caption: "课后向老师请教问题",
      image: "https://pic.biss.click/image/95c03bd4-d0d3-4c38-9855-3342fd582080.jpg"
    },
    wechatPhoto(159, "清晨校园", "天还没完全亮，教学楼已经开始新的一天。"),
    wechatPhoto(160, "空走廊", "下课铃没有响起时，走廊安静得像一张旧照片。"),
    wechatPhoto(161, "教室一角", "寒冷的早晨、厚厚的毯子和靠窗的位置。"),
    wechatPhoto(162, "雪天课间", "楼下有人追着雪跑，楼上的人隔窗看热闹。"),
    wechatPhoto(193, "黑板前", "老师写下的每一行，都曾是我们共同的日常。"),
    wechatPhoto(196, "忙碌的教室", "有人整理桌面，有人继续写题，生活没有暂停。"),
    wechatPhoto(197, "围在桌边", "讲一道题的时间，也能成为多年后的回忆。"),
    wechatPhoto(373, "夕阳自习", "光从窗边落进来，照亮高中的普通一天。"),
    wechatPhoto(375, "教室合照", "镜头前挤成一团，是班级最真实的样子。")
  ]
};
