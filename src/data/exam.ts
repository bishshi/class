export const examIntro = {
  title: "综合素质检测",
  eyebrow: "Class 612 Exam",
  description:
    "一份写给 2024 届 612 班的特别试卷。网页保留正文、插图与公式，原始版式可下载 Word 原卷查看。",
  downloadHref: "https://s3.biss.click/OFFICE/exam-2024.pdf",
  previewHref: "https://file.biss.click/onlinePreview?url=aHR0cHM6Ly9zMy5iaXNzLmNsaWNrL09GRklDRS9leGFtLTIwMjQucGRm&watermarkTxt=%E4%BB%85%E4%BE%9B%E9%A2%84%E8%A7%88"
};

export const examMath: Record<string, string> = {
  setA:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mi>A</mi><mo>=</mo><mo>{</mo><mn>6</mn><mo>,</mo><mn>1</mn><mo>,</mo><mn>2</mn><mo>,</mo><mn>9</mn><mo>,</mo><mn>8</mn><mo>,</mo><mn>5</mn><mo>,</mo><mn>2</mn><mo>,</mo><mn>1</mn><mo>,</mo><mn>1,6</mn><mo>,</mo><mn>6,6</mn><mo>}</mo></math>',
  relation:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mo>-</mo><mn>1</mn><mo>≤</mo><mi>a</mi><mo>+</mo><mi>b</mi><mo>≤</mo><mn>4</mn><mo>,</mo><mo>-</mo><mn>1</mn><mo>≤</mo><mi>a</mi><mo>-</mo><mi>b</mi><mo>≤</mo><mn>2</mn></math>',
  expression:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mn>4</mn><mi>a</mi><mo>-</mo><mn>2</mn><mi>b</mi></math>',
  optionA:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mo>[</mo><mrow><mo>-</mo><mn>2,10</mn></mrow><mo>]</mo></mrow></math>',
  optionB:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow><mo>(</mo><mrow><mo>-</mo><mn>2,10</mn></mrow><mo>]</mo></mrow></math>',
  optionC:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mi>R</mi></math>',
  optionD:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mi mathvariant="normal">∅</mi></math>',
  doubleIntegral:
    '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mi>I</mi><mo>=</mo><mrow><msubsup><mo stretchy="false">∫</mo><mrow><mn>0</mn></mrow><mrow><mn>1</mn></mrow></msubsup><mrow><mrow><msubsup><mo stretchy="false">∫</mo><mrow><mn>0</mn></mrow><mrow><mn>1</mn><mo>-</mo><mi>x</mi></mrow></msubsup><mrow><mrow><mo>(</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mo>)</mo></mrow></mrow></mrow></mrow></mrow><mo> </mo><mi>d</mi><mi>y</mi><mo> </mo><mi>d</mi><mi>x</mi></math>'
};

