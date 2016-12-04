
interface Effect<T> {
    (action: number, pStartItem: T, nStartItem: T, nStartIdx: number): void;
}

export default function dift<T> (prev: T[], next: T[], effect: Effect<T>, key: (any) => string | number): void;
export const CREATE: number;
export const UPDATE: number;
export const MOVE:   number;
export const REMOVE: number;
