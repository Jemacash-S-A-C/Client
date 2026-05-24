import { useCallback, useState } from "react";
import { BlogPage } from "./components/blog/BlogPage";
import { LoginModal } from "./components/login/LoginModal";
import { SiteHeader } from "./components/layout/SiteHeader";
import { RegisterModal } from "./components/register/RegisterModal";
import heroImg from "./assets/hero.png";
import "./App.css";
import Home from "./pages/Home";
type AuthModal = null | "register" | "login";

function App() {
  const [page, setPage] = useState<"home" | "blog">("home");
  const [authModal, setAuthModal] = useState<AuthModal>(null);

  const openRegister = useCallback(() => setAuthModal("register"), []);
  const closeAuthModals = useCallback(() => setAuthModal(null), []);
  const goToLogin = useCallback(() => setAuthModal("login"), []);
  const goToRegister = useCallback(() => setAuthModal("register"), []);

  return (
    <>
      <main className={`landing${page === "blog" ? " landing--blog" : ""}`}>
        <SiteHeader
          activePage={page}
          onGoHome={() => setPage("home")}
          onGoBlog={() => setPage("blog")}
          onPidePrestamo={openRegister}
        />

        {page === "home" ? (
          <Home />
        ) : (
          <BlogPage featuredBackgroundSrc={heroImg} />
        )}
      </main>

      <RegisterModal
        open={authModal === "register"}
        onClose={closeAuthModals}
        onNavigateToLogin={goToLogin}
        heroBackgroundSrc={heroImg}
      />
      <LoginModal
        open={authModal === "login"}
        onClose={closeAuthModals}
        onNavigateToRegister={goToRegister}
      />
    </>
  );
}

export default App;
