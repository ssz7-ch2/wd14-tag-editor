import { useState } from 'react';
import ReactSlider from 'react-slider';
import './Slider.css';

type SliderProps = {
  min: number;
  max: number;
  step: number;
  initial: number;
  decimals: number;
  name: string;
};

function Slider({ min, max, step, initial, decimals, name }: SliderProps) {
  const [value, setValue] = useState(initial);

  return (
    <div className="slider-container">
      <ReactSlider
        className="slider"
        trackClassName="slider-track"
        thumbClassName="slider-thumb"
        thumbActiveClassName="slider-thumb-active"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(value) => setValue(value)}
      />
      <input
        type="number"
        name={name}
        id={name}
        value={value.toFixed(decimals)}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        max={max}
        min={min}
        step={step}
      />
    </div>
  );
}

export default Slider;
