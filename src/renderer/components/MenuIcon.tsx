import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

type MenuIconProps = {
  icon: IconDefinition;
  text: string;
  color?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

function MenuIcon({ icon, text, color, onClick }: MenuIconProps) {
  return (
    <button type="button" onClick={onClick}>
      <FontAwesomeIcon
        icon={icon}
        className="menu-icon"
        style={{
          color,
        }}
      />
      <p>{text}</p>
    </button>
  );
}

export default MenuIcon;
