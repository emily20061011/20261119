let bgImg; // 儲存背景圖片 bg.png
let bgScrollX = 0; // 記錄背景目前的水平捲動位移量
let characterSprite; // 儲存角色一的站立精靈圖[cite: 5]
let walkSprite; // 儲存角色一的走路精靈圖[cite: 5]
let magicSprite; // 儲存角色一的施法精靈圖[cite: 5]
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖[cite: 5]
let characterX; // 儲存角色一目前的水平中心位置[cite: 5]
let isWalking = false; // 記錄角色是否正在走路[cite: 5]
let facingDirection = 1; // 記錄角色朝向（1 為向右，-1 為向左）[cite: 5]
let isCasting = false; // 記錄角色是否正在播放施法動畫[cite: 5]
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數[cite: 5]
let magicDirection = 1; // 記錄施法時鎖定的朝向[cite: 5]
let spaceIsDown = false; // 記錄空白鍵是否按住，避免重複觸發施法[cite: 5]
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效[cite: 5]

const frameCountInSprite = 10; // 設定站立精靈圖影格數[cite: 5]
const frameWidth = 139.5; // 設定站立精靈圖單格寬度[cite: 5]
const frameHeight = 196; // 設定站立精靈圖單格高度[cite: 5]
const walkFrameCount = 9; // 設定走路精靈圖影格數[cite: 5]
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路精靈圖單格寬度[cite: 5]
const walkFrameHeight = 198; // 設定走路精靈圖單格高度[cite: 5]
const magicFrameCount = 4; // 設定施法精靈圖影格數[cite: 5]
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法精靈圖單格寬度[cite: 5]
const magicFrameHeight = 146; // 設定施法精靈圖單格高度[cite: 5]
const effectFrameCount = 5; // 設定魔法特效精靈圖影格數[cite: 5]
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效精靈圖單格寬度[cite: 5]
const effectFrameHeight = 19; // 設定魔法特效精靈圖單格高度[cite: 5]
const framesPerStep = 8; // 設定每隔幾個畫面切換下一張影格[cite: 5]

function preload() { // 在 setup() 前預先載入背景與角色圖片資源[cite: 5]
  bgImg = loadImage("bg.png"); // 載入 bg.png 作為背景圖片
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一十格站立精靈圖[cite: 5]
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一九格走路精靈圖[cite: 5]
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一四格施法精靈圖[cite: 5]
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖[cite: 5]
} // 結束 preload 函式[cite: 5]

function setup() { // 初始化畫布與角色起始位置[cite: 5]
  createCanvas(windowWidth, windowHeight); // 建立與瀏覽器視窗同大的畫布[cite: 5]
  characterX = (width * 2) / 3; // 將角色一初始水平位置設在畫布寬度的 2/3 處[cite: 5]
  frameRate(60); // 設定每秒 60 幀[cite: 5]
} // 結束 setup 函式[cite: 5]

function drawBackground(singleBgWidth, singleBgHeight) { // 繪製左右複製並串接的三張背景圖片
  push(); // 暫存繪圖設定[cite: 5]
  imageMode(CORNER); // 背景以左上角為定位點

  if (bgImg && bgImg.width > 0 && bgImg.height > 0) { // 確認 bg.png 已成功載入
    image(bgImg, bgScrollX - singleBgWidth, 0, singleBgWidth, singleBgHeight); // 繪製左側複製背景
    image(bgImg, bgScrollX, 0, singleBgWidth, singleBgHeight); // 繪製中央原始背景
    image(bgImg, bgScrollX + singleBgWidth, 0, singleBgWidth, singleBgHeight); // 繪製右側複製背景
  } else { // 若背景圖尚未載入完成則以天藍色備援[cite: 5]
    background("#87CEEB"); // 填滿天藍色背景[cite: 5]
  } // 結束背景繪製判斷

  pop(); // 還原繪圖設定[cite: 5]
} // 結束 drawBackground 函式

