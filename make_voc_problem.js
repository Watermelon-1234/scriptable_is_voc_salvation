// ========== 設定區 ==========
const api_url = "https://script.google.com/macros/s/AKfycbxN6TKYrCfvVvxDVhM3V61TH62vj0BAUW9l05XYzWCyjYNeYDIea2MBLQhetqpePAK9/exec";
const DAILY_COUNT = 500;         // 每天抓多少單字
const REVIEW_PROBABILITY = 0.3;  // 30% 機率出複習題

const API_URL = api_url + '?action=pickAvg&startLetter=A&endLetter=Z&numToPick=' + DAILY_COUNT + '&sheet=1-6:chosen&shuffle=0'; 

const DAILY_FILE = "daily_words.json";   // 每日完整單字
const REMAIN_FILE = "daily_remain.json"; // 尚未問的單字
const WRONG_FILE = "wrong_words.json";   // 錯題庫

// GitHub 設定
const UPLOAD_TO_GITHUB = 1; // 1: 上傳到 GitHub, 0: 不上傳
const GITHUB_TOKEN = "your_github_token"; // 替換成你的 PAT
const REPO = "your_github_repo"; // 例如 melon/wrong-words
const BRANCH = "voc";
const FILE_PATH = WRONG_FILE;

let fm = FileManager.iCloud();
let dir = fm.documentsDirectory();
let dailyPath = fm.joinPath(dir, DAILY_FILE);
let remainPath = fm.joinPath(dir, REMAIN_FILE);
let wrongPath = fm.joinPath(dir, WRONG_FILE);

function loadJSON(path) {
  if (fm.fileExists(path)) {
    let content = fm.readString(path);
    try { return JSON.parse(content); } catch { return []; }
  }
  return [];
}
function saveJSON(path, obj) {
  fm.writeString(path, JSON.stringify(obj, null, 2));
}
function needUpdateDaily() {
  if (!fm.fileExists(dailyPath)) return true;
  if (fm.isFileStoredIniCloud(dailyPath)) {
    fm.downloadFileFromiCloud(dailyPath);
  }
  let attr = fm.modificationDate(dailyPath);
  if (!attr) return true;
  return attr.toDateString() !== new Date().toDateString();
}

// 將 API 回傳的 JSON 轉換成我們要的格式
function processWords(apiData) {
  if (!apiData || !apiData.result) return [];
  return apiData.result.map(item => {
    return { word: item[0], meaning: item[1], phonetic: item[2] };
  });
}

async function fetchDailyWords() {
  let req = new Request(API_URL);
  let rawData = await req.loadJSON();
  let data = processWords(rawData);
  let shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, DAILY_COUNT);
}

// GitHub 上傳功能
async function uploadToGitHub(localContent) {
  const apiBase = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;
  let sha = null;
  try {
    const resp = await new Request(`${apiBase}?ref=${BRANCH}`).loadJSON();
    sha = resp.sha;
  } catch (e) { /* 404 表示檔案不存在 */ }

  const contentEncoded = Data.fromString(JSON.stringify(localContent, null, 2)).toBase64String();
  const payload = { message: sha ? `Update ${FILE_PATH}` : `Add ${FILE_PATH}`, content: contentEncoded, branch: BRANCH };
  if (sha) payload.sha = sha;

  const req = new Request(apiBase);
  req.method = "PUT";
  req.headers = { "Authorization": `token ${GITHUB_TOKEN}`, "Accept": "application/vnd.github+json" };
  req.body = JSON.stringify(payload);

  try {
    const result = await req.loadJSON();
    console.log("GitHub 回傳：", result);
  } catch(e) {
    const text = await req.loadString();
    console.log("GitHub error 回傳：", text);
  }
}

// ========================= 主程式 =========================
async function main() {
  let query = args.shortcutParameter;
  if(!query) {
    Script.setShortcutOutput("fuck");
    Script.complete();
  }
  Script.setShortcutOutput("fuck");
  Script.complete();

  // 使用者回傳的錯詞
  if (query && query.word && query.meaning) {
    Script.setShortcutOutput(query);
    let wrongWords = loadJSON(wrongPath);
    if (!wrongWords.find(w => w.word === query.word)) {
      wrongWords.push({ word: query.word, meaning: query.meaning });
      saveJSON(wrongPath, wrongWords);

      if (UPLOAD_TO_GITHUB) {
        await uploadToGitHub(wrongWords);
        console.log("uploaded to GitHub");
      }
    }
  } 

  // 更新每日單字
  if (needUpdateDaily()) {
    let newWords = await fetchDailyWords();
    saveJSON(dailyPath, newWords);
    saveJSON(remainPath, newWords);
    console.log("已更新每日單字");
  }

  let dailyWords = loadJSON(dailyPath);
  let remainWords = loadJSON(remainPath);
  let wrongWords = loadJSON(wrongPath);

  if (remainWords.length === 0 && wrongWords.length === 0) {
    console.log("今日單字已問完，且無錯題可複習！");
    return;
  }

  let useReview = Math.random() < REVIEW_PROBABILITY && wrongWords.length > 0;
  let question;

  if (useReview) {
    question = wrongWords[Math.floor(Math.random() * wrongWords.length)];
  } else {
    let idx = Math.floor(Math.random() * remainWords.length);
    question = remainWords[idx];
    remainWords.splice(idx, 1);
    saveJSON(remainPath, remainWords);
  }

  let allMeanings = dailyWords.map(w => w.meaning);
  let options = [question.meaning];
  while (options.length < 4) {
    let rand = allMeanings[Math.floor(Math.random() * allMeanings.length)];
    if (!options.includes(rand)) options.push(rand);
  }
  options = options.sort(() => Math.random() - 0.5);

  let data = {
    title: `「${question.word}」的意思是？`,
    word: question.word,
    options: options,
    correctMeaning: question.meaning
  };
  console.log(JSON.stringify(data));
  Script.setShortcutOutput(data);
}

await main();
Script.complete();
