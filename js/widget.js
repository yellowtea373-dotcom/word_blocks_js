// 1. Импорт готового движка из js_core
import { CONFIG } from '../js_core/constants.js';
import { Game } from '../js_core/game.js';
import { BLOCK_STATE } from '../js_core/block.js';

// 2. Холст и контекст для рисования
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

// 3. Игра ("мозг" из ЛР4)
const game = new Game();

// 4. Массив для визуальных эффектов (растворение кубиков)
let effects = {
    dissolve: []
};

// 5. Время последнего падения блока (для скорости)
let lastFallTime = 0;

// ЛОГИКА ВВОДА (Клики мыши и Enter)
canvas.addEventListener('mousedown', (e) => {
    // (e) => стрелочная функция, каждый раз при нажатии на холст
    // координаты клика внутри холста
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Переводим пиксели в координаты сетки (колонка, строка)
    const col = Math.floor(clickX / CONFIG.CELL_SIZE);
    const row = Math.floor(clickY / CONFIG.CELL_SIZE);

    // Пропуск за пределами 
    if (col < 0 || col >= CONFIG.GRID_COLS || row < 0 || row >= CONFIG.GRID_ROWS) return;

    const block = game.field[row][col];

    // ВЫДЕЛЕНИЕ блоков кликом мыши 
    if (block && block.state === BLOCK_STATE.LOCKED) { // Проверка на упавший блок
        // выделение блока
        const idx = game.selectedBlocks.indexOf(block);
        //indexOf(block) возвращает позицию или -1
        if (idx > -1) {
            game.selectedBlocks.splice(idx, 1);
            // splice(idx, 1) удаляет 1 элемент на позиции
            block.setState(BLOCK_STATE.LOCKED);
        } else {
            game.selectedBlocks.push(block);
            block.setState(BLOCK_STATE.SELECTED);
        }
        updateHUD();
    }
});

// КЛАВИАТУРА
window.addEventListener('keydown', (e) => {
    // 1. Движение влево
    if (e.key === 'ArrowLeft') {
        if (game.currentBlock) {
            game.moveLeftRight(-1);
        }
        e.preventDefault(); // отключаем скролл страницы
    }

    // 2. Движение вправо
    if (e.key === 'ArrowRight') {
        if (game.currentBlock) {
            game.moveLeftRight(1);
        }
        e.preventDefault();
    }

    // 3. Ускорение падения (стрелка вниз)
    if (e.key === 'ArrowDown') {
        if (game.currentBlock) {
            game.moveDown();
        }
        e.preventDefault();
    }

    // 4. Сборка слова по Enter
    if (e.key === 'Enter') {
        // Сохраняем копию выделенных блоков ДО проверки
        const selectedCopy = [...game.selectedBlocks];
        // Проверяем слово
        const success = game.checkWord();
        if (success) {
            // Если слово верное — анимация растворения
            for (const b of selectedCopy) {
                effects.dissolve.push({
                    x: b.col * CONFIG.CELL_SIZE,
                    y: b.row * CONFIG.CELL_SIZE,
                    alpha: 1.0 //непрозрачность
                });
            }
        }
        // Обновляем панель со счётом
        updateHUD();
    }
});

// ИГРОВОЙ ЦИКЛ
let last = performance.now();
// время (в миллисекундах) с открытия станицы для синхронизации

function loop(now) {
    const deltaMs = Math.min(now - last, 100);
    // Math.min(..., 100) - защита от "прыжка"
    last = now;

    // проверка времени для падения
    if (now - lastFallTime > CONFIG.FALL_SPEED_MS) {
        game.moveDown();
        lastFallTime = now;
    }
    render();
    requestAnimationFrame(loop);
}

//ОТРИСОВКА
function render() {
    // 1. Очищаем холст
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Рисуем сетку
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    //вертикальные линии 
    for (let x = 0; x <= canvas.width; x += CONFIG.CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        //ctx.beginPath() начинает новый путь
        //stroke() проявляет "записанный" путь
    }
    //горизонтальные линии 
    for (let y = 0; y <= canvas.height; y += CONFIG.CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 3. Рисуем упавшие блоки
    for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
        for (let c = 0; c < CONFIG.GRID_COLS; c++) {
            const b = game.field[r][c]; //блок в ячейке
            if (b) {
                const color = b.state === BLOCK_STATE.SELECTED ? '#FFD700' : '#E0C080';
                drawBlock(c, r, b.char, color);
            }
        }
    }

    // 4. Рисуем падающий блок
    if (game.currentBlock) {
        drawBlock(game.currentBlock.col, game.currentBlock.row, game.currentBlock.char, '#FF6B6B');
    }

    // 5. Рисуем светящуюся линию между выделенными блоками
    if (game.selectedBlocks.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';

        const first = game.selectedBlocks[0];
        // центр первого выделенного блока 
        ctx.moveTo(first.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, first.row * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2);

        for (let i = 1; i < game.selectedBlocks.length; i++) {
            const b = game.selectedBlocks[i];
            ctx.lineTo(b.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, b.row * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // отключение тени
    }

    // 6. Анимация растворения
    for (let i = effects.dissolve.length - 1; i >= 0; i--) {
        const d = effects.dissolve[i];
        d.alpha -= 0.02;
        if (d.alpha <= 0) {
            effects.dissolve.splice(i, 1);
            continue;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha})`;
        ctx.fillRect(d.x, d.y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
    }
}

// Вспомогательная функция для рисования одного блока
function drawBlock(col, row, char, color) {
    const x = col * CONFIG.CELL_SIZE;
    const y = row * CONFIG.CELL_SIZE;

    // Квадрат
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);

    // Буква
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, x + CONFIG.CELL_SIZE / 2, y + CONFIG.CELL_SIZE / 2);
}

// Обновление панели HUD
function updateHUD() {
    document.querySelector('#score').textContent = game.score; //поиск элемента на HTML-странице
    document.querySelector('#current-word').textContent = game.selectedBlocks.map(b => b.char).join('');
}

// Запуск игры
updateHUD();
requestAnimationFrame(loop);