function draw() { // 主繪圖迴圈，每一幀更新畫面[cite: 5]
  background("#87CEEB"); // 預設清除畫布為天藍色[cite: 5]

  const hasBg = Boolean(bgImg && bgImg.width > 0 && bgImg.height > 0); // 檢查背景圖是否可用
  const bgScale = hasBg ? height / bgImg.height : 1; // 讓單張背景高度等於畫布高度並等比縮放
  const singleBgWidth = hasBg ? bgImg.width * bgScale : width; // 計算單張背景等比例寬度
  const singleBgHeight = height; // 設定單張背景高度為畫布高度

  // 計算三張背景串接時可捲動的最大位移範圍
  const maxScrollOffset = max(0, singleBgWidth - width); // 若單張背景比畫布寬，可捲動差值；否則為 0
  const minScrollX = -maxScrollOffset; // 背景往左捲動到底（看到最右邊）時的位移下限
  const maxScrollX = maxScrollOffset; // 背景往右捲動到底（看到最左邊）時的位移上限
  bgScrollX = constrain(bgScrollX, minScrollX, maxScrollX); // 確保背景捲動位移維持在邊界內

  const movingRight = keyIsDown(RIGHT_ARROW); // 偵測是否按住右方向鍵[cite: 5]
  const movingLeft = keyIsDown(LEFT_ARROW); // 偵測是否按住左方向鍵[cite: 5]
  isWalking = movingRight || movingLeft; // 有按左右鍵時為走路狀態，否則為站立[cite: 5]
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算移動速度[cite: 5]

  if (movingRight) { // 按下往右鍵時[cite: 5]
    isWalking = true; // 切換為走路動畫[cite: 5]
    facingDirection = 1; // 角色面向右方[cite: 5]
    if (bgScrollX > minScrollX) { // 尚未到背景最右邊時，背景往左移動
      bgScrollX = max(minScrollX, bgScrollX - movementStep); // 更新背景向左捲動位置
    } else { // 到達背景最右邊時背景捲動暫停，改由角色 1 往右移動
      characterX += movementStep; // 角色 1 往右移動[cite: 5]
    } // 結束右鍵移動邏輯
  } else if (movingLeft) { // 按下往左鍵時[cite: 5]
    isWalking = true; // 切換為走路動畫[cite: 5]
    facingDirection = -1; // 角色面向左方[cite: 5]
    if (bgScrollX < maxScrollX) { // 尚未到背景最左邊時，背景往右移動
      bgScrollX = min(maxScrollX, bgScrollX + movementStep); // 更新背景向右捲動位置
    } else { // 到達背景最左邊時背景捲動暫停，改由角色 1 往左移動
      characterX -= movementStep; // 角色 1 往左移動[cite: 5]
    } // 結束左鍵移動邏輯
  } // 結束方向鍵判斷[cite: 5]

  drawBackground(singleBgWidth, singleBgHeight); // 繪製三張串接的背景圖片

  const targetCharacterHeight = height / 3; // 角色 1 高度固定為整個畫布高度的 1/3[cite: 5]
  const characterScale = targetCharacterHeight / frameHeight; // 依目標高度計算等比例縮放倍率[cite: 5]
  const characterWidth = frameWidth * characterScale; // 依原始寬高比例計算角色 1 寬度[cite: 5]
  const characterHeight = frameHeight * characterScale; // 角色 1 高度（等於 height / 3）[cite: 5]
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色不超出左右畫面[cite: 5]

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 施法動畫播完後發射特效[cite: 5]
    isCasting = false; // 結束施法狀態[cite: 5]
    activeEffects.push({ // 新增飛行的魔法特效物件[cite: 5]
      x: characterX + (magicDirection * characterWidth) / 2, // 從角色前方發射[cite: 5]
      y: height - characterHeight * 0.58, // 設定特效垂直高度[cite: 5]
      direction: magicDirection // 設定特效飛行方向[cite: 5]
    }); // 結束物件建立[cite: 5]
  } // 結束施法完成判斷[cite: 5]

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 選擇目前要顯示的精靈圖[cite: 5]
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖總格數[cite: 5]
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖單格寬度[cite: 5]
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖單格高度[cite: 5]

  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法已經過的影格數[cite: 5]
  const rawFrameIndex = isCasting // 計算目前影格索引[cite: 5]
    ? floor(elapsedMagicFrames / framesPerStep) // 施法時依經過影格計算[cite: 5]
    : floor(frameCount / framesPerStep) % activeFrameCount; // 站立或走路時循環播放[cite: 5]
  const frameIndex = constrain(rawFrameIndex, 0, activeFrameCount - 1); // 確保影格索引不超出範圍[cite: 5]
  const sourceX = frameIndex * activeFrameWidth; // 計算精靈圖裁切起點 X[cite: 5]

  const activeWidth = activeFrameWidth * characterScale; // 依等比縮放計算目前動作寬度[cite: 5]
  const activeHeight = activeFrameHeight * characterScale; // 依等比縮放計算目前動作高度[cite: 5]
  const characterY = height - activeHeight / 2; // 將角色底部對齊畫布底部[cite: 5]

  if (activeSprite && activeSprite.width > 0 && activeSprite.height > 0) { // 確認精靈圖已載入再繪製
    push(); // 暫存座標轉換狀態[cite: 5]
    imageMode(CENTER); // 角色以中心點定位[cite: 5]
    translate(characterX, characterY); // 移動原點至角色位置[cite: 5]
    scale(isCasting ? magicDirection : facingDirection, 1); // 依朝向左右翻轉[cite: 5]
    image( // 繪製目前裁切的精靈影格[cite: 5]
      activeSprite, // 來源精靈圖[cite: 5]
      0, // 中心 X[cite: 5]
      0, // 中心 Y[cite: 5]
      activeWidth, // 顯示寬度[cite: 5]
      activeHeight, // 顯示高度[cite: 5]
      sourceX, // 來源裁切 X[cite: 5]
      0, // 來源裁切 Y[cite: 5]
      activeFrameWidth, // 來源裁切寬度[cite: 5]
      activeFrameHeight // 來源裁切高度[cite: 5]
    ); // 結束 image 呼叫[cite: 5]
    pop(); // 還原座標轉換狀態[cite: 5]
  } // 結束角色繪製判斷

  const effectScale = characterScale; // 特效使用與角色相同的縮放倍率[cite: 5]
  const effectWidth = effectFrameWidth * effectScale; // 計算特效顯示寬度[cite: 5]
  const effectHeight = effectFrameHeight * effectScale; // 計算特效顯示高度[cite: 5]
  const effectSpeed = max(6, width * 0.008); // 計算特效飛行速度[cite: 5]

  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新特效陣列[cite: 5]
    const effect = activeEffects[effectIndex]; // 取得單一特效[cite: 5]
    effect.x += effect.direction * effectSpeed; // 更新特效水平位置[cite: 5]

    if (effect.x > width + effectWidth || effect.x < -effectWidth) { // 超出畫布左右邊界時移除[cite: 5]
      activeEffects.splice(effectIndex, 1); // 從陣列移除特效[cite: 5]
      continue; // 跳過此特效的繪製[cite: 5]
    } // 結束特效邊界檢查[cite: 5]

    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前影格[cite: 5]

    if (magicEffectSprite && magicEffectSprite.width > 0 && magicEffectSprite.height > 0) { // 確認特效圖已載入
      push(); // 暫存座標轉換狀態[cite: 5]
      imageMode(CENTER); // 特效以中心點定位[cite: 5]
      translate(effect.x, effect.y); // 移動原點至特效位置[cite: 5]
      scale(effect.direction, 1); // 依方向翻轉特效[cite: 5]
      image( // 繪製特效影格[cite: 5]
        magicEffectSprite, // 特效精靈圖[cite: 5]
        0, // 中心 X[cite: 5]
        0, // 中心 Y[cite: 5]
        effectWidth, // 顯示寬度[cite: 5]
        effectHeight, // 顯示高度[cite: 5]
        effectFrameIndex * effectFrameWidth, // 來源裁切 X[cite: 5]
        0, // 來源裁切 Y[cite: 5]
        effectFrameWidth, // 來源裁切寬度[cite: 5]
        effectFrameHeight // 來源裁切高度[cite: 5]
      ); // 結束特效 image 呼叫[cite: 5]
      pop(); // 還原座標轉換狀態[cite: 5]
    } // 結束特效繪製判斷
  } // 結束特效迴圈[cite: 5]
} // 結束 draw 函式[cite: 5]

