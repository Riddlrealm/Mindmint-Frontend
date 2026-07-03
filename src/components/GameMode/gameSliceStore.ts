import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GameModeDetail } from '../../data/gameModes';
import { gameModes } from '../../data/gameModes';

interface GameState {
    selectedModeId: string;
    allModes: GameModeDetail[];
}

const initialState: GameState = {
    selectedModeId: gameModes[0]?.id ?? 'classic',
    allModes: [...gameModes],
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setGameMode: (state, action: PayloadAction<string>) => {
            state.selectedModeId = action.payload;
        }
    }
});

export const { setGameMode } = gameSlice.actions;
export default gameSlice.reducer;
