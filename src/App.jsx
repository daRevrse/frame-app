import React from "react";
import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import Home from "./components/Home";
import PhotoEditor from "./components/PhotoEditor";
import FrameUploader from "./components/FrameUploader";

// Wrapper pour gérer l'ancienne route racine avec paramètres
function RootWrapper() {
  const [searchParams] = useSearchParams();
  const frameId = searchParams.get("frame");

  // Si un frameId est présent, afficher l'éditeur
  if (frameId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charity-primary/10 via-white to-charity-secondary/10">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Cadre Caritatif
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Ajoutez votre photo dans le cadre et partagez votre soutien
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PhotoEditor />
        </main>

        <footer className="mt-12 pb-8 text-center text-gray-500 text-sm">
          <p>Partagez votre soutien sur les réseaux sociaux</p>
        </footer>
      </div>
    );
  }

  // Sinon, afficher la page d'accueil
  return <Home />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootWrapper />} />
        <Route path="/editor" element={
          <div className="min-h-screen bg-gradient-to-br from-charity-primary/10 via-white to-charity-secondary/10">
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Cadre Caritatif
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">
                    Ajoutez votre photo dans notre cadre et partagez votre soutien
                  </p>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PhotoEditor />
            </main>

            <footer className="mt-12 pb-8 text-center text-gray-500 text-sm">
              <p>Partagez votre soutien sur les réseaux sociaux</p>
            </footer>
          </div>
        } />
        <Route path="/upload" element={<FrameUploader />} />
      </Routes>
    </Router>
  );
}

export default App;
