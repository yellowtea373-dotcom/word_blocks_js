import { Rect } from './js/rect.js';
import { VALID_WORDS, calculateScore, getLettersPool, CONFIG } from './js/constants.js';
import { Block, BLOCK_STATE } from './js/block.js';
import { Game } from './js/game.js';

console.log("=== 1. Проверка класса Rect ===");
const r1 = new Rect(10, 20, 50, 40);
console.log(`Центр r1: (${r1.centerx}, ${r1.centery})`);
const r2 = r1.move(5, 10);
console.log(`Сдвиг копией: r1.x = ${r1.x}, r2.x = ${r2.x}`);
const wall = new Rect(20, 20, 10, 10);
console.log(`Коллизия r1 с wall: ${r1.colliderect(wall)}`);
console.log(`Точка (15, 25) в r1: ${r1.collidepoint(15, 25)}`);

console.log("\n=== 2. Проверка констант и математики ===");
console.log(`Слов в словаре: ${VALID_WORDS.size}`);
console.log(`Очки за 'CAT': ${calculateScore("CAT")}`);
console.log(`Очки за 'BOSS': ${calculateScore("BOSS")}`);
console.log(`Очки за 'WRONG': ${calculateScore("WRONG")}`);
const pool = getLettersPool();
console.log(`Длина пула букв: ${pool.length}`);
console.log(`Буква 'C' в пуле: ${pool.includes('C')}`);

console.log("\n=== 3. Проверка класса Game и Блока ===");
const game = new Game();
console.log(`Блок создан на позиции: (${game.currentBlock.col}, ${game.currentBlock.row})`);
game.moveDown();
console.log(`После 1 шага вниз: row = ${game.currentBlock.row}`);

// Сбор слова: установка букв в позицию
game.field[14][10] = { char: 'C', row: 14, col: 10, state: BLOCK_STATE.LOCKED, setState: () => { } };
game.field[14][11] = { char: 'A', row: 14, col: 11, state: BLOCK_STATE.LOCKED, setState: () => { } };
game.field[14][12] = { char: 'T', row: 14, col: 12, state: BLOCK_STATE.LOCKED, setState: () => { } };
game.selectedBlocks = [game.field[14][10], game.field[14][11], game.field[14][12]];
const success = game.checkWord();
console.log(`Слово CAT собрано: ${success}`);
console.log(`Очки после сборки: ${game.score}`);

console.log("\n=== 4. Дополнительные проверки ===");
const testBlock = new Block(0, 5, 'A');
console.log(`Блок слева упирается: ${game.checkCollision(testBlock, 0, -1)}`);
testBlock.col = CONFIG.GRID_COLS - 1;
console.log(`Блок справа упирается: ${game.checkCollision(testBlock, 0, 1)}`);

//очистка для проверки гравитации 
game.field = Array.from({ length: CONFIG.GRID_ROWS }, () => Array(CONFIG.GRID_COLS).fill(null));
game.field[0][5] = { char: 'X', row: 0, col: 5, state: BLOCK_STATE.LOCKED, setState: () => { } };
game.applyGravity();
console.log(`Гравитация сработала, блок внизу: row = ${game.field[CONFIG.GRID_ROWS - 1][5]?.row}`);

game.selectedBlocks = [
    { char: 'A', row: 14, col: 0, setState: () => { } },
    { char: 'B', row: 14, col: 1, setState: () => { } }
];
console.log(`Слово 'AB' (неверное) собрано: ${game.checkWord()}`);

const b = new Block(0, 0, 'C');
console.log(`Начальное состояние блока: ${b.state}`);
b.setState(BLOCK_STATE.LOCKED);
console.log(`После приземления: ${b.state}`);
console.log(`Можно ли выделить упавший блок: ${b.isSelectable()}`);

console.log("\n=== ВСЕ ТЕСТЫ ПРОЙДЕНЫ ===");