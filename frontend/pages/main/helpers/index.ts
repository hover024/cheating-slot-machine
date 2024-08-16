import { RefObject } from 'react';

const MOVE_BUTTON_DISTANCE = 300;

const calculatePos = (
  position: { top: number; left: number },
  cashOutButton: RefObject<HTMLButtonElement>
): { newTop: number; newLeft: number } => {
  const angle = Math.random() * 2 * Math.PI;

  // Calculate new position
  const newTop = position.top + Math.sin(angle) * MOVE_BUTTON_DISTANCE;
  const newLeft = position.left + Math.cos(angle) * MOVE_BUTTON_DISTANCE;

  if (validatePosition(cashOutButton, newLeft, newTop)) {
    return { newTop, newLeft };
  } else {
    return calculatePos(position, cashOutButton);
  }
};

const validatePosition = (
  cashOutButton: RefObject<HTMLButtonElement>,
  newX: number,
  newY: number
) => {
  if (!cashOutButton.current) return;

  const rect = cashOutButton.current.getBoundingClientRect();

  return !(
    rect.x + newX < 0 ||
    newY < 0 ||
    rect.x + newX > window.innerWidth ||
    rect.y + newY > window.innerHeight
  );
};

export default calculatePos;
