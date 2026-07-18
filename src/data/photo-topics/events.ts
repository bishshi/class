import type { PhotoTopic } from "../photo-types";
import { wechatPhoto } from "./wechat-photo";

export const eventsTopic: PhotoTopic = {
  slug: "events",
  title: "班级活动",
  text: "运动会、晚会、春游、比赛，所有离开课桌之后还在一起发光的时刻。",
  cover: "/assets/wechat-archive/wechat-455.webp",
  photos: [
    {
      title: "高一下学期表彰大会",
      caption: "排练时觉得麻烦，回头看全是可爱。",
      image: "https://pic.biss.click/image/50e233d6-dd88-4a10-bb2d-a42ace27cdec.jpg",
      date: "2022-07-08"
    },
    {
      title: "集体出游",
      caption: "人群、阳光、背包和没停过的聊天。",
      image: "https://pic.biss.click/image/ef56e433-2938-4f96-bc16-b6c973b7621d.png"
    },
    {
      title: "百日誓师大会",
      caption: "高三的第一次全体活动，大家都很随意地在听讲，虽然最后还是没能坚持到最后。",
      image: "https://pic.biss.click/image/45bfbe79-bd7b-40f3-9670-1b34cc0957b2.png",
      date: "2024-02-28"
    },
    wechatPhoto(117, "考前舞台", "紧张的日子里，也需要一次大声唱出来。"),
    wechatPhoto(121, "看台上的我们", "一片红色校服，聚成高三最后的集体活动。"),
    wechatPhoto(129, "操场热身", "阳光很好，口号和动作都比平时更有力量。"),
    wechatPhoto(132, "坐在一起", "台上发生什么已经模糊，身边的人还记得。"),
    {
      ...wechatPhoto(176, "元旦歌咏", "整齐站上舞台，是青春里难得的郑重。"),
      date: "2021-12-31"
    },
    wechatPhoto(178, "领奖时刻", "证书会褪色，但被认可的那一刻不会。"),
    wechatPhoto(180, "操场挑战", "跨过栏架，也跨过一个个觉得做不到的瞬间。"),
    wechatPhoto(181, "百日倒计时", "数字揭开的那一刻，高考忽然变得很近。"),
    wechatPhoto(368, "军训合影", "刚认识不久的我们，第一次以班级的名字站在一起。"),
    wechatPhoto(370, "方阵出发", "步子未必完全整齐，方向却是一致的。"),
    wechatPhoto(446, "远足路上的笑脸", "路很长，但和同学一起走就没有那么累。"),
    wechatPhoto(455, "山脚合影", "走过很远的路，当然要认真留下一张合照。"),
    wechatPhoto(459, "班旗与伙伴", "把班级的名字举进镜头，也举进三年的记忆。"),
    wechatPhoto(470, "操场晚会", "天黑之后，灯光和欢呼把操场变成了舞台。"),
    wechatPhoto(480, "荧光人群", "挥动的光棒让普通夜晚有了节日的颜色。")
  ]
};
