import { useRef } from 'react';
import { BoxedPiece, newBoxedPiece } from '../../../models/BoxedPiece';
import { PieceType } from '../../../models/PieceType';
import { Component, Optional } from '../../../shared/Types';
import { nArray } from '../../../utils/array';
import { PIECE_BACKGROUND_COLOR, PIECE_BORDER_OPACITY, PIECE_BORDER_RATIO } from '../../../utils/constants';
import { useResize } from '../../../utils/useResize';
import { PieceBoxTitlePosition } from './models/PieceBoxTitlePosition';
import './PieceBox.css';
import { PieceBoxProps } from './PieceBoxProps';

export function PieceBox(props: PieceBoxProps): Component {
  const boxedPiece: Optional<BoxedPiece> = props.piece === undefined ? undefined : newBoxedPiece(props.piece.type);
  const boxedPieceRef: any = useRef();
  const { width, height }: { width: number; height: number } = useResize(boxedPieceRef);

  function cellBackgroundColor(x: number, y: number): Optional<string> {
    if (!boxedPiece) {
      return undefined;
    }
    return PIECE_BACKGROUND_COLOR[boxedPiece[y][x]];
  }

  function cellBorderColor(x: number, y: number): Optional<string> {
    if (!boxedPiece) {
      return undefined;
    }
    const pieceType: PieceType | '' = boxedPiece[y][x];
    if (pieceType === '') {
      return undefined;
    }
    const cellRatio: number = Math.min(width, height);
    const borderSize: number = cellRatio * PIECE_BORDER_RATIO;
    return `solid ${borderSize}px rgba(0, 0, 0, ${PIECE_BORDER_OPACITY})`;
  }

  return (
    <div
      className="piece_box"
      style={{ flexDirection: props.titlePosition === PieceBoxTitlePosition.right ? 'row-reverse' : 'row' }}
    >
      <div className="title">
        <h2>{props.title}</h2>
      </div>
      <div className="grids">
        <div className="placeholder_grid">
          {nArray(2).map(y =>
            nArray(4).map(x => <div key={`${x}${y}`} ref={x + y === 0 ? boxedPieceRef : undefined}></div>)
          )}
        </div>
        {boxedPiece ? (
          <div
            className="piece"
            style={{
              gridTemplateRows: `repeat(${boxedPiece.length}, 13px)`,
              gridTemplateColumns: `repeat(${boxedPiece[0].length}, 13px)`
            }}
          >
            {boxedPiece.map((row, y) => {
              return row.map((_, x) => {
                return (
                  <div
                    className="piece_box_grid_cell"
                    key={`${x}${y}`}
                    style={{
                      backgroundColor: cellBackgroundColor(x, y),
                      border: cellBorderColor(x, y)
                    }}
                    data-testid={`piece_box_grid_cell_${x}${y}`}
                  ></div>
                );
              });
            })}
          </div>
        ) : undefined}
      </div>
    </div>
  );
}
