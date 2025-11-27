import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const frameId = searchParams.get("frame_id");

  useEffect(() => {
    // Rediriger vers le cadre après 5 secondes
    const timer = setTimeout(() => {
      if (frameId) {
        navigate(`/?frame=${frameId}`);
      } else {
        navigate("/");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [frameId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-charity-primary/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement réussi !
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Merci pour votre achat ! Votre cadre a été prolongé avec succès.
        </p>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start text-sm text-green-800">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-left">
              <p className="font-semibold mb-1">Que se passe-t-il ensuite ?</p>
              <ul className="space-y-1">
                <li>• Votre cadre est maintenant actif pour la durée choisie</li>
                <li>• Vous pouvez continuer à partager votre lien</li>
                <li>• Un email de confirmation vous a été envoyé</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(frameId ? `/?frame=${frameId}` : "/")}
            className="w-full bg-charity-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-charity-primary/90 transition-colors"
          >
            Voir mon cadre
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        {/* Auto redirect message */}
        <p className="mt-6 text-sm text-gray-500">
          Redirection automatique dans 5 secondes...
        </p>
      </div>
    </div>
  );
}

export default Success;
