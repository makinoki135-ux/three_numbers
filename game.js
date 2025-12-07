// グローバル定数
const TIME_LIMIT = 60; // 制限時間（秒）

// ゲームステート変数
let score = 0;
let currentNumber = 1; // 1からカウントスタート
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let isGameActive = false;

// DOM要素の参照
// DOMContentLoadedで確実に要素を取得するため、変数宣言のみ行います
let scoreDisplay;
let timerDisplay;
let numberDisplayArea;
let currentNumberText;
let ahoButton;
let notAhoButton;
let gameModal;
let modalTitle;
let modalMessage;
let startButton;

/**
 * 数字が「3の倍数」または「3が付く数字」かどうかをチェックします。
 * @param {number} n チェックする数字
 * @returns {boolean} 条件を満たす場合は true
 */
function isAhoCondition(n) {
    const isMultipleOf3 = n % 3 === 0;
    const contains3 = n.toString().includes('3');
    return isMultipleOf3 || contains3;
}

/**
 * タイマーを更新し、0になったらゲームを終了します。
 */
function updateTimer() {
    if (!isGameActive) return;

    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 10) {
        // 10秒を切ったらタイマーの文字を赤く大きく
        timerDisplay.classList.add('text-7xl', 'animate-pulse');
    } else {
        timerDisplay.classList.remove('text-7xl', 'animate-pulse');
    }

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame(true); // 時間切れで終了
    }
}

/**
 * UIを更新します。
 * @param {boolean | null} isCorrect 直前のアクションが正解であったかどうか (nullは初期状態)
 */
function updateUI(isCorrect) {
    currentNumberText.textContent = currentNumber;
    scoreDisplay.textContent = score;

    // 次の数字の正解条件を判定
    const nextIsAho = isAhoCondition(currentNumber);

    /**
     * ボタンの活性化とハイライトを設定
     * @param {HTMLElement} button - 対象ボタン要素
     * @param {boolean} isCorrectChoice - そのボタンが現在の数字で正解となるか
     */
    const toggleButtonState = (button, isCorrectChoice) => {
        if (isGameActive) {
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
            // 押すべきボタンをハイライト
            if (isCorrectChoice) {
                button.classList.add('ring-4', 'ring-offset-2', 'ring-yellow-500');
            } else {
                button.classList.remove('ring-4', 'ring-offset-2', 'ring-yellow-500');
            }
        } else {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
            button.classList.remove('ring-4', 'ring-offset-2', 'ring-yellow-500');
        }
    };

    // ボタンの状態を更新
    // 「アホじゃない」ボタンが左
    toggleButtonState(notAhoButton, !nextIsAho);
    // 「アホ！」ボタンが右
    toggleButtonState(ahoButton, nextIsAho);


    // 正解/不正解時の背景アニメーション
    numberDisplayArea.classList.remove('correct-flash-bg', 'incorrect-flash-bg');
    // DOMの再フローを強制するためのトリック（アニメーション再トリガーのため）
    void numberDisplayArea.offsetWidth; 
    if (isGameActive) {
        if (isCorrect === true) {
            numberDisplayArea.classList.add('correct-flash-bg');
        } else if (isCorrect === false) {
            numberDisplayArea.classList.add('incorrect-flash-bg');
        }
    }
}

/**
 * ユーザーの回答をチェックし、次のステップに進むかゲームオーバーにするかを決定します。
 * @param {boolean} isAhoClicked ユーザーが「アホ」ボタンを押したかどうか
 */
function checkAnswer(isAhoClicked) {
    if (!isGameActive) return;

    // 現在の数字に対する正解条件
    const correctCondition = isAhoCondition(currentNumber);
    
    // ユーザーの選択が正解だったか
    const isCorrect = isAhoClicked === correctCondition;

    if (isCorrect) {
        // 正解！次のカウントへ
        score++;
        currentNumber++;
        updateUI(true); // 正解時のUI更新
    } else {
        // 不正解！ゲームオーバー
        endGame(false); 
    }
}

/**
 * ゲームを開始します。
 */
function startGame() {
    // ステートのリセット
    score = 0;
    currentNumber = 1;
    timeLeft = TIME_LIMIT;
    isGameActive = true;
    
    // UIのリセットと初期化
    updateUI(null);
    timerDisplay.textContent = TIME_LIMIT;
    gameModal.style.opacity = '0';
    gameModal.style.visibility = 'hidden';

    // タイマーを開始
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * ゲームを終了し、結果を表示します。
 * @param {boolean} isTimeUp 時間切れで終了したかどうか
 */
function endGame(isTimeUp) {
    isGameActive = false;
    clearInterval(timerInterval);
    
    // モーダルを表示
    gameModal.style.opacity = '1';
    gameModal.style.visibility = 'visible';

    const finalScore = score;
    let message;
    
    if (isTimeUp) {
        modalTitle.textContent = 'タイムアップ！';
        message = `1分間で ${finalScore} 回連続カウントできました！素晴らしい！`;
        startButton.textContent = 'もう一度挑戦！';
    } else {
        modalTitle.textContent = 'ゲームオーバー！';
        message = `残念！ ${currentNumber} のとき、ボタンを間違えました。<br>あなたの記録は ${finalScore} 回連続カウントでした。`;
        startButton.textContent = 'リトライ！';
        // 不正解時のUIアニメーション
        numberDisplayArea.classList.add('incorrect-flash-bg');
        // 間違えた数字を表示
        currentNumberText.textContent = currentNumber;
    }
    modalMessage.innerHTML = message;
    
    // ボタンを非活性化
    ahoButton.disabled = true;
    notAhoButton.disabled = true;
}

/**
 * DOM要素を取得し、イベントリスナーを設定してゲームを初期化します。
 */
function initializeGame() {
    // DOM要素の参照を代入
    scoreDisplay = document.getElementById('score-display');
    timerDisplay = document.getElementById('timer-display');
    numberDisplayArea = document.getElementById('number-display-area');
    currentNumberText = document.getElementById('current-number-text');
    ahoButton = document.getElementById('aho-button');
    notAhoButton = document.getElementById('not-aho-button');
    gameModal = document.getElementById('game-modal');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    startButton = document.getElementById('start-button');

    // --- イベントリスナー設定 ---
    
    // スタートボタン
    startButton.addEventListener('click', startGame);

    // 「アホ！」ボタン
    ahoButton.addEventListener('click', () => {
        checkAnswer(true);
    });

    // 「アホじゃない」ボタン
    notAhoButton.addEventListener('click', () => {
        checkAnswer(false);
    });

    // 初期化: スタート画面を表示
    // currentNumberの初期値を1にしてからupdateUIを呼び出す
    currentNumber = 1;
    scoreDisplay.textContent = '0'; // スコア表示は0
    timerDisplay.textContent = TIME_LIMIT; // タイマー表示を初期値に設定
    updateUI(null); 
    gameModal.style.opacity = '1';
    gameModal.style.visibility = 'visible';
}

// HTMLのDOM読み込み後に初期化関数を実行
document.addEventListener('DOMContentLoaded', initializeGame);