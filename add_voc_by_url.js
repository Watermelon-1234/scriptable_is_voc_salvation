let word = args.queryParameters.word;
let meaning = args.queryParameters.meaning;

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