let word = args.queryParameters.word;
let meaning = args.queryParameters.meaning;
let UPLOAD_TO_GITHUB = 1 // 1: upload to github, 0: upload to iCloud
//word = "veto";
//meaning = "(n.)(v.)否決，禁止";

// github feature
// ---------- settings ----------
const GITHUB_TOKEN = "your_github_token"; // your Personal Access Token(need the permission of repo(contnets)(read and write))
const REPO = "your_github_repo"; // 例如 melon/wrong-words
const BRANCH = "auto-update";
const FILE_PATH = "wrong_words.json"; // 在 repo 的路徑
// --------------------------------

async function getRemote() {
  const apiBase = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(FILE_PATH)}?ref=${BRANCH}`;
  const req = new Request(apiBase);
  req.method = "GET";
  req.headers = {
    "Authorization": `token ${GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json"
  };
  try {
    const txt = await req.loadString();
    const obj = JSON.parse(txt);
    if (obj && obj.content) {
      const b64 = obj.content.replace(/\n/g, "");
      const raw = Data.fromBase64String(b64).toRawString();
      const arr = JSON.parse(raw || "[]");
      return { data: Array.isArray(arr) ? arr : [], sha: obj.sha };
    } else {
      // Not found or no content
      return { data: [], sha: null };
    }
  } catch (e) {
    try {
      const txt = await req.loadString();
      console.log("GET error response:", txt);
    } catch (_) {}
    console.log("GET remote error:", e);
    return { data: [], sha: null };
  }
}


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
  try {
    const result = await req.loadJSON();
    console.log("GitHub 回傳：", result);
  } catch(e) {
    const text = await req.loadString();
    console.log("GitHub error 回傳：", text);
  }
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
    try 
    {
      const jsonContent = fm.readString(filePath);
      jsonData = JSON.parse(jsonContent || "[]");
    } catch (e) {
      console.log("讀 local JSON 失敗，將覆寫為空陣列：", e);
      jsonData = [];
    }
}
els
{
    console.log("local file not found, will create") 
}

// 將新資料加入
if(!jsonData.find(w=>w.word === word))
{
    jsonData.push({ "word": word, "meaning": meaning });

    // 寫入文件
    try {
      fm.writeString(filePath, JSON.stringify(jsonData, null, 2));
      console.log(`${new Date().toISOString()}: 成功添加：單詞: ${word}，意義: ${meaning}`);
    } catch (e) {
      console.log("寫入 iCloud 失敗：", e);
      return;
    }

    if (UPLOAD_TO_GITHUB)
    {
      // 1. 先拉遠端最新
      const remote = await getRemote();
      const remoteData = remote.data || [];
      const remoteSha = remote.sha || null;

      // 2. 合併（以 local 覆蓋 remote）
      const map = new Map();
      for (const r of remoteData) if (r && r.word) map.set(r.word, r);
      for (const l of jsonData) if (l && l.word) map.set(l.word, l);
      const merged = Array.from(map.values());

      // 3. 寫回 iCloud (覆蓋)
      try {
        fm.writeString(filePath, JSON.stringify(merged, null, 2));
        console.log("已將 merged 寫回 iCloud，count:", merged.length);
      } catch (e) {
        console.log("寫回 merged 到 iCloud 失敗：", e);
      }

      // 4. push 到 GitHub
      try {
        const res = await uploadToGitHubContent(merged, remoteSha);
        console.log("uploaded to github:", JSON.stringify(res));
      } catch (e) {
        console.log("upload failed:", e);
      }
    }
}
else
{
    console.log("文字已經存在");
}

