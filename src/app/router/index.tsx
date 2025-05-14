import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from '../../presentation/pages/WelcomePage';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
    </Routes>
  </BrowserRouter>
);
