import { useMemo, useRef } from 'react';
import { Piece } from '../../../models/Piece';
import { Component, Optional } from '../../../shared/Types';
import { cellBackgroundColor, cellBorderColor, cellOpacity } from '../../../tetris/PieceDisplay';
import { bottomProjection } from '../../../tetris/PiecePosition';
import { PLAYFIELD_BUFFER } from '../../../utils/constants';
import { useResize } from '../../../utils/useResize';
import { TetrisGridOverlay } from './models/TetrisGridOverlay';
import { TetrisGridStyle } from './models/TetrisGridStyle';
import './TetrisGrid.css';
import { TetrisGridProps } from './TetrisGridProps';

export function TetrisGrid(props: TetrisGridProps): Component {
  const pieceGhost: Optional<Piece> = useMemo(
    () => {
      if (!props.piece || props.style === TetrisGridStyle.compact) {
        return undefined;
      }
      return bottomProjection(props.piece, props.playfield);
    },
    props.style === TetrisGridStyle.compact ? [] : [props.piece]
  );
  const tetrisCellRef: any = useRef();
  const { width, height }: { width: number; height: number } = useResize(tetrisCellRef);

  function overlay(): Component {
    switch (props.overlay ?? TetrisGridOverlay.none) {
      case TetrisGridOverlay.none:
        return <div className="overlay"></div>;
      case TetrisGridOverlay.emptyPlayer:
        return <div className="overlay empty_player" data-testid="empty_player"></div>;
      case TetrisGridOverlay.gameOver:
        return (
          <div className="overlay game_over" data-testid="game_over">
            <h2>KO</h2>
          </div>
        );
    }
  }

  return (
    <div className={`tetris_grid ${props.style ?? TetrisGridStyle.regular}`}>
      {props.playfield
        .filter((_row, y) => y >= PLAYFIELD_BUFFER)
        .map((row, y) => {
          y = y + PLAYFIELD_BUFFER;
          return row.map((_, x) => {
            return (
              <div
                className="tetris_grid_cell"
                key={`${x}${y}`}
                ref={x === 0 && y === PLAYFIELD_BUFFER ? tetrisCellRef : undefined}
                style={{
                  width: height,
                  backgroundColor: cellBackgroundColor({ x, y }, props.playfield, props.piece, pieceGhost),
                  border: cellBorderColor({ x, y }, Math.max(width, height), props.playfield, props.piece, pieceGhost),
                  opacity: cellOpacity({ x, y }, props.playfield, props.lockTimer, props.piece, pieceGhost)
                }}
                data-testid={`tetris_grid_cell_${x}${y}`}
              ></div>
            );
          });
        })}
      {overlay()}
    </div>
  );
}
