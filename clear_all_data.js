// ClearWords.js
const filesToClear = [
  "daily_words.json",
  "daily_remain.json",
  "wrong_words.json"
];

let fm = FileManager.iCloud();
let dir = fm.documentsDirectory();

for (let fileName of filesToClear) {
  let path = fm.joinPath(dir, fileName);
  if (fm.fileExists(path)) {
    fm.remove(path);
    console.log(`已刪除：${fileName}`);
  } else {
    console.log(`檔案不存在：${fileName}`);
  }
}

QuickLook.present("已清空檔案列表");