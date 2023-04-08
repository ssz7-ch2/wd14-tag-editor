import { useState } from 'react';
import './Checkbox.css';

type CheckboxProps = {
  name: string;
  initial: boolean;
};

function Checkbox({ name, initial }: CheckboxProps) {
  const [value, setValue] = useState(initial);
  return (
    <div className="checkbox">
      <input
        type="checkbox"
        name={name}
        id={name}
        checked={value}
        onChange={(e) => setValue(e.target.checked)}
      />
      <span className="checkmark" />
    </div>
  );
}

export default Checkbox;
