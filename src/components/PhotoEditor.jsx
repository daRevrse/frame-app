import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { useSearchParams, useNavigate } from "react-router-dom";

// Composant pour charger et afficher l'image utilisateur
const UserImage = ({ image, imageProps, onDragEnd, onTransform }) => {
  const [img] = useImage(image);
  const imageRef = useRef();

  return (
    <KonvaImage
      ref={imageRef}
      image={img}
      {...imageProps}
      draggable
      onDragEnd={onDragEnd}
      onTransformEnd={onTransform}
    />
  );
};

// Composant pour le cadre
const FrameImage = ({ dimensions, frameUrl }) => {
  const [frame] = useImage(frameUrl || "/frame.png", "anonymous");

  return (
    <KonvaImage
      image={frame}
      x={0}
      y={0}
      width={dimensions.width}
      height={dimensions.height}
      listening={false} // Le cadre n'est pas interactif
    />
  );
};

function PhotoEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageProps, setImageProps] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 600,
    height: 600,
  });

  const stageRef = useRef();
  const containerRef = useRef();
  const fileInputRef = useRef();

  // Charger le cadre personnalisé depuis l'URL
  const frameId = searchParams.get("frame");
  const [customFrameUrl, setCustomFrameUrl] = useState(null);

  useEffect(() => {
    const loadCustomFrame = async () => {
      if (frameId) {
        try {
          const response = await fetch(`http://localhost:3001/api/frames/${frameId}`);
          const data = await response.json();

          if (data.success) {
            setCustomFrameUrl(data.frame.url);
          } else {
            console.error("Cadre non trouvé");
          }
        } catch (error) {
          console.error("Erreur lors du chargement du cadre:", error);
        }
      }
    };

    loadCustomFrame();
  }, [frameId]);

  // Responsive canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const size = Math.min(containerWidth - 32, 600); // Max 600px
        setCanvasDimensions({ width: size, height: size });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Gérer l'import de photo
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Centrer et ajuster l'image
        const scale = Math.min(
          canvasDimensions.width / img.width,
          canvasDimensions.height / img.height
        );

        setImageProps({
          x: (canvasDimensions.width - img.width * scale) / 2,
          y: (canvasDimensions.height - img.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          width: img.width,
          height: img.height,
        });

        setUploadedImage(event.target.result);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Gérer le drag
  const handleDragEnd = (e) => {
    setImageProps({
      ...imageProps,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Gérer le zoom (molette)
  const handleWheel = (e) => {
    e.evt.preventDefault();

    if (!uploadedImage) return;

    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = imageProps.scaleX;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - imageProps.x) / oldScale,
      y: (pointer.y - imageProps.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limiter le zoom
    const finalScale = Math.max(0.1, Math.min(newScale, 5));

    setImageProps({
      ...imageProps,
      scaleX: finalScale,
      scaleY: finalScale,
      x: pointer.x - mousePointTo.x * finalScale,
      y: pointer.y - mousePointTo.y * finalScale,
    });
  };

  // Gérer le pinch zoom sur mobile
  const handleTouchMove = (e) => {
    e.evt.preventDefault();

    if (!uploadedImage) return;

    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      const dist = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (!stageRef.current.lastDist) {
        stageRef.current.lastDist = dist;
      }

      const scale = imageProps.scaleX * (dist / stageRef.current.lastDist);
      const finalScale = Math.max(0.1, Math.min(scale, 5));

      setImageProps({
        ...imageProps,
        scaleX: finalScale,
        scaleY: finalScale,
      });

      stageRef.current.lastDist = dist;
    }
  };

  const handleTouchEnd = () => {
    stageRef.current.lastDist = 0;
  };

  // Télécharger le canvas
  const handleDownload = () => {
    if (!uploadedImage) {
      alert("Veuillez d'abord importer une photo");
      return;
    }

    const uri = stageRef.current.toDataURL({
      pixelRatio: 2, // Meilleure qualité
    });

    const link = document.createElement("a");
    link.download = "mon-cadre-caritatif.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Réinitialiser
  const handleReset = () => {
    setUploadedImage(null);
    setImageProps({
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back to Home Button */}
      <div className="mb-4">
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

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Boutons d'action */}
        <div className="p-6 bg-gradient-to-r from-charity-primary to-charity-secondary">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-white text-charity-dark font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {uploadedImage ? "Changer la photo" : "Importer ma photo"}
            </label>

            {uploadedImage && (
              <>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-charity-dark font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Télécharger
                </button>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-md"
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
                  Réinitialiser
                </button>
              </>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="p-6">
          <div
            className="relative mx-auto"
            style={{ maxWidth: canvasDimensions.width }}
          >
            {!uploadedImage && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 z-10"
                style={{
                  width: canvasDimensions.width,
                  height: canvasDimensions.height,
                }}
              >
                <div className="text-center p-6">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    Importez votre photo
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Elle apparaîtra dans le cadre
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-inner overflow-hidden">
              <Stage
                ref={stageRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                onWheel={handleWheel}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="touch-none"
              >
                <Layer>
                  {uploadedImage && (
                    <UserImage
                      image={uploadedImage}
                      imageProps={imageProps}
                      onDragEnd={handleDragEnd}
                      onTransform={handleDragEnd}
                    />
                  )}
                  <FrameImage dimensions={canvasDimensions} frameUrl={customFrameUrl} />
                </Layer>
              </Stage>
            </div>
          </div>

          {/* Instructions */}
          {uploadedImage && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                Comment ajuster votre photo :
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Déplacer :</strong> Cliquez et glissez la photo
                </li>
                <li>
                  • <strong>Zoomer :</strong> Utilisez la molette (ordinateur)
                  ou pincez (mobile)
                </li>
                <li>
                  • <strong>Télécharger :</strong> Cliquez sur "Télécharger"
                  quand vous êtes satisfait
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoEditor;
