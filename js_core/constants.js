export const CONFIG = {
    GRID_COLS: 20,
    GRID_ROWS: 15,
    CELL_SIZE: 40,
    FALL_SPEED_MS: 900, // миллисекунды
};

// Словарь (из dictionary.txt)
export const VALID_WORDS = new Set([
    "GO", "NO", "CAT", "DOG", "TOP", "BAG", "RED", "TEN", "BAD",
    "HAT", "HAG", "SAD", "BAR", "RAB", "HIT", "LOL", "BOLL", "BOW",
    "SOS", "LOW", "WOW", "ROW", "POP", "BOT", "BIN", "BOSS", "BOB"
]);

// Расчёт очков
export function calculateScore(word) {
    if (!VALID_WORDS.has(word)) return 0;
    return word.length * 10;
}

// Частоты букв (для генерации). 
export function getLettersPool() {
    let pool = "";
    for (const word of VALID_WORDS) {
        for (const char of word) {
            pool += char;
        }
    }
    return pool;
}