export const examScoring = {
  choiceBonus: {
    label: "选择题全对奖励",
    points: 10,
    appliesTo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  choiceQuestions: [
    { number: 1, points: 5, answer: "B" },
    { number: 2, points: 5, answer: "D" },
    { number: 3, points: 5, answer: "B" },
    { number: 4, points: 5, answer: "A" },
    { number: 5, points: 5, answer: "C" },
    { number: 6, points: 5, answer: "C" },
    { number: 7, points: 5, answer: "D" },
    { number: 8, points: 5, answer: "D" },
    { number: 9, points: 5, answer: "C" },
    { number: 10, points: 5, answer: "A" },
    { number: 11, points: 5, answer: "B" },
    { number: 12, points: 5, answer: "" , freebie: true},
    { number: 18, points: 5, answer: "A" }
  ],
  fillQuestions: [
    {
      number: 13,
      points: 10,
      mode: "ordered-blanks",
      blankPoints: 2,
      answers: ["既", "也|仍", "只有", "才", "如果|一旦"],
      note: "按 ①▲ 到 ⑤▲ 的顺序填写答案。"
    },
    {
      number: 14,
      points: 30,
      mode: "unordered-names",
      blankCount: 56,
      answers: [
        "安梦伦",
        "毕爽爽",
        "陈可",
        "陈昕楠",
        "陈雨鑫",
        "程怡钊",
        "崔冬",
        "崔欣钇",
        "段星浩",
        "冯梦雪",
        "冯彦斌",
        "郭梦帆",
        "郭思涵",
        "郭紫瑜",
        "贺冰冰",
        "贺秀芸",
        "霍馨媛",
        "姬锦琛",
        "姜康坤",
        "焦敬泽",
        "琚泽浩",
        "李超鹏",
        "李琛",
        "李佳琦",
        "李丽桃",
        "李顺利",
        "李潇逸",
        "李晓坤",
        "李艳江",
        "李怡颖",
        "李宇川",
        "李炤锦",
        "路宗谕",
        "马明宇",
        "牛梦茹",
        "牛润锋",
        "牛温雅",
        "秦培源",
        "秦祎岚",
        "秦泽宇",
        "谭宇辉",
        "王德杰",
        "王琳柯",
        "王雪婧",
        "王宇锦",
        "王子玉",
        "卫宇坤",
        "吴子涵",
        "张晨雨",
        "张帆",
        "张妍忆",
        "张中华",
        "赵家祺",
        "赵壬雨",
        "周钰浩",
        "朱学航"
      ],
      penaltyPerMistake: 1,
      note: "人名无先后顺序；全对 30 分，每错、漏一个扣 1 分，最低分可以为负分。"
    },
    {
      number: 15,
      points: 20,
      mode: "image-titles",
      blankPoints: 5,
      answers: ["", "", "", ""],
      freebie: true,
      note: "按图片顺序填写标题。"
    }
  ],
  manualQuestions: [
    { number: 16, points: 5 },
    { number: 17, points: 5 },
    { number: 19, points: 5 },
    { number: 20, points: 10 },
    { number: 21, points: 10 },
    { number: 22, points: 10 },
    { number: 23, points: 10 },
    { number: 24, points: 40 },
    { number: 25, points: 30 }
  ]
};

export const examText = `
姓名：准考证号#########座位号##
2024届普通高中毕业班综合测试
综合素质检测
本试卷共8页，25题。全卷满分260分。考试用时150分钟。
注意事项：
考生要认真检查试题卷、答题卡有无缺印、漏印，监考员下发条形码上信息是否与本人相符，检查完毕后在试题卷、答题卡、草稿纸的相应位置填写信息。
在作答选择题时，用2B铅笔将答题卡上对应的答案标号涂黑，如需更改，请用橡皮擦净后改涂其他选项。在作答非选择题时，使用0.5mm 的黑色碳素笔作答；作答在试题卷、草稿纸以及答题卡非作答区域上的答案无效。
考试结束后，请将本试题卷和答题卡自行保管。
★祝考试顺利！★
一、选择题：在下面的小题中每题至少有一项符合题意，每小题5分，共12小题，共60分。漏选得2分，有选错的不得分，全部正确额外加10分。
如图为某班某次考试的成绩雷达图，读图并回答1-2小题：
[image:/assets/exam/image2.svg:某班某次考试成绩雷达图]
[q]下列说法中正确的有
①该班成绩中，英语学科总体成绩较好；
②该班所有同学英语科成绩一定高于平均分；
③没有足够证据表明语文学科与英语学科成绩的方差相同；
④在各科成绩中，平均水平最差的为物理科。
A.①④B.①③④C.③④D.①②③④
[q]请推断该班同学甲的英语科成绩
A. 优秀B. 良好C. 较差D. 无法推断
[q]集合 [math:setA] 中，元素的个数为
A. 9 B. 6 C. 7 D. 8
阅读本段材料，回答4-5 小题：
假定你正在参加你校毕业典礼，突然你想起数学教师讲的一道题，题目如下：已知不等关系 [math:relation]，求 [math:expression] 的取值范围。
[q]解答材料中题目
A.[math:optionA] B.[math:optionB] C.[math:optionC] D.[math:optionD]
[q]在解答与材料中相类似题目时，往往会出错，其中有一种最典型的错误，原因是
A. 水平不足B. 题目错了
C. 在解答时扩大了𝑎, bD. 从没错过
你将阅读一段文字，并在文中的横线上选出恰当的成语。
在高中三年中，我们与老师和同学们▲，虽然历经风雨，但我们不轻言放弃、▲，我们始终相信阳光总在风雨后，▲，我们一定会拥有美好的明天！
[q]在文中的横线上选出恰当的成语
A. 戮力同心坚持不懈苦尽甘来B. 披荆斩棘戮力同心苦尽甘来
C. 坚持不懈苦尽甘来戮力同心D. 披荆斩棘坚持不懈戮力同心
高中三年，你是否还记得班主任对我们的教诲？回答7-8 小题。
[q]在高二年级，班主任来班级的频率
A. 全天都在B. 上午会在C. 下午会在D. 经常不在
[q]夏季，班主任经常在教室
A. 认真工作B. 玩手机C. 睡觉D. 吹空调
[q]At the graduation ceremony, we ▲uniform attire and celebrated graduation together.
A. take up B. make up C. dress up D. turn up.
[q]元旦晚会上，有一首必唱的歌，为
A.《高平一中赞歌》B.《高平一中校歌》C. 流行音乐D.《七律·长征》
[q]通过十二年的学习，我们收获了很多。下列说法错误的是
A. 我们参加了丰富的实践活动，学会了做人，学会了做事
B. 我们在学海中泛舟，懂得了书本知识比实践能力更重要
C. 我们结交一群志同道合的朋友，在成长道路上风雨同行
D. 我们不断地修炼着道德操守，坚持与德并进，与法同行
[q]在毕业后我们都各奔东西，不知你是否过上了自己想要的大学生活，现在请评价一下你的大学生活。
A.如鱼得水B.不尽人意C.勉强还行D.一塌糊涂
无论你的选择如何，都是满分答案。请记住生活中总有美好的事物。不要被当前的不如意所阻碍！
二、填空题：共3小题，共50分。
[q]在下列材料的空白处填入合适的关联词语（每空2分，共10分）：
青年人富有理想和抱负，憧憬着美好的未来，这是青年人的特点，①▲是优点。②▲须懂得，个人的抱负不可能孤立地实现，③▲将个人理想同时代和人民的要求紧密结合起来，用自己的知识和本领为祖国、为人民服务，④▲能使自身价值得到充分体现。⑤▲脱离时代，脱离人民，必将一事无成。
[q]默写题：在本题中请你默写你班所有同学的姓名，全对得30分，每错、漏一个扣1分，最低分可以为负分，若为负分，则从总分中倒扣。
[q]在本题中你将看到几幅图片请为每幅图片编写一个标题，每处5分，共20分。
[gallery:/assets/exam/image3.jpg,/assets/exam/image4.jpeg,/assets/exam/image5.jpg,/assets/exam/image6.jpg]
三、读·思：共分3部分，共30分。
（一）阅读：本部分共两小题，每小题5分，共10分。
①白求恩同志毫不利己专门利人的精神，表现在他对工作的极端的负责任，对同志对人民的极端的热忱。每个共产党员都要学习他。不少的人对工作不负责任，拈轻怕重，把重担子推给人家，自己挑轻的。一事当前，先替自己打算，然后再替别人打算。出了一点力就觉得了不起，喜欢自吹，生怕人家不知道。对同志对人民不是满腔热忱，而是冷冷清清，漠不关心，麻木不仁。这种人其实不是共产党员，至少不能算一个纯粹的共产党员。从前线回来的人说到白求恩，没有一个不佩服，没有一个不为他的精神所感动。晋察冀边区的军民，凡亲身受过白求恩医生的治疗和亲眼看过白求恩医生的工作的，无不为之感动。每一个共产党员，一定要学习白求恩同志的这种真正共产主义者的精神。
②白求恩同志是个医生，他以医疗为职业，对技术精益求精；在整个八路军医务系统中，他的医术是很高明的。这对于一班见异思迁的人，对于一班鄙薄技术工作以为不足道、以为无出路的人，也是一个极好的教训。
[q]简述作者观点。（100字以内）
[q]这段话对你有什么启示？（150字以内）
（二）文言文阅读：本部分共两小题，每小题5分，共10分。
陆壹贰序【现】谭宇辉
三载韶光织锦，聚星芒于庠序；一室肝胆同辉，化春雨润青衿。望流云而思俊采，抚书卷以慕长风。敢竭鄙怀，恭疏短引：
观夫师道巍巍，各秉圭璋[1]。坤霖骋骏，驰骋绿茵振木铎；玉先雕龙，吞吐诗骚点碧霄。少南布算，谈笑间星河倒转；雪梅沥血，丹忱处桃李无言。永珍叱咤惊雷[2]，口劈物理玄关；海燕呢喃细雨，手润化学幽微。英莉探生命之妙，王琼遗蕙兰之芳。至若张琴，申彤余音绕梁，诸师并耀，皆化春泥护新蕊。
至若男儿列岫[3]，尽展峥嵘。陈可执牛耳而谐六艺，宇辉扫浊尘以净八方。培源擎纛引龙[4]骧虎步，昕楠振玉和鸾[5]凤清声。怡钊苦诣，似精卫填沧海。明宇逐风，若夸父追高日。子涵，泽浩掌戏乾坤，驭电驰霆[6]。宇锦绝笑如云外钟，琳柯诙谐似通灵鬼。宇川冠绝篮场，爽爽解构天机。晨雨，星浩倚案听蝉，枕流漱石鸣[7]。彦斌称恙犹戏谑，顺利蓄髯[8]自轩昂。宇坤扣篮惊鸿影，潇逸裂石遏云歌。超鹏吐凤嘲群彦，泽宇持正镇佞邪。宗谕戏谑藏锥颖，炤锦通达聚虹霓[9]。壬雨，家祺，润锋挟雷吐烈焰[10]，融霜成笑；佳琦禅心映佛光，温婉为歌。李琛魁硕，力拔山兮盖世，梦帆易途，满腹玄鸡梗语。且看敬泽，晓坤，学航，思涵，德杰，雨鑫，崔冬，锦琛，祎岚渊默抱璞，伏枥藏[11]。百态峥嵘尽琳琅也。
尤慕娥眉璀璨，独占风华。欣钇执印[12]，凛若秋霜裁玉律；子玉挥毫，灿如春日照朱阑[13]。冰冰怀瑾，璞玉终耀荆山彩；中华泼墨，才华直夺阆苑[14]色。梦伦渊默参星斗，怡颖凝脂掬月华。紫瑜拈花说岐黄，嫣然解尽三焦语；梦雪赧颊叱风雨[15]，红妆偏胜七尺躯。馨媛眸转银汉，惊鸿一瞥倾人国；艳江笑漾梨涡，豆蔻初妆动帝畿[16]。丽桃译鸾通九译，妍忆容华羞洛神。梦茹凌波涉流芳，张帆莲步自生香。雪婧倩笑，云髻明灭半遮面；丹唇外朗，修眉联娟锁珠帘。温雅热忱，光照两性之友，众星拱月，皎若冰凌之心[17]。观其群芳：或如昆山片玉，或似赤水玄珠，皆钟造化之神秀也。
辉，三尺微命，一介农子，难忘师生之情，同窗之悦。既天赐文韬，唯以潘江陆海，铭此少年游——
教泽深兮沐春阳，同窗契兮凌雪霜。
男儿志在拏云手，女儿心凝韫玉光。
待乘长风破巨浪，犹记当时明月廊！
（选用时有删改）
注释：
[1]圭璋：一种玉制礼器，象征着美好的品质。
[2]叱咤惊雷：有震撼力和威严。
[3]列岫：排列的山峰，这里指依次介绍同学。
[4]擎纛引龙：举着旗引着龙，形容先锋作用。
[5]振玉和鸾：玉饰，车铃的声响，形容好听的声音。
[6]掌戏乾坤，驭电驰霆：戏指游戏，电指电子，总体意思就是玩电子游戏。
[7]倚案听蝉，枕流漱石鸣：即瞌睡说的雅称。
[8]蓄髯：留着胡须。
[9]聚虹霓：聚集光彩，指聚集目光，受同学们爱戴。
[10]挟雷吐烈焰：性情刚烈。
[11]渊默抱璞，伏枥藏锋：闷声干大事。
[12]执印：有官威，这里指能很好地管理班级。
[13]朱阑：红色的围栏，也指华丽的建筑。
[14]阆苑：神仙居住的地方，五光十色，色彩缤纷。
[15]赧颊叱风雨：赧颊指害羞，叱风雨指有气势，形容女汉子。
[16]帝畿：代指皇帝。
[17]冰凌之心：有柔情似水，也有冰凌刀锋，形容爱憎分明。
[q]文中描述“男儿列岫，尽展峥嵘”，这句话表达的意思最接近（请将答案填涂在答题卡上）：
A. 男儿志向高远，展示出非凡的才华B.男儿在困境中展示自我
C. 男儿低调内敛，不张扬D. 男儿注重修身，心境高远
[q]文中多次提到“诸师并耀”，请结合文意解释这句话的含义，并谈谈其对作者的影响。
[q]阅读与改错：本部分中你将阅读五个名句，若有错误请使用修改符号改正，每处2分，共10 分。
①少无世俗韵，性本爱秋山。
②####难为听，今夜闻君琵琶语，如听仙乐耳暂明。
③故不积硅步无以致千里，不积小流无以成江海。
④奈何取之尽zi’zhu,用之如泥砂？
⑤寄浮游于天地，渺沧海之一粟。
四、解答题：共2小题，每小题10分，共20分。
[q]计算以下重积分：
[math:doubleIntegral]
[q]请你写出某个最令你印象深刻的事件，并简要评析。
五、综合操作题：共1小题，共10分。
[q]本题共五小题，每小题2分，共10分，请你写出正确且合理的操作：
（1）假定英语老师正在检查作业，而你恰好忘记写了，请你写出你的应对方式；
（2）牛坤霖老师正在检查迟到，而你姗姗来迟，你会怎么解释（辩解）？
（3）周练啦！你肯定会看到同学们互帮互助（抄），对此情况，你会怎么做？
（4）假定牛坤霖老师制定一些班规，你会有何反应？
（5）毕业啦！你有何感想？
六、读·写：共1小题，共40分。
[q]请在以下A、B两题中选做一题，并将自己选做的题号填涂在答题卡的相应位置上：若有多做，按第一题计分：若考生多涂、漏涂选作标记，按A题计分。
A
在高中毕业前，我们总是憧憬着大学生活，但是到大学之后一切似乎和自己想的不太一样，老师也说大学才是开始学习的时候，是更苦更累的时候。一些人发出了“要回高中休息”的想法。
读了这则材料，你有什么感想？请你写一篇450字左右的作文。
要求：结合材料，选好角度，确定立意，明确文体，自拟标题；不要套作，不得抄袭；不得泄露个人信息；不少于450字。
B
2020年暑假，高考成绩676分，湖南省全省文科排名第四的留守女孩钟芳蓉因选择了北大考古专业而备受关注。钟芳蓉表示，选择该专业是因为自己从小喜欢历史和文物，希望将来能读研深造，做考古研究。对于她的选择，有人为她浪费了高分而感到惋惜，担忧她毕业后的就业前景和经济状况；也有人支持她的选择。
读了这则材料，你有什么感想？请你就未来人生规划写一篇450字左右的作文。
要求：结合材料，选好角度，确定立意，明确文体，自拟标题；不要套作，不得抄袭；不得泄露个人信息；不少于450字。
Ⅶ.Writing,Full mark:30.
Direction: in this section, you'll read a passage and then please you continue the story. The words are not limited.
From 612 to the Journey Ahead
The 612 class, consisting of fifty-six students, embarked on their journey from the first day of school until graduation. The class name "612" became synonymous (同义的) with unity and camaraderie (友情), as students from diverse backgrounds and families came together as a tightly-knit（紧密结合）group.
Over the past few years, the 612-class faced numerous challenges and experienced significant growth. They shared countless mornings under the rising sun, confronted the pressures of exams, and celebrated both successes and failures together. Guided by their teachers, they supported and uplifted one another, forging a unique bond.
As time passed, the students of 612 began to showcase(展示) their individual talents and potentials. Some excelled academically, becoming the class's academic achievers (学术佼佼者). Others displayed remarkable artistic talents, becoming the artistic pillars (艺术支柱) of the class. Some actively engaged in social activities, becoming the class's pioneers (先锋) in community service. Each person worked hard in their respective fields, adding vibrant colors to the class.
As graduation approached, the students of 612 started contemplating their futures. Some dreamed of becoming doctors, contributing to people's health and well-being. Others aspired to be scientists, exploring the mysteries of the unknown. And there were those who yearned to become artists, using their creativity to convey emotions. Regardless of their dreams, they carried with them confidence and passion for the future.
On the final day of 612, the classmates gathered to reminisce about their precious time together. They shared stories of personal growth and achievements, filled with deep emotions. Although parting ways was inevitable, they all understood that this class had provided them with endless support and encouragement, leaving an indelible mark (深刻的印记) in their hearts.
The future is an unknown realm, brimming with infinite possibilities. The students of 612 believe that no matter how winding (曲折) the path ahead may be, they will march forward with unwavering determination. They will use their efforts and talents to realize their dreams and make meaningful contributions to society.
In the closing chapter of their story, the 612 classmates bid farewell, knowing that it marks the beginning of a new journey. They carry their youthful dreams, venturing into a future that awaits them. They believe that, together, they will create a brighter tomorrow, armed with their dedication and aspirations.
[q]Continuation: Several years later, you find it while you're sorting through your things, and your mind flips back to that summer…
本试题卷到此结束，试题卷与答题卡均无需上交，请妥善保管
青春 席慕容
所有的结局都已写好
所有的泪水也都已启程
却忽然忘了是怎么样的一个开始
在那个古老的不再回来的夏日
无论我如何地去追索
年轻的你只如云影掠过
而你微笑的面容极浅极淡
逐渐隐没在日落后的群岚
遂翻开那发黄的扉页
命运将它装订的极为拙劣
含着泪我一读再读
却不得不承认
青春是一本太仓促的书
[注]那种对青春远逝的无限伤感、那种对生命短暂的无穷幽怨仿佛立刻遮蔽了天空，紧紧攫住了读者的心；就像那起程的泪水汹涌而来，打湿了每一个敏感而脆弱的生命。
`;
