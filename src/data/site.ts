export const site = {
  className: "2024届612班",
  title: "毕业后，我们依然在场",
  subtitle:
    "把散落在相册、聊天记录和心里的瞬间放回同一个地方。这里先留给高中的三年，也留给一年后的我们。",
  anniversary: "2024.06 - 2026.06 · 毕业周年纪念",
  heroImage: "/assets/campus-hero.png",
  footer: "2024届612班纪念网站"
};

export const contactLinks = [
  {
    label: "邮箱",
    href: "mailto:class@biss.click",
    icon: "fa-solid fa-envelope"
  },
  {
    label: "GitHub",
    href: "https://github.com/bishshi/class",
    icon: "fa-brands fa-github"
  },
  {
    label: "微信公众号",
    href: "#",
    icon: "fa-brands fa-weixin",
    qrImage: "https://pic.biss.click/image/44a5e576-5cf3-4752-bae2-70d74619324f.webp"
  }
];

export const navItems = [
  { label: "首页", href: "/" },
  { label: "三年时间线", href: "/timeline/" },
  { label: "照片墙", href: "/gallery/" },
  { label: "如今的我们", href: "/people/" },
  { label: "综合试卷", href: "/exam/" },
  { label: "留言墙", href: "/messages/" }
];

const leavingCampusDate = "2024-06-08";
const millisecondsPerDay = 24 * 60 * 60 * 1000;

const getDaysSince = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.max(0, Math.floor((today - start) / millisecondsPerDay));
};

export const stats = [
  { value: "1095+", label: "一起经过的高中日子" },
  { value: String(getDaysSince(leavingCampusDate)), label: "离开校园后的日子" },
  { value: "∞", label: "还会被想起的瞬间" }
];
