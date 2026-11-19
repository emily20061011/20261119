let char1Img; // 宣告變數，用來存放角色 1 的圖片

function preload() {
  // 在程式執行前預先載入角色 1 的圖片（請將 'char1.png' 替換為你的實際圖片路徑）
  char1Img = loadImage('char1.png');
}

function setup() {
  // 建立寬 400、高 400 的畫布（如需全螢幕可改為 createCanvas(windowWidth, windowHeight)）
  createCanvas(400, 400);
}

function draw() {
  // 每一幀先填滿背景色，避免上一幀的畫面殘留
  background(220);

  // 確認角色 1 圖片已成功載入且原始高度大於 0，避免除以零的錯誤
  if (char1Img && char1Img.height > 0) {
    // 設定角色 1 的高度為整個畫布高度的 1/3
    let char1Height = height / 3;

    // 計算原始圖片的寬高比例（寬 / 高）
    let aspectRatio = char1Img.width / char1Img.height;

    // 依照原始圖片的寬高比計算角色 1 的寬度，避免圖片拉扯變形
    let char1Width = char1Height * aspectRatio;

    // 計算角色 1 置中時的左上角 X 座標
    let char1X = (width - char1Width) / 2;

    // 計算角色 1 置中時的左上角 Y 座標
    let char1Y = (height - char1Height) / 2;

    // 依照計算出的位置與等比例尺寸繪製角色 1
    image(char1Img, char1X, char1Y, char1Width, char1Height);
  }
}

function windowResized() {
  // 若改用全螢幕畫布，當視窗大小改變時自動跟著調整畫布大小
  // resizeCanvas(windowWidth, windowHeight);
}