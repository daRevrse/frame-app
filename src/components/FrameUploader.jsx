import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PricingModal from "./PricingModal";
import config from "../config";

function FrameUploader() {
  const [uploadedFrame, setUploadedFrame] = useState(null);
  const [framePreview, setFramePreview] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [frameId, setFrameId] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Gérer l'upload du cadre
  const handleFrameUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualiser immédiatement
    const reader = new FileReader();
    reader.onload = (event) => {
      setFramePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Uploader vers le serveur
    try {
      const formData = new FormData();
      formData.append("frame", file);

      const response = await fetch(`${config.API_URL}/api/frames/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFrame(data.frameUrl);
        setShareLink(data.shareUrl);
        setFrameId(data.frameId);
        setExpiresAt(data.expiresAt);

        // Afficher le modal de pricing après un court délai
        setTimeout(() => {
          setShowPricingModal(true);
        }, 1500);
      } else {
        alert("Erreur lors de l'upload: " + (data.error || "Erreur inconnue"));
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload du cadre. Assurez-vous que le serveur backend est démarré.");
    }
  };

  // Copier le lien
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tester le cadre
  const handleTestFrame = () => {
    const frameId = shareLink.split("frame=")[1];
    navigate(`/?frame=${frameId}`);
  };

  // Réinitialiser
  const handleReset = () => {
    setUploadedFrame(null);
    setFramePreview(null);
    setShareLink("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charity-primary/10 via-white to-charity-secondary/10">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Upload Votre Cadre Personnalisé
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Créez et partagez votre propre cadre pour que d'autres l'utilisent
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Instructions */}
          <div className="p-6 bg-gradient-to-r from-charity-primary to-charity-secondary text-white">
            <h2 className="text-xl font-bold mb-4">Comment ça marche ?</h2>
            <ol className="space-y-2 text-sm">
              <li>1. Uploadez votre image de cadre (PNG avec transparence recommandé)</li>
              <li>2. Récupérez le lien de partage généré automatiquement</li>
              <li>3. Partagez ce lien avec d'autres pour qu'ils utilisent votre cadre</li>
            </ol>
          </div>

          {/* Upload Section */}
          <div className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFrameUpload}
              className="hidden"
              id="frame-upload"
            />

            {!uploadedFrame ? (
              <label
                htmlFor="frame-upload"
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-charity-primary transition-colors"
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Cliquez pour uploader votre cadre
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG ou GIF (Recommandé: PNG avec transparence)
                </p>
              </label>
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Aperçu du cadre</h3>
                  <div className="inline-block bg-gray-100 rounded-lg p-4">
                    <img
                      src={framePreview}
                      alt="Frame preview"
                      className="max-w-md max-h-96 mx-auto"
                    />
                  </div>
                </div>

                {/* Share Link */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Lien de partage
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {copied ? "Copié !" : "Copier"}
                    </button>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Partagez ce lien pour que d'autres utilisent votre cadre
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleTestFrame}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-charity-primary text-white font-semibold rounded-lg hover:bg-charity-primary/90 transition-colors shadow-md"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Tester le cadre
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Nouveau cadre
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-6 bg-blue-50 border-t border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Conseils pour un meilleur cadre :
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Utilisez une image PNG avec fond transparent pour un meilleur rendu</li>
              <li>• Recommandé: Image carrée (600x600px ou plus)</li>
              <li>• Assurez-vous que le cadre a une zone centrale claire pour la photo</li>
              <li>• Les cadres sont stockés localement dans le navigateur</li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour à l'accueil
          </button>
        </div>
      </main>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        frameId={frameId}
        currentPlan="free"
      />
    </div>
  );
}

export default FrameUploader;
