/*
 * MIT License
 *
 * Copyright (c) 2025 michioxd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ReactNode, StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client';
import "@radix-ui/themes/styles.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import './index.scss';
import App from './App'
import { Theme } from '@radix-ui/themes';
import { ThemeProvider } from './context/ThemeContext';

// why we need lint for main file heh?
// eslint-disable-next-line react-refresh/only-export-components
const ThemeMatcher = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'dark' | 'light' | 'system'>(localStorage.getItem('mode') as 'dark' | 'light' | 'system' || 'system');
  const [theme, setTheme] = useState<'dark' | 'light'>(mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    matcher.addEventListener('change', listener);
    return () => matcher.removeEventListener('change', listener);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('mode', mode);
    setTheme(mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode);
  }, [mode]);

  return <ThemeProvider value={{ mode, setMode }}>
    <Theme appearance={theme}>{children}</Theme>
  </ThemeProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeMatcher>
      <App />
    </ThemeMatcher>
  </StrictMode>,
)
