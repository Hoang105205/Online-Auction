import { Route, createBrowserRouter, RouterProvider, createRoutesFromElements } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<LandingPage />} />

    </Route>
  )
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
