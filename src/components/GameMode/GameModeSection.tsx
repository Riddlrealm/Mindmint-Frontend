import { useMemo } from "react";
import GameModeDescription from "./GameModeDescription";
import GameModesList from "./GameModesList";
import { gameModes } from "../../data/gameModes";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setGameMode } from "./gameSliceStore";

const GameModeSection = () => {
    // The selection lives in the registered `game` slice (see src/store.ts), so
    // it survives navigation and can be read by the /game-mode page's
    // "Play Now" link to hand the mode to /gameplay.
    const selectedModeId = useAppSelector((state) => state.game.selectedModeId);
    const dispatch = useAppDispatch();

    const currentMode = useMemo(
        () =>
            gameModes.find((mode) => mode.id === selectedModeId) ??
            gameModes[0] ??
            null,
        [selectedModeId],
    );

    return (
        <section
            id="game-mode"
            className="w-full px-4 md:px-8 lg:px-10 py-8 lg:py-12"
        >
            <div className="mx-auto max-w-[70rem] border border-[#111A21] rounded-sm bg-[#070D13] p-3 md:p-4 lg:p-5 shadow-[0_0_30px_rgba(0,0,0,0.28)]">
                <div className="flex flex-col xl:flex-row gap-4 xl:gap-5 items-start">
                    <GameModeDescription currentMode={currentMode} />
                    <GameModesList
                        allModes={gameModes}
                        selectedModeId={selectedModeId}
                        onModeSelect={(id) => dispatch(setGameMode(id))}
                    />
                </div>
            </div>
        </section>
    );
};

export default GameModeSection;
