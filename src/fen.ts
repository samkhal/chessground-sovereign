import { pos2key, invRanks } from './util.js';
import * as cg from './types.js';

/* Modifications to BNF grammar of FEN for sovereign chess:

<FEN> ::=  <Piece Placement>
       ' ' <Side to move>
       ' ' <Castling ability>

<Piece Placement> ::= (same as FEN, with 8 ranks, and numbers 1-16)

<piece>   ::= <color><role>
<role>    ::= 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
<color>   ::= 'w' | 'b' | 's' | 'a' | 'p' | 'r' | 'o' | 'y' | 'g' | 'c' | 'n' | 'v'
<Side to move> ::= <color>

<Castling ability> ::= TODO(samkhal)

*/

export const initial: cg.FEN = 'aqabvrvnbrbnbbbqbkbbbnbrynyrsbsq/aranvpvpbpbpbpbpbpbpbpbpypypsnsr/nbnp12opob/nqnp12opoq/crcp12rprr/cncp12rprn/gbgp12pppb/gqgp12pppq/yqyp12vpvq/ybyp12vpvb/onop12npnn/orop12npnr/rqrp12cpcq/rbrp12cpcb/srsnppppwpwpwpwpwpwpwpwpgpgpanar/sqsbprpnwrwnwbwqwkwbwnwrgngrabaq';

const roles: { [letter: string]: cg.Role } = {
  p: 'pawn',
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
};

const letters = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k',
};


const colors: { [letter: string]: cg.Color } = {
  'w': cg.Color.White,
  'b': cg.Color.Black,
  'a': cg.Color.Ash,
  's': cg.Color.Slate,
  'p': cg.Color.Pink,
  'r': cg.Color.Red,
  'o': cg.Color.Orange,
  'y': cg.Color.Yellow,
  'g': cg.Color.Green,
  'c': cg.Color.Cyan,
  'n': cg.Color.Navy,
  'v': cg.Color.Violet,
};

export function read(fen: cg.FEN): cg.Pieces {
  if (fen === 'start') fen = initial;
  const pieces: cg.Pieces = new Map();
  let row = 15,
    col = 0;
  let skip_accumulator = 0;
  let last_color = "";
  for (const c of fen) {
    switch (c) {
      case ' ':
      case '[':
        return pieces;
      case '/':
        --row;
        if (row < 0) return pieces;
        col = 0;
        skip_accumulator = 0;
        break;
      case '~': {
        const piece = pieces.get(pos2key([col - 1, row]));
        if (piece) piece.promoted = true;
        break;
      }
      default: {
        const nb = c.charCodeAt(0);
        if (nb < 58) {
          // digit
          skip_accumulator *= 10;
          skip_accumulator += nb - 48;
        } else {
          col += skip_accumulator;
          skip_accumulator = 0;

          if (last_color) {
            const role = c.toLowerCase();
            pieces.set(pos2key([col, row]), {
              role: roles[role],
              color: colors[last_color],
            });
            ++col;
            last_color = "";
          }
          else {
            last_color = c;
          }
        }
      }
    }
  }
  return pieces;
}

export function write(pieces: cg.Pieces): cg.FEN {
  return invRanks
    .map(y =>
      cg.files
        .map(x => {
          const piece = pieces.get((x + y) as cg.Key);
          if (piece) {
            let p = piece.color.slice(0, 1) + letters[piece.role];
            if (piece.promoted) p += '~';
            return p;
          } else return '1';
        })
        .join('')
    )
    .join('/')
    .replace(/1{2,}/g, s => s.length.toString());
}
