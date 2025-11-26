let word = args.queryParameters.word;
let meaning = args.queryParameters.meaning;
let UPLOAD_TO_GITHUB = 1 // 1: upload to github, 0: upload to iCloud
//word = "descendant";
//meaning = "後裔";

// github feature
// ---------- settings ----------
const GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxx"; // your Personal Access Token
const REPO = "account/repo"; // 例如 melon/wrong-words
const BRANCH = "main";
const FILE_PATH = "wrong_words.json"; // 在 repo 的路徑
// --------------------------------

async function uploadToGitHub(localContent) {
  const apiBase = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

  // 先檢查檔案是否存在，取得 sha
  let sha = null;
  try {
    const resp = await new Request(`${apiBase}?ref=${BRANCH}`).loadJSON();
    sha = resp.sha;
  } catch (e) {
    // 404 表示檔案不存在，sha 保持 null
  }

  // base64 編碼檔案內容
  const contentEncoded = Data.fromString(JSON.stringify(localContent, null, 2)).toBase64String();

  // 準備 payload
  const payload = {
    message: sha ? `Update ${FILE_PATH}` : `Add ${FILE_PATH}`,
    content: contentEncoded,
    branch: BRANCH
  };
  if (sha) payload.sha = sha;

  // 發送 PUT 請求
  const req = new Request(apiBase);
  req.method = "PUT";
  req.headers = {
    "Authorization": `token ${GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json"
  };
  req.body = JSON.stringify(payload);

  const result = await req.loadJSON();
  console.log("GitHub 回傳：", result);
  return result;
}





if (!word || !meaning) {
    console.log("請輸入單詞和意義。");
    return;
}


// 設定文件路徑
let filePath = "wrong_words.json";

// 讀取現有的 JSON 數據
const fm = FileManager.iCloud();
const dir = fm.documentsDirectory();
filePath = fm.joinPath(dir, filePath);
const fileExists = fm.fileExists(filePath);

let jsonData = [];
if (fileExists) {
    const jsonContent = fm.readString(filePath);
    jsonData = JSON.parse(jsonContent);
}
else{ console.log("fuck")}

// 將新資料加入
if(!jsonData.find(w=>w.word === word))
{
    jsonData.push({ "word": word, "meaning": meaning });

    // 寫入文件
    fm.writeString(filePath, JSON.stringify(jsonData, null, 2));
    console.log(`成功添加：單詞: ${word}，意義: ${meaning}`);
}
else
{
    console.log("文字已經存在");
}


if (UPLOAD_TO_GITHUB)
{
    await uploadToGitHub(jsonData);
    console.log("uploaded to github");
}