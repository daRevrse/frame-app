import React, { useState } from "react";
import config from "../config";

function PricingModal({ isOpen, onClose, frameId, currentPlan = "free" }) {
  const [loading, setLoading] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) {
      onClose();
      return;
    }

    setLoading(plan.id);

    const payload = JSON.stringify({
      priceId: plan.priceId,
      frameId: frameId,
      planId: plan.id,
    });

    try {
      const response = await fetch(
        `${config.API_URL}/api/checkout/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
        }
      );

      const data = await response.json();

      if (!data.url) {
        throw new Error("URL de paiement manquante");
      }

      // Redirection directe vers Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur de paiement.");
      setLoading(null);
    }
  };

  const plans = Object.values(config.PLANS);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-8 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Choisissez votre plan
            </h2>
            <p className="text-gray-600">
              Sélectionnez la durée pendant laquelle votre cadre restera
              accessible
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                  plan.popular
                    ? "border-charity-primary bg-charity-primary/5"
                    : "border-gray-200 hover:border-charity-primary"
                } ${
                  currentPlan === plan.id ? "ring-2 ring-charity-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span
                      className="bg-charity-primary text-white px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ fontSize: "9px" }}
                    >
                      Plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <div className="text-3xl font-bold text-gray-900">
                        Gratuit
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {plan.price}€
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                    {plan.description}
                  </p>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loading === plan.id || currentPlan === plan.id}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPlan === plan.id
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : plan.popular
                        ? "bg-charity-primary text-white hover:bg-charity-primary/90"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Chargement...
                      </span>
                    ) : currentPlan === plan.id ? (
                      "Plan actuel"
                    ) : (
                      "Choisir ce plan"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Informations importantes :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Le plan gratuit expire automatiquement après 1 heure</li>
                  <li>Paiement sécurisé par Stripe</li>
                  <li>
                    Votre cadre restera accessible pendant toute la durée
                    choisie
                  </li>
                  <li>Vous pouvez prolonger à tout moment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
