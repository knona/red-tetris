import { Socket } from 'socket.io';
import { Player } from 'src/modules/events/models/Player';

export type PlayerSocket = Socket & { player: Player };
