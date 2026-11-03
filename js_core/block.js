import { getLettersPool } from './constants.js';

export const BLOCK_STATE = Object.freeze({
    FALLING: 'Falling',   // падает
    LOCKED: 'Locked',     // упал на дно
    SELECTED: 'Selected', // выделен для слова
    CLEARED: 'Cleared'    // удалён
});

export class Block {
    constructor(col, row, char = null) {
        this.col = col;
        this.row = row;
        // Если буква не передана, берем случайную из пула
        const pool = getLettersPool();
        this.char = char || pool[Math.floor(Math.random() * pool.length)];
        //floor - округление вниз до целого
        this.state = BLOCK_STATE.FALLING; // начальное состояние
    }
    // Смена состояния (переходы автомата)
    setState(newState) {
        this.state = newState;
    }
    // Проверка: можно ли блок выделить?
    isSelectable() {
        return this.state === BLOCK_STATE.LOCKED;
    }
    // Проверка: блок упал и готов к сборке?
    isLocked() {
        return this.state === BLOCK_STATE.LOCKED;
    }
}