import { createRoot } from 'react-dom/client';
import App from './App';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

document.addEventListener('keydown', () => {
  if (document.activeElement === document.body) {
    document.getElementById('app-container')?.focus();
  }
});
