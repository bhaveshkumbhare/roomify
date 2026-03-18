import Button from "components/ui/Button";
import { generate3DView } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const Visualizer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { initialImage, initialRender, name } = location.state || {};

  const hasInitialGenerated = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null
  );

  const handleBack = () => navigate("/");

  const runGeneration = async () => {
    if (!initialImage) return;

    try {
      setIsProcessing(true);

      const result = await generate3DView({
        sourceImage: initialImage,
      });

      if (result?.renderedImage) {
        setCurrentImage(result.renderedImage);
      }
    } catch (error) {
      console.log("Generation Failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (hasInitialGenerated.current) return;

    if (initialRender) {
      setCurrentImage(initialRender); // ✅ FIXED
      hasInitialGenerated.current = true;
      return;
    }

    if (initialImage) {
      runGeneration();
      hasInitialGenerated.current = true;
    }
  }, [initialImage, initialRender]);

  return (
    <div className="visualizer">
      {/* 🔝 NAVBAR */}
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Roomify</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X /> Exit Editor
        </Button>
      </nav>

      {/* 📦 CONTENT */}
      <section className="content">
        <div className="panel">
          {/* HEADER */}
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{name || "Untitled Project"}</h2>
              <p>Created by you</p>
            </div>

            <div className="panel-actions">
              <Button
                size="sm"
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button size="sm" className="share">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* 🖼 RENDER AREA */}
          <div
            className={`render-area ${
              isProcessing ? "is-processing" : ""
            }`}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt="AI Render"
                className="render-img"
              />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {/* 🔄 LOADING OVERLAY */}
            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering</span>
                  <span className="subtitle">
                    Generating image...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Visualizer;