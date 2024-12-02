"use strict"; /*厳格にエラーをチェック*/

var offsetX, offsetY, dragItem;
var resizeHandle;

//タブの挙動
{
  //ローカルスコープ
  //DOM取得
  const tabMenus = document.querySelectorAll(".tab_menu-item");
  // console.log(tabMenus);
  //イベント追加
  tabMenus.forEach((tabMenu) => {
    tabMenu.addEventListener("click", tabSwitch);
  });
  function tabSwitch(e) {
    // クリックされた要素のデータ属性を取得
    const tabTargetData = e.currentTarget.dataset.tab;
    // console.log(e.currentTarget);
    // console.log(e.currentTarget.dataset.tab);

    // クリックされた要素の親要素と、その子要素を取得
    const tabList = e.currentTarget.closest(".tab_menu");
    const tabItems = tabList.querySelectorAll(".tab_menu-item");

    // クリックされた要素の親要素の兄弟要素の子要素を取得
    const tabPanelItems =
      tabList.nextElementSibling.querySelectorAll(".tab_panel-box");

    // クリックされたtabの同階層のmenuとpanelのクラスを削除
    tabItems.forEach((tabItem) => {
      tabItem.classList.remove("is-active");
    });
    tabPanelItems.forEach((tabPanelItem) => {
      tabPanelItem.classList.remove("is-show");
    });

    // クリックされたmenu要素にis-activeクラスを付加
    e.currentTarget.classList.add("is-active");

    // クリックしたmenuのデータ属性と等しい値を持つパネルにis-showクラスを付加
    tabPanelItems.forEach((tabPanelItem) => {
      if (tabPanelItem.dataset.panel === tabTargetData) {
        tabPanelItem.classList.add("is-show");
      }
    });
  }
}

//スタンプボタン
function addStamp(stampType) {
  //新しいスタンプを作成
  var newStamp = document.createElement("img");
  var imagePath = "img/stamp/" + stampType + ".png";
  newStamp.src = imagePath;
  newStamp.alt = "stamp";
  newStamp.className = "newStamp";
  newStamp.classList.add("draggable");

  // ダブルクリックイベントを追加
  newStamp.ondblclick = function () {
    console.log("ダブルクリック");
    newStamp.remove();
  };


  //work_sectionに新しいスタンプを追加
  document.getElementById("work_container").appendChild(newStamp);

  //Moveableインスタンスを作成
  var move = new Moveable(document.body, {
    target: newStamp,
    draggable: true, //ここtrueにしないと拡大縮小の枠が移動しない
    resizable: true,
    keepRatio: true,
    rotatable: true,
    pinchable: true,
    renderDirections: ["nw", "ne", "sw", "se"],
  });

  //拡大縮小
  move.on("resize", ({ target, width, height }) => {
    target.style.width = width + "px";
    target.style.height = height + "px";
  });
  //回転
  move.on("rotate", ({ target, transform }) => {
    target.style.transform = transform
  });
}

// スタンプのドラッグアンドドロップ
function startDrag(e) {
  if (e.target.classList.contains("draggable")) {
    dragItem = e.target;
    var rect = dragItem.getBoundingClientRect(); //スタンプ要素の位置とサイズを取得
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  }
}
// ドラッグをしたとき
function drag(e) {
  e.preventDefault();

  var containerRect = document
    .getElementById("work_container")
    .getBoundingClientRect(); // work_containerの位置とサイズを取得
  var x = e.clientX - offsetX - containerRect.left; //work_container内のx座標
  var y = e.clientY - offsetY - containerRect.top; //work_container内のy座標

  // コンテナ内での移動範囲を制限
  x = Math.min(Math.max(x, 0), containerRect.width - dragItem.offsetWidth);
  y = Math.min(Math.max(y, 0), containerRect.height - dragItem.offsetHeight);

  dragItem.style.left = x + "px";
  dragItem.style.top = y + "px";

  // console.log(dragItem.style.left);

  // ゴミ箱との衝突判定
  var trashCan = document.getElementById("trash_can");
  var trashRect = trashCan.getBoundingClientRect();
  var dragRect = dragItem.getBoundingClientRect();

  if (
    dragRect.right > trashRect.left &&
    dragRect.left < trashRect.right &&
    dragRect.bottom > trashRect.top &&
    dragRect.top < trashRect.bottom
  ) {
    dragItem.style.opacity = 0.5;
  } else {
    dragItem.style.opacity = 1.0;
  }
}

function stopDrag() {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);

  // ゴミ箱との衝突判定
  var trashCan = document.getElementById("trash_can");
  var trashRect = trashCan.getBoundingClientRect();
  var dragRect = dragItem.getBoundingClientRect();

  if (
    dragRect.right > trashRect.left &&
    dragRect.left < trashRect.right &&
    dragRect.bottom > trashRect.top &&
    dragRect.top < trashRect.bottom
  ) {
    dragItem.remove();
  }
}

