import { CONFIG, calculateScore, VALID_WORDS } from './constants.js';
import { Block, BLOCK_STATE } from './block.js';

export class Game { //класс, доступный для других файлов
    constructor() {
        // Создаем пустую матрицу 15x20 (строки x колонки)
        this.field = Array.from({ length: CONFIG.GRID_ROWS }, () =>
        //функция () => ... вызывается заново для каждой строки
            Array(CONFIG.GRID_COLS).fill(null) //пустой массив из 20 колонок
        );
        this.currentBlock = null;
        this.selectedBlocks = []; // блоки, выбранные для слова
        this.score = 0;
        this.createBlock();
    }

    // Создать новый падающий блок сверху по центру
    createBlock() {
        const col = Math.floor(CONFIG.GRID_COLS / 2);
        const row = 0;
        // Если место занято — игра окончена
        if (this.field[row][col] !== null) {
            return false;
        }
        this.currentBlock = new Block(col, row);
        return true;
    }

    // Проверка коллизии: упрется ли блок, если сдвинуть на dRow/dCol?
    checkCollision(block, dRow = 0, dCol = 0) {
        const newRow = block.row + dRow;
        const newCol = block.col + dCol;
        // Выход за границы
        if (newRow >= CONFIG.GRID_ROWS || newCol < 0 || newCol >= CONFIG.GRID_COLS) {
            return true;
        }
        // Есть ли уже блок в новой ячейке?
        if (this.field[newRow][newCol] !== null) {
            return true;
        }
        return false;
    }

    // Сдвинуть блок вниз (один шаг)
    moveDown() {
        if (!this.currentBlock) return;

        //проверка (предположение движения)
        if (!this.checkCollision(this.currentBlock, 1, 0)) {
            this.currentBlock.row += 1;
        } else {
            // Уперлись! Фиксируем блок
            this.lockBlock();
        }
    }

    // Зафиксировать блок на поле
    lockBlock() {
        const b = this.currentBlock;
        this.field[b.row][b.col] = b;
        b.setState(BLOCK_STATE.LOCKED);
        this.currentBlock = null;
        this.createBlock(); // создаем следующий
    }

    // Проверить и собрать слово
    checkWord() {
        if (this.selectedBlocks.length < 2) {
            this.clearSelection();
            return false;
        }
        // Собираем слово из букв выделенных блоков
        const word = this.selectedBlocks.map(b => b.char).join('');
        //метод map() прозодит по каждому элементу массива и преобразует

        if (VALID_WORDS.has(word)) {
            // Начисляем очки
            this.score += calculateScore(word);
            // Удаляем блоки
            for (const b of this.selectedBlocks) {
                this.field[b.row][b.col] = null;
                b.setState(BLOCK_STATE.CLEARED);
            }
            this.selectedBlocks = [];
            // Запускаем гравитацию (верхние блоки падают вниз)
            this.applyGravity();
            return true;
        } else {
            this.clearSelection();
            return false;
        }
    }

    // Снять выделение со всех блоков
    clearSelection() {
        for (const b of this.selectedBlocks) {
            b.setState(BLOCK_STATE.LOCKED);
        }
        this.selectedBlocks = [];
    }

    // Гравитация: сдвигаем все блоки вниз
    applyGravity() {
        for (let col = 0; col < CONFIG.GRID_COLS; col++) {
            const blocksInCol = [];

            // Собираем блоки снизу вверх
            for (let row = CONFIG.GRID_ROWS - 1; row >= 0; row--) {
                if (this.field[row][col] !== null) {
                    blocksInCol.push(this.field[row][col]);
                }
            }

            // Очищаем столбец
            for (let row = 0; row < CONFIG.GRID_ROWS; row++) {
                this.field[row][col] = null;
            }

            // Расставляем блоки с нижней строки
            let newRow = CONFIG.GRID_ROWS - 1;
            for (const block of blocksInCol) {
                this.field[newRow][col] = block;
                block.row = newRow;
                newRow--;
            }
        }
    }

    moveLeftRight(direction) {
        if (!this.currentBlock) return;

        if (!this.checkCollision(this.currentBlock, 0, direction)) {
            this.currentBlock.col += direction;
        }
    }
}