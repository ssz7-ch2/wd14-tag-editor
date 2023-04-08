import { useState } from 'react';
import ReactDropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './Select.css';

type DropdownProps = {
  options: string[];
  initial: string;
  name: string;
};

function Select({ options, initial, name }: DropdownProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className="dropdown-container">
      <ReactDropdown options={options} value={value} onChange={(e) => setValue(e.value)} />
      <input
        type="text"
        name={name}
        id={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export default Select;
