// 設定文件路徑
const filePath = "wrong_words.json";

// 使用 WebView 顯示表單
let webView = new WebView();
await webView.loadHTML(
`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>添加單詞</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        input { margin: 10px 0; padding: 8px; width: calc(100% - 20px); }
        button { padding: 10px; background-color: #5cb85c; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>添加錯誤單詞和意義</h1>
    <input type="text" id="word" placeholder="輸入單詞">
    <input type="text" id="meaning" placeholder="輸入意義">
    <button onclick="submit()">確定</button>

    <script>
        function submit() {
            const word = document.getElementById('word').value;
            const meaning = document.getElementById('meaning').value;
            // 編碼數據並構造 URL
            const url = 'scriptable:///run/addVoc?word=' + encodeURIComponent(word) + '&meaning=' + encodeURIComponent(meaning);
            window.location.href = url; // 跳轉到 URL scheme
        }
    </script>
</body>
</html>
`);

// 展示 WebView
await webView.present();
