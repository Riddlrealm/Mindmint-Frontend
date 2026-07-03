import React from 'react';
import AnswerOption from './AnswerOption';

export type AnswerState = {
  letter: string;
  text: string;
  state: 'default' | 'selected' | 'correct' | 'incorrect';
};

interface AnswerOptionsContainerProps {
  answers: AnswerState[];
  onAnswerSelect?: (index: number) => void;
  disabled?: boolean;
}

const AnswerOptionsContainer: React.FC<AnswerOptionsContainerProps> = ({
  answers,
  onAnswerSelect,
  disabled = false,
}) => {
  const handlePress = (index: number) => {
    if (disabled) return;
    onAnswerSelect?.(index);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4 min-h-0">
      {answers.map((answer, index) => (
        <div key={answer.letter} className="w-full h-full min-h-0">
          <AnswerOption
            letter={answer.letter}
            text={answer.text}
            state={answer.state}
            onClick={() => handlePress(index)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
};

export default AnswerOptionsContainer;
