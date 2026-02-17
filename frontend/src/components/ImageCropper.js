import { useState, useRef, useEffect, useCallback } from "react";

/**
 * 📱 MOBILE-FRIENDLY IMAGE CROPPER — FIXED
 * Fixes:
 * 1. Correct crop math: crop box size measured from actual DOM element, not vw/vh
 * 2. No lag: drag uses refs + requestAnimationFrame instead of setState
 */

function ImageCropper({ imageFile, onCropComplete, onCancel }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scaleState, setScaleState] = useState(1); // only for slider display
  const [cropBoxSize, setCropBoxSize] = useState(0);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const cropBoxRef = useRef(null);

  // Use refs for all drag/zoom state to avoid re-render lag
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef(0);
  const rafRef = useRef(null);

  // Apply transform directly to DOM — no React re-render
  const applyTransform = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(${scaleRef.current})`;
    }
  }, []);

  const scheduleTransform = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [applyTransform]);

  // Load image
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  // Set initial scale once image + container are ready
  useEffect(() => {
    if (!imageSrc || !containerRef.current) return;

    const img = new Image();
    img.onload = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      // Crop box is the smaller of the two container dimensions, with 20px padding
      const box = Math.min(containerWidth, containerHeight) - 40;
      setCropBoxSize(box);

      // Scale image so its shorter side fills the crop box
      const scaleX = box / img.width;
      const scaleY = box / img.height;
      const initialScale = Math.max(scaleX, scaleY);

      setImageSize({ width: img.width, height: img.height });
      scaleRef.current = initialScale;
      posRef.current = { x: 0, y: 0 };
      setScaleState(initialScale);
      applyTransform();
    };
    img.src = imageSrc;
  }, [imageSrc, applyTransform]);

  // ── Pointer handlers (refs only, no setState) ──────────────────────────────

  const handlePointerDown = useCallback((e) => {
    if (e.type === "touchstart" && e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = d;
      return;
    }
    isDraggingRef.current = true;
    const cx = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const cy = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: cx - posRef.current.x, y: cy - posRef.current.y };
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (e.type === "touchmove" && e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchDistanceRef.current > 0) {
        const newScale = Math.max(0.3, Math.min(10, scaleRef.current * (d / touchDistanceRef.current)));
        scaleRef.current = newScale;
        setScaleState(newScale); // update slider (low frequency ok)
        scheduleTransform();
      }
      touchDistanceRef.current = d;
      return;
    }

    if (!isDraggingRef.current) return;
    const cx = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const cy = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    posRef.current = { x: cx - dragStartRef.current.x, y: cy - dragStartRef.current.y };
    scheduleTransform();
  }, [scheduleTransform]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    touchDistanceRef.current = 0;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const newScale = Math.max(0.3, Math.min(10, scaleRef.current * (e.deltaY > 0 ? 0.9 : 1.1)));
    scaleRef.current = newScale;
    setScaleState(newScale);
    scheduleTransform();
  }, [scheduleTransform]);

  // ── Zoom buttons ───────────────────────────────────────────────────────────

  const handleZoomIn = () => {
    const newScale = Math.min(10, scaleRef.current * 1.2);
    scaleRef.current = newScale;
    setScaleState(newScale);
    scheduleTransform();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.3, scaleRef.current / 1.2);
    scaleRef.current = newScale;
    setScaleState(newScale);
    scheduleTransform();
  };

  const handleReset = () => {
    if (!containerRef.current || imageSize.width === 0) return;
    const box = cropBoxSize || Math.min(containerRef.current.offsetWidth, containerRef.current.offsetHeight) - 40;
    const initialScale = Math.max(box / imageSize.width, box / imageSize.height);
    scaleRef.current = initialScale;
    posRef.current = { x: 0, y: 0 };
    setScaleState(initialScale);
    scheduleTransform();
  };

  // ── CROP — fixed math ──────────────────────────────────────────────────────
  const handleCrop = () => {
    if (!imageSrc || !containerRef.current || !cropBoxRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      // Actual crop box size in pixels (measured from DOM element)
      const box = cropBoxRef.current.offsetWidth;

      // The image is rendered centered in the container with CSS transform:
      //   translate(posRef.x, posRef.y) scale(scaleRef.current)
      // The image's natural center on screen = container center + pos offset
      // The crop box is centered in the container.
      // We need to find what source pixels are inside the crop box.

      const containerCenterX = containerWidth / 2;
      const containerCenterY = containerHeight / 2;

      // Image center on screen (in container-local coords)
      const imageCenterScreenX = containerCenterX + posRef.current.x;
      const imageCenterScreenY = containerCenterY + posRef.current.y;

      // Crop box center on screen = container center
      const cropCenterX = containerCenterX;
      const cropCenterY = containerCenterY;

      // Offset of crop box center relative to image center (in screen pixels)
      const offsetX = cropCenterX - imageCenterScreenX;
      const offsetY = cropCenterY - imageCenterScreenY;

      // Convert offset to source image coordinates
      const sourceOffsetX = offsetX / scaleRef.current;
      const sourceOffsetY = offsetY / scaleRef.current;

      // Source region size
      const sourceSize = box / scaleRef.current;

      // Source top-left
      const srcX = imageSize.width / 2 + sourceOffsetX - sourceSize / 2;
      const srcY = imageSize.height / 2 + sourceOffsetY - sourceSize / 2;

      ctx.drawImage(img, srcX, srcY, sourceSize, sourceSize, 0, 0, 500, 500);

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCropComplete(file);
        },
        "image/jpeg",
        0.9
      );
    };

    img.src = imageSrc;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.95)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#1a1a1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onCancel}
          style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer", padding: "5px 10px" }}
        >
          ✕ Cancel
        </button>
        <h3 style={{ color: "white", margin: 0, fontSize: "16px" }}>Crop Image</h3>
        <button
          onClick={handleCrop}
          style={{ background: "#4CAF50", border: "none", color: "white", fontSize: "16px", cursor: "pointer", padding: "8px 16px", borderRadius: "4px", fontWeight: "bold" }}
        >
          Done ✓
        </button>
      </div>

      {/* Crop Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          touchAction: "none",
          cursor: "grab",
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Image — transform applied directly via ref */}
        {imageSrc && (
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            style={{
              position: "absolute",
              transformOrigin: "center center",
              userSelect: "none",
              pointerEvents: "none",
              maxWidth: "none",
              maxHeight: "none",
              willChange: "transform",
            }}
            draggable={false}
          />
        )}

        {/* Crop box — sized via JS so we can read its exact pixel size */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: "none",
          }}
        >
          {cropBoxSize > 0 && (
            <div
              ref={cropBoxRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: cropBoxSize,
                height: cropBoxSize,
                border: "2px solid white",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* Instructions */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.65)",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          📱 Pinch to zoom • Drag to move
        </div>
      </div>

      {/* Zoom Controls */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleZoomOut}
          style={{ width: 46, height: 46, borderRadius: "50%", border: "2px solid white", backgroundColor: "transparent", color: "white", fontSize: "22px", cursor: "pointer" }}
        >
          −
        </button>

        <div style={{ flex: 1, maxWidth: 280, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "white", fontSize: "12px", minWidth: 36 }}>
            {Math.round(scaleState * 100)}%
          </span>
          <input
            type="range"
            min="30"
            max="1000"
            value={scaleState * 100}
            onChange={(e) => {
              const newScale = e.target.value / 100;
              scaleRef.current = newScale;
              setScaleState(newScale);
              scheduleTransform();
            }}
            style={{ flex: 1, accentColor: "#4CAF50" }}
          />
        </div>

        <button
          onClick={handleZoomIn}
          style={{ width: 46, height: 46, borderRadius: "50%", border: "2px solid white", backgroundColor: "transparent", color: "white", fontSize: "22px", cursor: "pointer" }}
        >
          +
        </button>

        <button
          onClick={handleReset}
          style={{ padding: "8px 12px", borderRadius: "20px", border: "1px solid white", backgroundColor: "transparent", color: "white", fontSize: "13px", cursor: "pointer" }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

export default ImageCropper;