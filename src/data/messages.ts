export const messagesIntro = {
  title: "留言墙",
  text: "在这里留下给一年后的自己、老同学或整个班级的一句话。新的留言会像便利贴一样贴在这面墙上。"
};

export const featuredMessage = {
  text: "后来我们去了不同的地方，但那间教室像一个坐标，提醒我们曾经一起出发。",
  author: "写给612班"
};

export const messages = [
  {
    title: "给一年后的自己",
    text: "不要忘记当时为什么出发，也不要害怕路上偶尔慢一点。"
  },
  {
    title: "给老同学",
    text: "愿你打开这个页面的时候，刚好想起一个很好的下午。"
  }
];

export const twikooConfig = {
  envId: import.meta.env.PUBLIC_TWIKOO_ENV_ID ?? "",
  scriptSrc: "https://cdn.jsdelivr.net/npm/twikoo@1.7.7/dist/twikoo.min.js",
  path: "/messages/",
  lang: "zh-CN"
};