// タッチ操作の開始
function startTouchDrag(e) {
  if (e.target.classList.contains("draggable")) {
    dragItem = e.target;
    var touch = e.touches[0];
    var rect = dragItem.getBoundingClientRect(); // スタンプ要素の位置とサイズを取得
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    document.addEventListener("touchmove", touchDrag);
    document.addEventListener("touchend", stopTouchDrag);
  }
}

//タッチ操作
// ドラッグ中のタッチ操作
function touchDrag(e) {
  e.preventDefault();

  var touch = e.touches[0];
  var containerRect = document
    .getElementById("work_container")
    .getBoundingClientRect(); // work_containerの位置とサイズを取得
  var x = touch.clientX - offsetX - containerRect.left; // work_container内のx座標
  var y = touch.clientY - offsetY - containerRect.top; // work_container内のy座標

  // コンテナ内での移動範囲を制限
  x = Math.min(Math.max(x, 0), containerRect.width - dragItem.offsetWidth);
  y = Math.min(Math.max(y, 0), containerRect.height - dragItem.offsetHeight);

  dragItem.style.left = x + "px";
  dragItem.style.top = y + "px";

  // ゴミ箱との衝突判定
  var trashCan = document.getElementById("trash_can");
  var trashRect = trashCan.getBoundingClientRect();
  var dragRect = dragItem.getBoundingClientRect();

  if (
    dragRect.right > trashRect.left &&
    dragRect.left < trashRect.right &&
    dragRect.bottom > trashRect.top &&
    dragRect.top < trashRect.bottom
  ) {
    dragItem.style.opacity = 0.5;
  } else {
    dragItem.style.opacity = 1.0;
  }
}

// タッチ操作の終了
function stopTouchDrag() {
  document.removeEventListener("touchmove", touchDrag);
  document.removeEventListener("touchend", stopTouchDrag);

  // ゴミ箱との衝突判定
  var trashCan = document.getElementById("trash_can");
  var trashRect = trashCan.getBoundingClientRect();
  var dragRect = dragItem.getBoundingClientRect();

  if (
    dragRect.right > trashRect.left &&
    dragRect.left < trashRect.right &&
    dragRect.bottom > trashRect.top &&
    dragRect.top < trashRect.bottom
  ) {
    dragItem.remove();
  }
}

//ピンチアウト拡大縮小
let currentTouches = [];
let initialDistance = 0;
let scale = 1;

document.getElementById('work_container').addEventListener('touchstart', function(event) {
  if (event.target.classList.contains('draggable')) {
    if (event.touches.length === 2) {
      // 2本指タッチ開始
      currentTouches = [...event.touches];
      initialDistance = getDistance(currentTouches[0], currentTouches[1]);
    }
  }
});

document.getElementById('work_container').addEventListener('touchmove', function(event) {
  if (event.target.classList.contains('draggable')) {
    if (event.touches.length === 2 && currentTouches.length === 2) {
      // 現在のタッチ情報を取得
      const newTouches = [...event.touches];
      const newDistance = getDistance(newTouches[0], newTouches[1]);

      // 拡大率を計算
      const scaleChange = newDistance / initialDistance;
      scale *= scaleChange;

      // 要素を拡大縮小
      event.target.style.transform = `scale(${scale})`;

      // 状態を更新
      currentTouches = newTouches;
      initialDistance = newDistance;

      // preventDefault を呼び出して、ブラウザの標準動作を無効化
      event.preventDefault();
    }
  }
});

document.getElementById('work_container').addEventListener('touchend', function(event) {
  // タッチが終了したら状態をリセット
  if (event.touches.length < 2) {
    currentTouches = [];
    initialDistance = 0;
  }
});

// 2点間の距離を計算する関数
function getDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}


// イベントリスナーを追加
document
  .getElementById("work_container")
  .addEventListener("mousedown", startDrag, { passive: false });
document
  .getElementById("work_container")
  .addEventListener("touchstart", startTouchDrag, { passive: false });

// 画像アップロードの処理
//クラウドのみに保存してあるデータ（ローカルに保存していないデータ）はアップロードできない
//余裕があれば1枚のみアップロードできるようにする
document.getElementById('imageUpload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const newImage = document.createElement('img');
      newImage.src = e.target.result;
      newImage.alt = 'Uploaded Image';
      newImage.style.position = 'absolute';
      newImage.classList.add('work');
      document.getElementById('work_container').appendChild(newImage);
    };
    reader.readAsDataURL(file);
  }
});

