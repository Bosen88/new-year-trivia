import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

// --- 內建圖示 (徹底解決外部套件找不到的錯誤) ---
const IconWrapper = ({ children, className }) => (
  // 已經修正 strokeLinejoin 屬性
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
const Trophy = (p) => <IconWrapper {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></IconWrapper>;
const Timer = (p) => <IconWrapper {...p}><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></IconWrapper>;
const Play = (p) => <IconWrapper {...p}><polygon points="5 3 19 12 5 21 5 3"/></IconWrapper>;
const Share2 = (p) => <IconWrapper {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></IconWrapper>;
const RefreshCcw = (p) => <IconWrapper {...p}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></IconWrapper>;
const Medal = (p) => <IconWrapper {...p}><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="M13 12l5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><polyline points="12 18 10.5 16.5 12.5 15"/></IconWrapper>;
const Sparkles = (p) => <IconWrapper {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.2 1.2L3 12l5.8 1.9a2 2 0 0 1 1.2 1.2L12 21l1.9-5.8a2 2 0 0 1 1.2-1.2L21 12l-5.8-1.9a2 2 0 0 1-1.2-1.2L12 3Z"/></IconWrapper>;
const CheckCircle = (p) => <IconWrapper {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconWrapper>;
const XCircle = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></IconWrapper>;
const Cloud = (p) => <IconWrapper {...p}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></IconWrapper>;
const AlertTriangle = (p) => <IconWrapper {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></IconWrapper>;
const Save = (p) => <IconWrapper {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconWrapper>;
const LinkIcon = (p) => <IconWrapper {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></IconWrapper>;
const Copy = (p) => <IconWrapper {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></IconWrapper>;
const Users = (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconWrapper>;

// --- 題目設定 (擴充至 50 題) ---
const QUESTIONS = [
  { id: 1, question: "過年吃魚代表「年年有餘」，請問這條魚通常要怎麼吃才吉利？", options: ["全部吃光光", "剩下魚頭跟魚尾", "只吃魚肚", "一定要做成紅燒"], answer: "剩下魚頭跟魚尾", explanation: "留下頭尾代表「有頭有尾」且「剩餘」下來，象徵財富留得住。" },
  { id: 2, question: "傳說中「年獸」最怕什麼東西？", options: ["紅色、火光、巨大聲響", "水、冰塊、安靜", "獅子、老虎、大象", "元寶、紅包、金條"], answer: "紅色、火光、巨大聲響", explanation: "所以過年才會貼紅春聯、放鞭炮來嚇跑年獸。" },
  { id: 3, question: "大年初一有一個禁忌，就是不能做什麼事，以免把財運掃出門？", options: ["洗澡", "睡午覺", "掃地與倒垃圾", "吃早餐"], answer: "掃地與倒垃圾", explanation: "初一掃地倒垃圾象徵把家裡的福氣和財氣都掃出去了。" },
  { id: 4, question: "餃子因為形狀的關係，在過年吃象徵什麼？", options: ["團團圓圓", "招財進寶(像元寶)", "長命百歲", "步步高升"], answer: "招財進寶(像元寶)", explanation: "餃子的形狀像元寶，象徵新的一年財源滾滾。" },
  { id: 5, question: "貼春聯時，若貼「福」字，為什麼有人會故意倒著貼？", options: ["貼錯了", "代表福氣倒(到)了", "為了美觀", "嚇跑年獸"], answer: "代表福氣倒(到)了", explanation: "「倒」與「到」諧音，象徵福氣到了家門口。" },
  { id: 6, question: "過年發紅包的習俗，原本是為了驅邪，這錢叫做什麼？", options: ["買路錢", "壓歲錢(壓祟)", "平安錢", "過路費"], answer: "壓歲錢(壓祟)", explanation: "古時「祟」是小妖，「壓祟」是為了保佑孩子平安，後來演變成壓歲錢。" },
  { id: 7, question: "吃「年糕」的寓意是什麼？", options: ["黏住好運", "年年高升", "甜甜蜜蜜", "趕走年獸"], answer: "年年高升", explanation: "年糕諧音「年高」，寓意工作和生活一年比一年提高。" },
  { id: 8, question: "正月初五迎財神，這一天又被稱為什麼日子？", options: ["破五節", "元宵節", "寒食節", "人日"], answer: "破五節", explanation: "初五是「破五」，意味著過年期間的諸多禁忌在這天可以破除。" },
  { id: 9, question: "除夕夜「守歲」的主要寓意是什麼？", options: ["為了打麻將", "為父母添壽", "等待財神爺", "怕年獸來攻擊"], answer: "為父母添壽", explanation: "守歲有辭舊迎新的意思，晚輩守歲是為長輩祈求長命百歲。" },
  { id: 10, question: "過年期間如果不小心打破碗盤，要馬上說什麼話來化解？", options: ["碎碎(歲歲)平安", "對不起我錯了", "舊的不去新的不來", "落地開花"], answer: "碎碎(歲歲)平安", explanation: "取其諧音「歲歲平安」，將不好的兆頭轉化為吉祥的祝福。" },
  { id: 11, question: "過年送禮時，絕對不能送什麼東西，因為諧音不吉利？", options: ["水果", "時鐘", "茶葉", "餅乾"], answer: "時鐘", explanation: "送鐘諧音「送終」，是非常不吉利的禮物。" },
  { id: 12, question: "過年吃「蘿蔔糕」象徵什麼？", options: ["好彩頭", "步步高升", "全家團圓", "大吉大利"], answer: "好彩頭", explanation: "蘿蔔台語是「菜頭」，象徵新的一年有「好彩頭」。" },
  { id: 13, question: "過年擺放「橘子」是為了祈求什麼？", options: ["早生貴子", "大吉大利", "聰明伶俐", "平安健康"], answer: "大吉大利", explanation: "橘子的「吉」字象徵大吉大利，顏色金黃也象徵財富。" },
  { id: 14, question: "包紅包時，金額通常要避免出現哪個數字？", options: ["4", "6", "8", "0"], answer: "4", explanation: "數字 4 諧音「死」，在傳統習俗中較為忌諱，應盡量避免。" },
  { id: 15, question: "過年吃「長年菜」(芥菜)時，要注意什麼吃法？", options: ["切成小段吃", "一口吞下去", "一根從頭吃到尾不能咬斷", "煮爛一點再吃"], answer: "一根從頭吃到尾不能咬斷", explanation: "長年菜象徵長命百歲，吃的時候如果不咬斷，代表壽命長長久久。" },
  { id: 16, question: "大年初一早上，傳統習俗建議吃什麼？", options: ["稀飯", "葷食", "吃素", "麵包"], answer: "吃素", explanation: "俗話說「初一早吃齋，恰贏吃一年菜」，象徵慈悲與新年的清淨開始。" },
  { id: 17, question: "過年期間，為什麼盡量不要使用剪刀或針線？", options: ["怕刺傷手", "怕剪斷財路", "怕吵到鄰居", "怕剪破新衣"], answer: "怕剪斷財路", explanation: "傳統認為動刀剪會「剪斷財路」或招致口舌是非。" },
  { id: 18, question: "如果要欠錢，最晚應該在什麼時候還清，不要欠過年？", options: ["初一早上", "初五開工", "除夕夜之前", "元宵節之前"], answer: "除夕夜之前", explanation: "「欠錢不要欠過年」，代表將去年的霉氣結清，不把債務帶到新的一年。" },
  { id: 19, question: "過年吃「鳳梨」象徵什麼好運？", options: ["旺旺來", "平安", "健康", "聰明"], answer: "旺旺來", explanation: "鳳梨台語諧音「旺來」，象徵好運旺旺來。" },
  { id: 20, question: "「走春」這個習俗，原本的意思是什麼？", options: ["跑步運動", "出門走走去沾喜氣", "去百貨公司血拼", "在家睡覺"], answer: "出門走走去沾喜氣", explanation: "走春（行春）是指大年初一出門走動，到親友家拜年或去廟宇祈福。" },
  { id: 21, question: "過年大掃除時，掃地要怎麼掃才正確？", options: ["由內往外掃", "由外往內掃", "隨便掃", "只掃房間"], answer: "由外往內掃", explanation: "由外往內掃象徵將財氣掃進門，若往外掃則代表將財運掃出門。" },
  { id: 22, question: "「元宵節」是農曆的哪一天？", options: ["一月一日", "一月十五", "二月二日", "一月五日"], answer: "一月十五", explanation: "農曆正月十五是元宵節，又稱「小過年」。" },
  { id: 23, question: "過年期間，如果打破東西，要用什麼顏色的紙包起來？", options: ["紅紙", "白紙", "報紙", "黃紙"], answer: "紅紙", explanation: "用紅紙包起來並默唸「歲歲平安」，是為了化解煞氣轉為吉祥。" },
  { id: 24, question: "除夕夜吃的「團圓飯」又被稱為什麼？", options: ["尾牙", "年夜飯", "開工飯", "滿月酒"], answer: "年夜飯", explanation: "除夕夜全家團聚吃的飯稱為年夜飯或圍爐。" },
  { id: 25, question: "「壓歲錢」通常是放在哪裡給孩子睡覺？", options: ["口袋裡", "枕頭下", "襪子裡", "桌子上"], answer: "枕頭下", explanation: "放在枕頭下有「壓祟」保平安的意味。" },
  { id: 26, question: "大門口的「福」字，通常建議怎麼貼？", options: ["正貼", "倒貼", "斜貼", "不貼"], answer: "正貼", explanation: "大門是莊重之地，福字應正貼，象徵迎福進門；水缸或垃圾桶才倒貼。" },
  { id: 27, question: "過年吃「發糕」代表什麼意思？", options: ["發大財", "發胖", "發呆", "發脾氣"], answer: "發大財", explanation: "發糕裂縫越開，象徵發得越好，寓意發財高升。" },
  { id: 28, question: "傳統習俗中，大年初二要回哪裡？", options: ["回娘家", "回婆家", "去公司", "去出國"], answer: "回娘家", explanation: "初二回娘家是出嫁女兒回娘家探親的日子。" },
  { id: 29, question: "哪一位歷史人物常被奉為「文財神」？", options: ["關羽", "比干", "趙公明", "孫悟空"], answer: "比干", explanation: "比干因無心而不偏私，被奉為文財神；關羽和趙公明多被奉為武財神。" },
  { id: 30, question: "過年期間忌諱在床上做什麼事，以免整年病懨懨？", options: ["滑手機", "白天睡覺", "吃東西", "看書"], answer: "白天睡覺", explanation: "初一白天睡覺象徵一整年都會懶散或病懨懨的，所以要早起走春。" },
  { id: 31, question: "過年常吃「開心果」，它的主要寓意是什麼？", options: ["開開心心", "多子多孫", "長命百歲", "步步高升"], answer: "開開心心", explanation: "開心果不僅因為裂開的樣子像笑容，也直接寓意新的一年開開心心。" },
  { id: 32, question: "「初四接神」，主要是迎接哪一位神明回到家中？", options: ["灶神", "財神", "門神", "床母"], answer: "灶神", explanation: "大年初四是迎接灶神與眾神明返回民間的日子。" },
  { id: 33, question: "俗話說「吃瓜子好過日子」，吃瓜子在過年還有什麼寓意？", options: ["多子多孫", "步步高升", "長命百歲", "平平安安"], answer: "多子多孫", explanation: "瓜子象徵多子多孫、多財多福，是過年必備的零嘴。" },
  { id: 34, question: "台灣南部客家人的「長年菜」通常是指哪一種蔬菜？", options: ["連根帶葉的菠菜", "高麗菜", "地瓜葉", "芹菜"], answer: "連根帶葉的菠菜", explanation: "北部閩南人過年多吃芥菜，而南部部分客家人則是吃連根帶葉的菠菜作為長年菜。" },
  { id: 35, question: "過年擺放「蘋果」代表什麼意思？", options: ["平平安安", "大吉大利", "招財進寶", "長命百歲"], answer: "平平安安", explanation: "蘋果的「蘋」諧音「平」，象徵新的一年平平安安。" },
  { id: 36, question: "大年初一早上若要出門，傳統上會先做什麼事來迎好運？", options: ["看農民曆找「吉方」走", "先吃三碗飯", "大叫三聲", "先洗個澡"], answer: "看農民曆找「吉方」走", explanation: "傳統出門「走春」時，會先朝著農民曆上記載的喜神或財神方位走，以迎接好運。" },
  { id: 37, question: "過年期間為什麼要避免說「破」、「死」、「病」等字眼？", options: ["犯忌諱", "會招來年獸", "會破財", "會變老"], answer: "犯忌諱", explanation: "過年期間講究吉利，說這些字眼被認為會觸霉頭、帶來一整年的霉運。" },
  { id: 38, question: "大年初一最好穿什麼顏色的衣服比較喜氣？", options: ["紅色或亮色系", "黑色", "白色", "灰色"], answer: "紅色或亮色系", explanation: "紅色代表喜慶與吉祥，黑色與白色在傳統中較常與喪事連結，過年會盡量避免。" },
  { id: 39, question: "「猜燈謎」是哪一個過年節日的傳統活動？", options: ["元宵節", "除夕", "初一", "初五"], answer: "元宵節", explanation: "正月十五元宵節賞花燈時，傳統上會在燈籠上貼謎語讓人猜。" },
  { id: 40, question: "傳統上，紅包袋用過後應該怎麼處理最吉利？", options: ["留到元宵節後再丟", "馬上丟掉", "撕破", "退還給長輩"], answer: "留到元宵節後再丟", explanation: "將紅包袋留到正月十五（元宵節）過後再丟，象徵將好運和財氣留在家中。" },
  { id: 41, question: "春聯中有一種菱形的紅紙，上面只寫一個字（如春、福、滿），這種春聯稱為什麼？", options: ["斗方", "春條", "門神", "橫批"], answer: "斗方", explanation: "寫著單個字的菱形春聯稱為「斗方」，常貼在門、米缸或冰箱上。" },
  { id: 42, question: "「爆竹一聲除舊歲」的下一句是什麼？", options: ["桃符萬戶更新春", "歡歡喜喜迎新年", "家家戶戶慶團圓", "歲歲平安福滿門"], answer: "桃符萬戶更新春", explanation: "出自王安石的《元日》：「爆竹聲中一歲除，春風送暖入屠蘇。千門萬戶曈曈日，總把新桃換舊符」。" },
  { id: 43, question: "大年初九是哪位神明的生日，俗稱「天公生」？", options: ["玉皇大帝", "土地公", "媽祖", "觀世音菩薩"], answer: "玉皇大帝", explanation: "初九是玉皇大帝的聖誕，民間會在這天拜天公以祈求庇佑。" },
  { id: 44, question: "過年期間，拜年遇到親友說「恭喜」，最好的回應是什麼？", options: ["同喜同喜", "不用客氣", "你也是", "好說好說"], answer: "同喜同喜", explanation: "「同喜同喜」代表將福氣和喜悅互相分享，是傳統上最得體的回應。" },
  { id: 45, question: "傳統習俗中，哪一天被稱為「人日」（全人類的生日）？", options: ["大年初七", "大年初一", "除夕", "元宵節"], answer: "大年初七", explanation: "相傳女媧在第七天造出人類，因此正月初七被稱為「人日」。" },
  { id: 46, question: "過年吃「韭菜」的寓意是什麼？", options: ["長長久久", "招財進寶", "聰明伶俐", "平平安安"], answer: "長長久久", explanation: "「韭」的發音與「久」相同，象徵壽命與好運都能長長久久。" },
  { id: 47, question: "在過年期間，如果衣服破了，傳統上會怎麼做？", options: ["過完年再補", "馬上拿針線補", "直接丟掉", "當抹布"], answer: "過完年再補", explanation: "過年期間忌諱動刀剪與針線，以免將財富縫死或招來口角是非。" },
  { id: 48, question: "初二回娘家時，女兒帶回家的伴手禮數量通常有什麼講究？", options: ["必須是雙數", "必須是單數", "越多越好", "不限制"], answer: "必須是雙數", explanation: "傳統習俗中認為「好事成雙」，所以回娘家的禮物必須是雙數以求吉利。" },
  { id: 49, question: "傳統上過年期間不可以「打罵小孩」，主要是為什麼？", options: ["怕小孩哭鬧招來霉運", "怕吵到鄰居", "怕年獸聽見", "純粹為了家庭和諧"], answer: "怕小孩哭鬧招來霉運", explanation: "古人認為過年期間家中有人哭泣會帶來霉運，因此家長通常會對小孩特別寬容。" },
  { id: 50, question: "台灣俗諺「初一早，初二早，初三睏到飽」，為什麼初三要「睏到飽」？", options: ["因為是老鼠娶親日", "因為前兩天太累", "因為初三要拜財神", "因為天氣通常很冷"], answer: "因為是老鼠娶親日", explanation: "相傳初三是老鼠娶親日，為避免打擾老鼠且避免「赤狗日」起口角，習俗上會晚起或待在家。" }
];

// ⚠️⚠️⚠️ 雲端設定區 ⚠️⚠️⚠️
// 請將您 Firebase 後台取得的設定貼在這裡
const firebaseConfig = {
  apiKey: "AIzaSyCT_GeU0wjX9wv4CzCfRfK6Q_vjrkxf_GA",
  authDomain: "know-fddfc.firebaseapp.com",
  projectId: "know-fddfc",
  storageBucket: "know-fddfc.firebasestorage.app",
  messagingSenderId: "352336546183",
  appId: "1:352336546183:web:7722955bb5a37207066b22"
};

// --- Firebase 初始化邏輯 ---
let app, auth, db;
let isCloudEnabled = false;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isCloudEnabled = true;
    console.log("🔥 Firebase 連線成功！雲端功能已啟用。");
  } catch (e) {
    console.error("Firebase 初始化失敗:", e);
  }
}

const appId = 'cny_game_v1';

// Confetti Effect
const Confetti = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#FFD700', '#FF0000', '#FFFFFF'][Math.floor(Math.random() * 3)],
            width: '10px',
            height: '10px',
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // 成績與群組相關狀態
  const [scoreStatus, setScoreStatus] = useState('calculating');
  const [existingRecord, setExistingRecord] = useState(null);
  const [currentFinalStats, setCurrentFinalStats] = useState({ score: 0, time: 0 });
  
  // 群組功能
  const [groupId, setGroupId] = useState('public');
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [showGroupJoiner, setShowGroupJoiner] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState('');
  const [joinGroupCode, setJoinGroupCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);

  // --- 自動載入 Tailwind CSS (確保沒有安裝 Tailwind 時也能完美顯示) ---
  useEffect(() => {
    if (window.tailwind) {
      setIsTailwindLoaded(true);
      return;
    }
    const scriptId = 'tailwind-cdn-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    script.onload = () => setIsTailwindLoaded(true);
    const fallbackTimer = setTimeout(() => setIsTailwindLoaded(true), 1500);
    return () => clearTimeout(fallbackTimer);
  }, []);

  // --- 解析網址參數 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');
        if (cleanId) setGroupId(cleanId);
    }
  }, []);

  // --- 1. Firebase 登入 ---
  useEffect(() => {
    if (!isCloudEnabled) return;
    
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/admin-restricted-operation') {
          console.error("🔥 Firebase 錯誤：您尚未在 Firebase 後台開啟「匿名登入 (Anonymous)」功能！請前往 Firebase Console -> Authentication -> Sign-in method 啟用。");
          alert("Firebase 設定未完成：請前往 Firebase 後台啟用「匿名登入 (Anonymous)」才能儲存雲端分數喔！");
        } else {
          console.error("Auth error:", error);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 2. 監聽雲端排行榜資料 ---
  useEffect(() => {
    if (!isCloudEnabled) {
      const localKey = `cny_local_${groupId}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setLeaderboard(JSON.parse(saved));
      } else {
        setLeaderboard([]);
      }
      return;
    }

    if (!user) return;
    setLoadingLeaderboard(true);
    
    const collectionName = `cny_lb_${groupId}`;
    const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const sortedData = data.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.time !== b.time) return a.time - b.time;
        return b.timestamp - a.timestamp; 
      }).slice(0, 50);

      setLeaderboard(sortedData);
      setLoadingLeaderboard(false);
    }, (error) => {
      console.error("Leaderboard error:", error);
      setLoadingLeaderboard(false);
    });

    return () => unsubscribe();
  }, [user, groupId]);

  // --- 3. 計時器邏輯 ---
  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      setTimer(0);
      
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        setTimer(elapsed);
      }, 50);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    if (!playerName.trim()) return;
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
    setRandomQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimer(0);
    setGameState('playing');
    setCopySuccess(false);
    setScoreStatus('calculating');
    setExistingRecord(null);
  };

  const handleAnswer = (option) => {
    if (showExplanation) return;
    setSelectedOption(option);
    const correct = option === randomQuestions[currentQuestionIndex].answer;
    setIsAnswerCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);

    setTimeout(() => {
      setShowExplanation(false);
      setSelectedOption(null);
      if (currentQuestionIndex < randomQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishGame(correct);
      }
    }, 2000);
  };

  const finishGame = async (lastAnswerCorrect) => {
    const endTime = Date.now();
    const finalTime = (endTime - startTimeRef.current) / 1000;
    setTimer(finalTime);
    setGameState('result');
    
    const finalScore = score + (lastAnswerCorrect ? 1 : 0);
    setCurrentFinalStats({ score: finalScore, time: finalTime });

    // --- 單機版邏輯 ---
    if (!isCloudEnabled) {
      setScoreStatus('calculating');
      const localKey = `cny_local_${groupId}`;
      const saved = JSON.parse(localStorage.getItem(localKey) || '[]');
      
      const existingIndex = saved.findIndex(p => p.name === playerName);
      let isBetter = true;
      
      if (existingIndex !== -1) {
        const oldRecord = saved[existingIndex];
        setExistingRecord(oldRecord);
        if (finalScore < oldRecord.score || (finalScore === oldRecord.score && finalTime >= oldRecord.time)) {
          isBetter = false;
        }
      }

      if (isBetter) {
        setScoreStatus('better');
        const newRecord = {
            name: playerName,
            score: finalScore,
            time: finalTime,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        
        let newLeaderboard;
        if (existingIndex !== -1) {
            saved[existingIndex] = newRecord;
            newLeaderboard = saved;
        } else {
            newLeaderboard = [...saved, newRecord];
        }
        
        newLeaderboard.sort((a, b) => {
             if (b.score !== a.score) return b.score - a.score;
             return a.time - b.time;
        });

        localStorage.setItem(localKey, JSON.stringify(newLeaderboard));
        setLeaderboard(newLeaderboard);
      } else {
        setScoreStatus('worse');
      }
      return;
    }

    // --- 雲端版邏輯 ---
    if (!user) return;

    setScoreStatus('calculating');
    const collectionName = `cny_lb_${groupId}`;

    try {
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', collectionName),
            where("name", "==", playerName)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            const oldRecord = docData.data();
            setExistingRecord({ id: docData.id, ...oldRecord });

            const isBetter = finalScore > oldRecord.score || (finalScore === oldRecord.score && finalTime < oldRecord.time);

            if (isBetter) {
                setScoreStatus('better');
                await updateScore(docData.id, finalScore, finalTime, collectionName);
            } else {
                setScoreStatus('worse');
            }
        } else {
            setScoreStatus('uploading');
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), {
                name: playerName,
                score: finalScore,
                time: finalTime,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now(),
                userId: user.uid
            });
            setScoreStatus('done');
        }
    } catch (e) {
        console.error("Score process failed", e);
        setScoreStatus('done');
    }
  };

  const updateScore = async (docId, newScore, newTime, collectionName) => {
      setScoreStatus('uploading');
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, docId), {
            score: newScore,
            time: newTime,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        });
        setScoreStatus('done');
      } catch (e) {
          console.error("Update failed", e);
      }
  };

  const generateGroupLink = () => {
      if (!newGroupCode.trim()) return;
      const cleanCode = newGroupCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      const link = `${baseUrl}?id=${cleanCode}`;
      setGeneratedLink(link);
      setGroupId(cleanCode);
  };

  const joinGroup = () => {
      if(!joinGroupCode.trim()) return;
      const cleanCode = joinGroupCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      setGroupId(cleanCode);
      setShowGroupJoiner(false);
  };

  const copyLink = () => {
    if(!generatedLink) return;
    const textArea = document.createElement("textarea");
    textArea.value = generatedLink;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("連結已複製！");
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const copyResultToClipboard = () => {
    const currentUrl = window.location.href; 
    const text = `🧨 新春冷知識大比拼 🧨\n群組: ${groupId === 'public' ? '公開' : groupId}\n👤 挑戰者: ${playerName}\n✅ 答對: ${currentFinalStats.score} / 5 題\n⏱️ 耗時: ${currentFinalStats.time.toFixed(2)} 秒\n🏆 點此挑戰我的排名: ${currentUrl}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  if (!isTailwindLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#b91c1c', color: '#fef08a', fontSize: '20px', fontFamily: 'sans-serif', flexDirection: 'column', gap: '10px' }}>
        <div>🧨</div>
        <div>正在準備新春遊戲畫面...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-700 font-sans text-yellow-50 overflow-hidden relative selection:bg-yellow-400 selection:text-red-800">
      <div className="absolute top-0 left-0 w-32 h-32 bg-red-600 rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-600 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 bg-white/5 backdrop-blur-sm shadow-2xl border-x border-red-800/50">
        
        {/* Header */}
        <div className="p-4 text-center border-b border-white/10">
          <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-md flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
            新春冷知識
            <Sparkles className="w-6 h-6 animate-pulse" />
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-xs border border-white/10">
             <Cloud className={`w-3 h-3 ${isCloudEnabled ? 'text-green-400' : 'text-gray-400'}`}/>
             {isCloudEnabled ? '雲端連線中' : '單機模式'}
             <span className="mx-1">|</span>
             {groupId === 'public' ? '全民公開賽' : `群組: ${groupId}`}
             {groupId !== 'public' && (
                 <button onClick={() => setGroupId('public')} className="ml-2 text-red-300 hover:text-white underline">退出</button>
             )}
          </div>
          {!isCloudEnabled && (
              <p className="text-[10px] text-red-300 mt-1 opacity-70">(填入 Firebase 設定即可開啟雲端排行榜)</p>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          
          {gameState === 'welcome' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-red-900/50">
                  <Trophy className="w-12 h-12 text-red-700" />
                </div>
                <h2 className="text-xl font-bold text-white">搶紅包 拚手氣！</h2>
                <div className="bg-red-900/40 p-4 rounded-xl border border-red-500/30 text-left space-y-2">
                    <p className="text-yellow-300 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> 比速度，也比準度
                    </p>
                    <p className="text-yellow-300 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> 每次隨機 5 題 (共50題)
                    </p>
                    <p className="text-yellow-300 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4"/> 排名只保留個人最高分
                    </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-800/50 p-2 rounded-xl border border-red-600 focus-within:border-yellow-400 transition-colors">
                  <input
                    type="text"
                    placeholder="請輸入您的暱稱"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-transparent text-center text-white placeholder-red-300/50 outline-none px-4 py-2 text-lg"
                    maxLength={10}
                  />
                </div>
                <button
                  onClick={startGame}
                  disabled={!playerName.trim()}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900 font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  開始挑戰
                </button>
                <div className="flex gap-2">
                    <button 
                      onClick={() => setGameState('leaderboard')}
                      className="flex-1 bg-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      英雄榜
                    </button>
                    {groupId === 'public' && (
                        <button 
                            onClick={() => {
                                setShowGroupJoiner(!showGroupJoiner);
                                setShowGroupCreator(false);
                            }}
                            className="flex-1 bg-blue-600/20 text-blue-100 border border-blue-400/30 font-medium py-3 rounded-xl hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            加入群組
                        </button>
                    )}
                </div>
              </div>

              {showGroupJoiner && (
                   <div className="mt-4 bg-blue-900/40 p-4 rounded-xl border border-blue-500/30 animate-in fade-in zoom-in duration-300">
                       <p className="text-xs text-blue-200 mb-2">輸入團主給的代號 (例如: AmyShop)</p>
                       <div className="flex gap-2">
                           <input 
                             type="text" 
                             className="flex-1 p-2 rounded bg-black/20 text-white border border-white/10 text-sm"
                             placeholder="群組代號"
                             value={joinGroupCode}
                             onChange={(e) => setJoinGroupCode(e.target.value)}
                           />
                           <button onClick={joinGroup} className="bg-blue-500 hover:bg-blue-600 px-4 rounded text-white text-sm">確定</button>
                       </div>
                   </div>
              )}

              <div className="pt-6 border-t border-white/10 text-center">
                  <button 
                    onClick={() => {
                        setShowGroupCreator(!showGroupCreator);
                        setShowGroupJoiner(false);
                    }}
                    className="text-xs text-yellow-300/70 hover:text-yellow-300 underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <LinkIcon className="w-3 h-3"/> 我是團主，我要開團產生連結
                  </button>

                  {showGroupCreator && (
                      <div className="mt-4 bg-yellow-900/40 p-4 rounded-xl border border-yellow-500/30 text-left space-y-3 animate-in fade-in zoom-in duration-300">
                          <p className="text-xs text-yellow-100">設定一個代號 (如: AmyShop)，產生連結給群友，成績就會分開計算！</p>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="設定群組代號(英數字)" 
                                className="flex-1 p-2 rounded bg-black/20 text-white text-sm border border-white/20"
                                value={newGroupCode}
                                onChange={(e) => {
                                    setNewGroupCode(e.target.value);
                                    setGeneratedLink(''); 
                                }}
                              />
                              <button 
                                onClick={generateGroupLink}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white text-sm px-3 rounded shrink-0"
                              >
                                產生
                              </button>
                          </div>
                          
                          {generatedLink && (
                              <div className="bg-white/10 p-2 rounded space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                      <div className="truncate text-xs text-white/70 flex-1 bg-black/20 p-1 rounded">{generatedLink}</div>
                                      <button onClick={copyLink} className="bg-green-600 px-2 py-1 rounded text-xs text-white shrink-0 flex items-center gap-1"><Copy className="w-3 h-3"/> 複製</button>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="w-full max-w-sm mx-auto space-y-6">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium bg-red-600 px-2 py-0.5 rounded text-white">
                    Q{currentQuestionIndex + 1}/5
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-yellow-300 text-xl font-bold min-w-[80px] justify-end">
                  <Timer className="w-5 h-5" />
                  {timer.toFixed(1)}s
                </div>
              </div>

              <div className="bg-white text-red-900 rounded-2xl p-6 shadow-xl min-h-[160px] flex items-center justify-center text-center relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold leading-relaxed">
                    {randomQuestions[currentQuestionIndex].question}
                  </h3>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              </div>

              <div className="space-y-3">
                {randomQuestions[currentQuestionIndex].options.map((option, idx) => {
                  let btnClass = "w-full p-4 rounded-xl text-left font-medium transition-all transform duration-200 border-2 ";
                  if (selectedOption === option) {
                     if (isAnswerCorrect) {
                       btnClass += "bg-green-500 border-green-400 text-white shadow-lg scale-102";
                     } else {
                       btnClass += "bg-gray-500 border-gray-400 text-white opacity-50";
                     }
                  } else if (showExplanation && option === randomQuestions[currentQuestionIndex].answer) {
                    btnClass += "bg-green-500 border-green-400 text-white shadow-lg animate-pulse";
                  } else {
                    btnClass += "bg-red-800/40 border-red-600/50 hover:bg-red-800/60 text-white hover:border-yellow-400/50";
                  }
                  return (
                    <button key={idx} onClick={() => handleAnswer(option)} disabled={showExplanation} className={btnClass}>
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedOption === option && isAnswerCorrect && <CheckCircle className="w-5 h-5" />}
                        {selectedOption === option && !isAnswerCorrect && <XCircle className="w-5 h-5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded shadow-lg mt-4">
                  <p className="font-bold text-sm mb-1">{isAnswerCorrect ? "🎉 答對了！" : "😅 哎呀，答錯了！"}</p>
                  <p className="text-sm">{randomQuestions[currentQuestionIndex].explanation}</p>
                </div>
              )}
            </div>
          )}

          {gameState === 'result' && (
            <div className="text-center space-y-6 animate-in zoom-in duration-500 relative">
              <Confetti />
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="relative inline-block">
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${playerName}`} alt="avatar" className="w-16 h-16 rounded-full border-4 border-yellow-400 mx-auto bg-white" />
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full border border-white">
                    {playerName}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-red-900/50 p-2 rounded-lg border border-red-700">
                      <p className="text-red-300 text-xs uppercase tracking-wider">本次答對</p>
                      <p className="text-2xl font-bold text-yellow-400">{currentFinalStats.score} / 5</p>
                    </div>
                    <div className="bg-red-900/50 p-2 rounded-lg border border-red-700">
                      <p className="text-red-300 text-xs uppercase tracking-wider">本次耗時</p>
                      <p className="text-2xl font-bold text-yellow-400">{currentFinalStats.time.toFixed(2)}s</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                    {scoreStatus === 'calculating' && (
                         <p className="text-yellow-200 animate-pulse text-sm">正在與歷史成績比對...</p>
                    )}
                    
                    {scoreStatus === 'done' && (
                        <p className="text-green-300 font-bold text-sm bg-green-900/40 py-1 rounded">✅ 已儲存至排行榜</p>
                    )}

                    {scoreStatus === 'better' && (
                        <div className="animate-bounce">
                             <p className="text-yellow-300 font-bold text-lg">👑 恭喜！刷新個人紀錄！</p>
                             <p className="text-xs text-white/60">舊紀錄已被覆蓋</p>
                        </div>
                    )}

                    {scoreStatus === 'worse' && existingRecord && (
                        <div className="bg-red-900/60 p-3 rounded border border-red-500">
                            <p className="text-white text-sm font-bold flex items-center justify-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-yellow-400"/>
                                未打破個人紀錄
                            </p>
                            <p className="text-xs text-white/70 mt-1">
                                您的最佳成績是: {existingRecord.score}分 ({existingRecord.time.toFixed(2)}s)
                            </p>
                            
                            <button 
                                onClick={() => updateScore(existingRecord.id, currentFinalStats.score, currentFinalStats.time, `cny_lb_${groupId}`)}
                                className="mt-3 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                <Save className="w-3 h-3"/>
                                我不管，我要用這次的成績覆蓋 (不建議)
                            </button>
                        </div>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={copyResultToClipboard}
                  className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 ${
                    copySuccess ? "bg-green-500 text-white" : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900"
                  }`}
                >
                  {copySuccess ? <CheckCircle className="w-5 h-5"/> : <Share2 className="w-5 h-5" />}
                  {copySuccess ? "已複製！" : "複製成績參加抽獎"}
                </button>
                <div className="flex gap-3">
                    <button onClick={() => setGameState('welcome')} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> 再玩一次
                    </button>
                    <button onClick={() => setGameState('leaderboard')} className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-medium py-3 rounded-xl flex items-center justify-center gap-2">
                        <Medal className="w-4 h-4" /> 看排行榜
                    </button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'leaderboard' && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                        <Cloud className={`w-6 h-6 ${isCloudEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                        {groupId === 'public' ? '公開' : groupId} 英雄榜
                    </h2>
                    <p className="text-xs text-red-200 mt-1">只保留每位玩家的最佳紀錄 ({isCloudEnabled ? '雲端' : '單機'})</p>
                 </div>
                 <button onClick={() => setGameState('welcome')} className="text-sm text-white/70 hover:text-white underline">
                   回首頁
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loadingLeaderboard ? (
                    <div className="text-center text-white/50 py-10 flex flex-col items-center gap-2">
                        <Sparkles className="animate-spin w-6 h-6" />
                        載入 {groupId === 'public' ? '公開' : '本群'} 排名中...
                    </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center text-white/50 py-10">
                    目前還沒有人上榜，快去挑戰當第一！
                    {!isCloudEnabled && <p className="text-xs mt-2 text-red-300">(目前為單機模式，只看得到這台設備的紀錄)</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.id || idx} className={`bg-white/10 rounded-lg p-4 flex items-center justify-between border border-white/5 relative overflow-hidden group ${entry.name === playerName ? 'bg-yellow-500/20 border-yellow-400/50' : ''}`}>
                        {idx < 3 && (
                             <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                 idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : 'bg-orange-600'
                             }`}></div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className={`w-6 text-center font-bold ${
                              idx === 0 ? 'text-yellow-400 text-xl' : 'text-white/60'
                          }`}>{idx + 1}</span>
                          <div>
                            <p className="font-bold text-white flex items-center gap-2">
                                {entry.name}
                                {entry.name === playerName && <span className="text-[10px] bg-yellow-400 text-red-900 px-1 rounded">我</span>}
                            </p>
                            <p className="text-xs text-white/40">{entry.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold">{entry.score} 分</p>
                          <p className="text-xs text-white/50">{entry.time.toFixed(2)}s</p>
                        </div>
                        {idx === 0 && <div className="absolute top-0 right-0 p-1"><Trophy className="w-4 h-4 text-yellow-400 opacity-50"/></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/30">
                本排行榜僅顯示當前群組 ({groupId}) 成績
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.5);
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}