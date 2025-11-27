import React, { useEffect, useState } from "react";
import config from "../config";

function ExpirationWarning({ expiresAt, frameId, onUpgrade }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expirationDate = new Date(expiresAt);
      const diff = expirationDate - now;

      if (diff <= 0) {
        setTimeLeft({ expired: true });
        setShowWarning(true);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      setTimeLeft({
        total: diff,
        days,
        hours: hours % 24,
        minutes: minutes % 60,
        expired: false,
      });

      // Afficher le warning si moins de 15 minutes ou moins de 10% du temps
      if (minutes < 15) {
        setShowWarning(true);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <div className="bg-red-600 text-white rounded-lg shadow-2xl p-6 animate-bounce">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Cadre expiré !</h3>
              <p className="text-sm mb-4">
                Votre cadre n'est plus accessible. Prolongez-le maintenant pour continuer à l'utiliser.
              </p>
              <button
                onClick={onUpgrade}
                className="w-full bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Prolonger maintenant
              </button>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showWarning) return null;

  const isUrgent = timeLeft.total < 900000; // Less than 15 minutes
  const bgColor = isUrgent ? "bg-red-500" : "bg-orange-500";

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className={`${bgColor} text-white rounded-lg shadow-2xl p-6`}>
        <div className="flex items-start">
          <svg
            className="w-6 h-6 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">
              {isUrgent ? "Attention !" : "Rappel"}
            </h3>
            <p className="text-sm mb-2">
              Votre cadre expire dans :
            </p>
            <div className="text-2xl font-bold mb-4">
              {timeLeft.days > 0 && `${timeLeft.days}j `}
              {timeLeft.hours > 0 && `${timeLeft.hours}h `}
              {timeLeft.minutes}min
            </div>
            <p className="text-sm mb-4">
              Ne le perdez pas ! Prolongez maintenant pour continuer à partager votre cadre.
            </p>
            <button
              onClick={onUpgrade}
              className="w-full bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Prolonger mon cadre
            </button>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExpirationWarning;
