import type { PhotoTopic } from "./photo-types";
import { bjrzTopic } from "./photo-topics/bjrz";
import { candidTopic } from "./photo-topics/candid";
import { classroomTopic } from "./photo-topics/classroom";
import { eventsTopic } from "./photo-topics/events";
import { graduationDayTopic } from "./photo-topics/graduation-day";

export const galleryIntro = {
  title: "照片墙",
  text: "照片按专题收纳：教室日常、班级活动、毕业那天、没被摆拍的瞬间。点进专题后，就像把一叠照片随手摊在桌上慢慢翻。"
};

export const photoTopics: PhotoTopic[] = [
  bjrzTopic,
  classroomTopic,
  eventsTopic,
  graduationDayTopic,
  candidTopic
];