function keyPressed() { // 處理按鍵按下事件[cite: 5]
  if (keyCode === RIGHT_ARROW) { // 按下右方向鍵[cite: 5]
    isWalking = true; // 設為走路[cite: 5]
    facingDirection = 1; // 朝右[cite: 5]
    return false; // 阻止瀏覽器預設捲動[cite: 5]
  } // 結束右鍵處理[cite: 5]

  if (keyCode === LEFT_ARROW) { // 按下左方向鍵[cite: 5]
    isWalking = true; // 設為走路[cite: 5]
    facingDirection = -1; // 朝左[cite: 5]
    return false; // 阻止瀏覽器預設捲動[cite: 5]
  } // 結束左鍵處理[cite: 5]

  if (keyCode === 32) { // 按下空白鍵[cite: 5]
    if (!spaceIsDown && !isCasting) { // 避免連按或施法中重複觸發[cite: 5]
      isCasting = true; // 開始施法[cite: 5]
      magicStartFrame = frameCount; // 記錄開始施法的影格[cite: 5]
      magicDirection = facingDirection; // 鎖定施法方向[cite: 5]
    } // 結束施法觸發判斷[cite: 5]
    spaceIsDown = true; // 標記空白鍵已按下[cite: 5]
    return false; // 阻止空白鍵捲動網頁[cite: 5]
  } // 結束空白鍵處理[cite: 5]
} // 結束 keyPressed 函式[cite: 5]

function keyReleased() { // 處理按鍵放開事件[cite: 5]
  if (keyCode === 32) { // 放開空白鍵[cite: 5]
    spaceIsDown = false; // 重置空白鍵狀態[cite: 5]
  } // 結束空白鍵放開判斷[cite: 5]
} // 結束 keyReleased 函式[cite: 5]

function windowResized() { // 視窗大小改變時更新畫布[cite: 5]
  resizeCanvas(windowWidth, windowHeight); // 重新調整畫布尺寸[cite: 5]
  characterX = constrain(characterX, 1, width - 1); // 確保角色仍在畫布範圍內[cite: 5]
} // 結束 windowResized 函式[cite: 5]