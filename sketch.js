let bgImg; // 儲存背景圖片 1/bg.png
let bgX = 0; // 記錄中央背景圖左上角的水平 X 座標
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
  bgImg = loadImage("1/bg.png"); // 載入 1/bg.png 作為背景圖片
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

function draw() { // 主繪圖迴圈，每一幀更新畫面[cite: 5]
  background("#87CEEB"); // 以天藍色清除上一幀畫面[cite: 5]

  const hasBg = Boolean(bgImg && bgImg.width > 0 && bgImg.height > 0); // 檢查 1/bg.png 是否已成功載入
  const bgScale = hasBg ? height / bgImg.height : 1; // 讓單張背景高度貼合畫布高度並等比縮放
  const singleBgWidth = hasBg ? bgImg.width * bgScale : width; // 計算單張背景等比例縮放後的寬度
  const singleBgHeight = height; // 設定單張背景高度為畫布高度

  // 三張背景由左至右串接時，最左緣為 bgX - singleBgWidth，最右緣為 bgX + 2 * singleBgWidth
  // 畫面看到最右邊時，最右緣對齊畫布右緣 width => bgX + 2 * singleBgWidth = width
  const minBgX = width - 2 * singleBgWidth; // 背景往左捲動到最右邊時的 bgX 下限
  // 畫面看到最左邊時，最左緣對齊畫布左緣 0 => bgX - singleBgWidth = 0
  const maxBgX = singleBgWidth; // 背景往右捲動到最左邊時的 bgX 上限
  bgX = constrain(bgX, minBgX, maxBgX); // 確保背景座標始終落在合法範圍內

  const movingRight = keyIsDown(RIGHT_ARROW); // 偵測是否按住右方向鍵[cite: 5]
  const movingLeft = keyIsDown(LEFT_ARROW); // 偵測是否按住左方向鍵[cite: 5]
  isWalking = movingRight || movingLeft; // 有按左右鍵時切換為走路狀態，否則為站立[cite: 5]
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算移動速度[cite: 5]

  if (movingRight) { // 按下往右鍵時[cite: 5]
    isWalking = true; // 啟用走路動畫[cite: 5]
    facingDirection = 1; // 角色朝向右方[cite: 5]
    if (bgX > minBgX) { // 尚未捲動到背景最右邊時，背景往左移動（bgX 減少）
      bgX = max(minBgX, bgX - movementStep); // 更新背景向左捲動位置
    } else { // 已到背景最右邊，背景捲動暫停，改由角色 1 往右移動
      characterX += movementStep; // 角色 1 往右移動[cite: 5]
    } // 結束右鍵移動邏輯
  } else if (movingLeft) { // 按下往左鍵時[cite: 5]
    isWalking = true; // 啟用走路動畫[cite: 5]
    facingDirection = -1; // 角色朝向左方[cite: 5]
    if (bgX < maxBgX) { // 尚未捲動到背景最左邊時，背景往右移動（bgX 增加）
      bgX = min(maxBgX, bgX + movementStep); // 更新背景向右捲動位置
    } else { // 已到背景最左邊，背景捲動暫停，改由角色 1 往左移動
      characterX -= movementStep; // 角色 1 往左移動[cite: 5]
    } // 結束左鍵移動邏輯
  } // 結束方向鍵判斷[cite: 5]

  // 在中央背景圖左右兩側複製相同大小的背景圖片，三張做串接連結
  push(); // 暫存繪圖設定[cite: 5]
  imageMode(CORNER); // 背景圖片以左上角為定位點
  if (hasBg) { // 確認 1/bg.png 可用後繪製三張連續背景
    image(bgImg, bgX - singleBgWidth, 0, singleBgWidth, singleBgHeight); // 左側複製背景
    image(bgImg, bgX, 0, singleBgWidth, singleBgHeight); // 中央原始背景
    image(bgImg, bgX + singleBgWidth, 0, singleBgWidth, singleBgHeight); // 右側複製背景
  } // 結束背景繪製判斷
  pop(); // 還原繪圖設定[cite: 5]

  // 計算角色 1 尺寸：高度固定為畫布高度的 1/3，寬度依原圖寬高比例等比縮放
  const targetCharacterHeight = height / 3; // 設定角色 1 目標高度為畫布高度的 1/3
  const characterScale = targetCharacterHeight / frameHeight; // 計算等比例縮放倍率
  const characterWidth = frameWidth * characterScale; // 依照原始圖片寬高比計算角色 1 寬度
  const characterHeight = frameHeight * characterScale; // 角色 1 實際顯示高度（等於 height / 3）
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色 1 留在畫布左右範圍內

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 施法動畫播放完畢後發射特效[cite: 5]
    isCasting = false; // 結束施法狀態[cite: 5]
    activeEffects.push({ // 在角色前方新增飛行的魔法特效[cite: 5]
      x: characterX + (magicDirection * characterWidth) / 2, // 設定特效起始水平位置[cite: 5]
      y: height - characterHeight * 0.58, // 設定特效垂直高度[cite: 5]
      direction: magicDirection // 設定特效飛行方向[cite: 5]
    }); // 結束物件建立[cite: 5]
  } // 結束施法完成判斷[cite: 5]

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 選擇目前狀態對應的精靈圖[cite: 5]
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖影格總數[cite: 5]
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖單格寬度[cite: 5]
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖單格高度[cite: 5]

  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已經過的影格數[cite: 5]
  const rawFrameIndex = isCasting // 計算目前影格索引[cite: 5]
    ? floor(elapsedMagicFrames / framesPerStep) // 施法時依經過影格計算[cite: 5]
    : floor(frameCount / framesPerStep) % activeFrameCount; // 站立或走路時循環播放影格[cite: 5]
  const frameIndex = constrain(rawFrameIndex, 0, activeFrameCount - 1); // 確保影格索引不超出有效範圍[cite: 5]
  const sourceX = frameIndex * activeFrameWidth; // 計算精靈圖裁切起點 X[cite: 5]

  const activeWidth = activeFrameWidth * characterScale; // 依等比縮放倍率計算目前動作寬度[cite: 5]
  const activeHeight = activeFrameHeight * characterScale; // 依等比縮放倍率計算目前動作高度[cite: 5]
  const characterY = height - activeHeight / 2; // 將角色底部對齊畫布底部[cite: 5]

  if (activeSprite && activeSprite.width > 0 && activeSprite.height > 0) { // 確認目前精靈圖已載入完成
    push(); // 暫存座標轉換狀態[cite: 5]
    imageMode(CENTER); // 角色以中心點定位[cite: 5]
    translate(characterX, characterY); // 將原點移至角色中心[cite: 5]
    scale(isCasting ? magicDirection : facingDirection, 1); // 依朝向水平翻轉角色[cite: 5]
    image( // 繪製裁切後的目前角色影格[cite: 5]
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

  const effectScale = characterScale; // 魔法特效使用與角色相同的縮放倍率[cite: 5]
  const effectWidth = effectFrameWidth * effectScale; // 計算特效顯示寬度[cite: 5]
  const effectHeight = effectFrameHeight * effectScale; // 計算特效顯示高度[cite: 5]
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效移動速度[cite: 5]

  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有特效[cite: 5]
    const effect = activeEffects[effectIndex]; // 取得目前特效物件[cite: 5]
    effect.x += effect.direction * effectSpeed; // 更新特效水平座標[cite: 5]

    if (effect.x > width + effectWidth || effect.x < -effectWidth) { // 特效飛出畫布左右邊界時移除[cite: 5]
      activeEffects.splice(effectIndex, 1); // 從陣列移除特效[cite: 5]
      continue; // 略過已移除特效的繪製[cite: 5]
    } // 結束特效邊界檢查[cite: 5]

    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前影格索引[cite: 5]

    if (magicEffectSprite && magicEffectSprite.width > 0 && magicEffectSprite.height > 0) { // 確認特效精靈圖已載入
      push(); // 暫存座標轉換狀態[cite: 5]
      imageMode(CENTER); // 特效以中心點定位[cite: 5]
      translate(effect.x, effect.y); // 將原點移至特效中心[cite: 5]
      scale(effect.direction, 1); // 依方向水平翻轉特效[cite: 5]
      image( // 繪製裁切後的特效影格[cite: 5]
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
  } // 結束特效更新迴圈[cite: 5]
} // 結束 draw 函式[cite: 5]

function keyPressed() { // 處理按鍵按下事件[cite: 5]
  if (keyCode === RIGHT_ARROW) { // 按下右方向鍵[cite: 5]
    isWalking = true; // 切換為走路動畫[cite: 5]
    facingDirection = 1; // 面向右方[cite: 5]
    return false; // 阻止瀏覽器預設捲動行為[cite: 5]
  } // 結束右鍵處理[cite: 5]

  if (keyCode === LEFT_ARROW) { // 按下左方向鍵[cite: 5]
    isWalking = true; // 切換為走路動畫[cite: 5]
    facingDirection = -1; // 面向左方[cite: 5]
    return false; // 阻止瀏覽器預設捲動行為[cite: 5]
  } // 結束左鍵處理[cite: 5]

  if (keyCode === 32) { // 按下空白鍵[cite: 5]
    if (!spaceIsDown && !isCasting) { // 避免連按或施法中重複觸發[cite: 5]
      isCasting = true; // 開始播放施法動畫[cite: 5]
      magicStartFrame = frameCount; // 記錄施法起始影格[cite: 5]
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

function windowResized() { // 視窗尺寸改變時更新畫布[cite: 5]
  resizeCanvas(windowWidth, windowHeight); // 同步調整畫布大小[cite: 5]
  characterX = constrain(characterX, 1, width - 1); // 將角色水平位置限制在畫布內[cite: 5]
} // 結束 windowResized 函式[cite: 5]