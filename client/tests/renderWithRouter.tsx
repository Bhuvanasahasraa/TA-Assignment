import { render } from '@testing-library/react';
import { App as AntApp } from 'antd';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/** Renders `element` at `path`, with stub pages for other routes so navigation can be asserted. */
export function renderAt(path: string, element: ReactElement) {
  return render(
    <AntApp>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
          <Route path="*" element={<p>Navigated away</p>} />
        </Routes>
      </MemoryRouter>
    </AntApp>,
  );
}
