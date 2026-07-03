import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { gameModes } from '../../data/gameModes';

interface GameModeDropdownProps {
  /** Currently selected mode id. Defaults to the first mode. */
  value?: string;
  onChange?: (modeId: string) => void;
  className?: string;
}

const GameModeDropdown: React.FC<GameModeDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(value ?? gameModes[0]?.id ?? '');
  const controlled = value !== undefined;
  const selectedId = controlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (!controlled) setInternalValue(next);
    onChange?.(next);
  };

  return (
    <div className={`w-full max-w-xs ${className}`}>
      <label
        className="block text-sm font-medium text-gray-300 mb-1"
        htmlFor="game-mode-select"
      >
        Game Mode
      </label>
      <div className="relative">
        <select
          id="game-mode-select"
          aria-label="Select game mode"
          value={selectedId}
          onChange={handleChange}
          className="block w-full appearance-none rounded-md border border-[#323336] bg-[#141516] py-2 pl-3 pr-10 text-sm leading-5 text-white focus:border-[#F9BC07] focus:outline-none focus:ring-1 focus:ring-[#F9BC07]"
        >
          {gameModes.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default GameModeDropdown;
