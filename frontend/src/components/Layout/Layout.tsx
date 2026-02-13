import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
