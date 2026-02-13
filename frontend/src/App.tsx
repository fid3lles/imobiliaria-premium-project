import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout/Layout";
import Search from "./pages/Search";
import Details from "./pages/Details";
import NotFound404 from "./components/NotFound/NotFound404";
import AdvertiseProperty from "./pages/AdvertiseProperty";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/busca" element={<Search />} />
        <Route path="/imovel/:id" element={<Details />} />
        <Route path="/anunciar" element={<AdvertiseProperty />} />
        <Route path="*" element={<NotFound404 />} />
      </Route>
    </Routes>
  );
}
