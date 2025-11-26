// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
// ListICloudFiles.js
let fm = FileManager.iCloud();
let dir = fm.documentsDirectory();

if (!fm.isFileDownloaded(dir)) {
  await fm.downloadFile(dir);
}

let files = fm.listContents(dir);

// 過濾資料夾與檔案
let fileList = [];
for (let file of files) {
  let path = fm.joinPath(dir, file);
  let type = fm.isDirectory(path) ? "資料夾" : "檔案";
  fileList.push(`${file} (${type})`);
}

// 用 QuickLook 顯示
QuickLook.present(fileList.join("\n"));
console.log(fileList.join("\n"));
