import type { PhotoTopic } from "../photo-types";
import { wechatPhoto } from "./wechat-photo";

export const graduationDayTopic: PhotoTopic = {
  slug: "graduation-day",
  title: "毕业那天",
  text: "合照、签名、花束、校门和没说完的话，都放在这个专题里。",
  cover: "/assets/wechat-archive/wechat-145.webp",
  photos: [
    {
      title: "最后一张合照",
      caption: "这里最适合放班级毕业照。",
      image: "https://pic.biss.click/image/c1528af5-62da-47c3-8309-cd809f779288.jpg"
    },
    {
      title: "校服签名",
      caption: "名字挤在一起，像那天没来得及说完的话。",
      image: "https://pic.biss.click/image/d06e370e-39a7-497e-a47d-eed7a759a67a.jpg"
    },
    {
      title: "校门口",
      caption: "出发的地方，也成了回头看的地方。",
      image: "https://pic.biss.click/image/d4aa5275-9581-4d43-8d7e-ef3f44f8c497.jpg"
    },
    {
      title: "花和证书",
      caption: "仪式感不用太多，一束花就够亮。",
      image: "https://pic.biss.click/image/4ee5c463-8a73-4f97-970c-347ab44f6d11.jpg"
    },
    {
      title: "散场之前",
      caption: "那一刻大家都在笑，但心里都知道要分别了。",
      image: "https://pic.biss.click/image/f8d180c1-4827-4bfd-9550-4bfad4b97640.jpg"
    },
    wechatPhoto(145, "壮行合影", "红色班服、彩色气球，和出发前最完整的一次站在一起。"),
    wechatPhoto(146, "气球升起之前", "所有人挤进镜头，等一个一起松手的瞬间。"),
    wechatPhoto(150, "飞向夏天", "气球越过教学楼，属于高中的倒计时也到了最后。"),
    wechatPhoto(151, "人群里的告别", "欢呼、拥抱和一句句被现场声音盖住的话。"),
    wechatPhoto(152, "穿过祝福", "从熟悉的人群中走过，前面就是新的路。"),
    wechatPhoto(153, "鲜花与笑脸", "最后一程依然有人在身旁鼓掌。"),
    wechatPhoto(81, "毕业典礼合影", "红色幕布前，老师和同学一起留下毕业的证据。"),
    wechatPhoto(84, "典礼现场", "从看台望向舞台，礼堂装下了整届人的夏天。"),
    wechatPhoto(85, "把花送给老师", "镜头拼在一起，也拼出那天的感谢。"),
    wechatPhoto(88, "走过红毯", "熟悉的老师站在两侧，目送这一届学生离开。"),
    wechatPhoto(89, "并肩入场", "毕业不是一个人的终点，是一群人的共同章节。"),
    wechatPhoto(382, "最后一天的教室", "书本还摊在桌上，离别已经悄悄开始。"),
    wechatPhoto(387, "签在衣服上", "名字、祝福和画得歪歪扭扭的小图案。"),
    wechatPhoto(388, "气球装点的教室", "最后一次把教室布置得像节日。"),
    wechatPhoto(391, "散场之后", "桌椅、书本和气球，保留着刚刚发生过的热闹。"),
    wechatPhoto(396, "捧着花出发", "校门口的人群里，每个人都有自己的告别方式。"),
    wechatPhoto(405, "校车旁的合照", "气球还在手里，下一段旅程已经在等候。"),
    wechatPhoto(408, "放飞之前", "大家抬头看向同一个方向。"),
    wechatPhoto(411, "毕业气球", "彩色气球升空，校门口只剩挥手的人群。")
  ]
};
