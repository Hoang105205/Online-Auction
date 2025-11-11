import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/Admin/DashboardPage";
import DetailsPage from "./pages/DetailsPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="details/:id" element={<DetailsPage />} />
      </Route>
      //Admin route
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </>




function App() {
  return <RouterProvider router={router} />;
}

export default App;
