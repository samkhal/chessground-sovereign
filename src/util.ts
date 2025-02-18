import * as cg from './types.js';

export const boardSize: number = 16;

export const invRanks: readonly cg.Rank[] = [...cg.ranks].reverse();

export const allKeys: readonly cg.Key[] = Array.prototype.concat(...cg.files.map(c => cg.ranks.map(r => c + r)));

export const pos2key = (pos: cg.Pos): cg.Key => allKeys[boardSize * pos[0] + pos[1]];

// handle ranks 0-9 and A-G
export const key2pos = (k: cg.Key): cg.Pos => [k.charCodeAt(0) - 97, k.charCodeAt(1) < 58 ? k.charCodeAt(1) - 49 : k.charCodeAt(1) - 65 + 9];

export const allPos: readonly cg.Pos[] = allKeys.map(key2pos);

export function memo<A>(f: () => A): cg.Memo<A> {
  let v: A | undefined;
  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => {
    v = undefined;
  };
  return ret;
}

export const timer = (): cg.Timer => {
  let startAt: number | undefined;
  return {
    start() {
      startAt = performance.now();
    },
    cancel() {
      startAt = undefined;
    },
    stop() {
      if (!startAt) return 0;
      const time = performance.now() - startAt;
      startAt = undefined;
      return time;
    },
  };
};

export const opposite = (s: cg.Side): cg.Side => (s === cg.Side.White ? cg.Side.Black : cg.Side.White);

export const distanceSq = (pos1: cg.Pos, pos2: cg.Pos): number => {
  const dx = pos1[0] - pos2[0],
    dy = pos1[1] - pos2[1];
  return dx * dx + dy * dy;
};

export const samePiece = (p1: cg.Piece, p2: cg.Piece): boolean => p1.role === p2.role && p1.color === p2.color;

export const posToTranslate =
  (bounds: ClientRect): ((pos: cg.Pos, asWhite: boolean) => cg.NumberPair) =>
    (pos, asWhite) =>
      [((asWhite ? pos[0] : boardSize - 1 - pos[0]) * bounds.width) / boardSize, ((asWhite ? boardSize - 1 - pos[1] : pos[1]) * bounds.height) / boardSize];

export const translate = (el: HTMLElement, pos: cg.NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateAndScale = (el: HTMLElement, pos: cg.NumberPair, scale = 1): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
};

export const setVisible = (el: HTMLElement, v: boolean): void => {
  el.style.visibility = v ? 'visible' : 'hidden';
};

export const eventPosition = (e: cg.MouchEvent): cg.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};

export const isRightButton = (e: cg.MouchEvent): boolean => e.buttons === 2 || e.button === 2;

export const createEl = (tagName: string, className?: string): HTMLElement => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export function computeSquareCenter(key: cg.Key, asWhite: boolean, bounds: ClientRect): cg.NumberPair {
  const pos = key2pos(key);
  if (!asWhite) {
    pos[0] = boardSize - 1 - pos[0];
    pos[1] = boardSize - 1 - pos[1];
  }
  return [
    bounds.left + (bounds.width * pos[0]) / boardSize + bounds.width / (boardSize * 2),
    bounds.top + (bounds.height * (boardSize - 1 - pos[1])) / boardSize + bounds.height / (boardSize * 2),
  ];
}
