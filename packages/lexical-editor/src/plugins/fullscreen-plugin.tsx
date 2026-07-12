"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";

export function FullscreenPlugin() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleFullscreen = () => {
    const editorContainer = document.querySelector(".notion-editor") as HTMLElement;
    const toolbar = editorContainer?.querySelector('[role="toolbar"]') as HTMLElement;
    const contentArea = editorContainer?.querySelector(".relative.px-6") as HTMLElement;

    if (!editorContainer || !toolbar || !contentArea || isAnimating) return;

    setIsAnimating(true);

    if (!isFullscreen) {
      // ENTER FULLSCREEN - Capture initial positions
      const initialContainerRect = editorContainer.getBoundingClientRect();
      const initialToolbarRect = toolbar.getBoundingClientRect();
      const initialContentRect = contentArea.getBoundingClientRect();

      // Add fullscreen class to get final positions
      editorContainer.classList.add("fullscreen-editor");

      // Get final positions
      const finalContainerRect = editorContainer.getBoundingClientRect();
      const finalToolbarRect = toolbar.getBoundingClientRect();
      const finalContentRect = contentArea.getBoundingClientRect();

      // Calculate deltas (FLIP technique)
      const containerDeltaX = initialContainerRect.left - finalContainerRect.left;
      const containerDeltaY = initialContainerRect.top - finalContainerRect.top;
      const containerScaleX = initialContainerRect.width / finalContainerRect.width;
      const containerScaleY = initialContainerRect.height / finalContainerRect.height;

      const toolbarDeltaY = initialToolbarRect.top - finalToolbarRect.top;
      const contentDeltaY = initialContentRect.top - finalContentRect.top;
      const contentScaleX = initialContentRect.width / finalContentRect.width;

      // Apply initial transforms (invert)
      editorContainer.style.transition = "none";
      editorContainer.style.transformOrigin = "top left";
      editorContainer.style.transform = `translate(${containerDeltaX}px, ${containerDeltaY}px) scale(${containerScaleX}, ${containerScaleY})`;

      toolbar.style.transition = "none";
      toolbar.style.transform = `translateY(${toolbarDeltaY}px)`;

      contentArea.style.transition = "none";
      contentArea.style.transform = `translateY(${contentDeltaY}px) scaleX(${contentScaleX})`;
      contentArea.style.transformOrigin = "center top";

      // Force reflow
      void editorContainer.offsetHeight;

      // Animate to final position (play)
      // Using cubic-bezier ease-out with no overshoot for smooth expansion
      const smoothEasing = "cubic-bezier(0.16, 1, 0.3, 1)";

      editorContainer.style.transition = `transform 450ms ${smoothEasing}`;
      editorContainer.style.transform = "translate(0, 0) scale(1, 1)";

      toolbar.style.transition = `transform 450ms ${smoothEasing}`;
      toolbar.style.transform = "translateY(0)";

      contentArea.style.transition = `transform 450ms ${smoothEasing}`;
      contentArea.style.transform = "translateY(0) scaleX(1)";

      setTimeout(() => {
        editorContainer.style.transition = "";
        editorContainer.style.transform = "";
        editorContainer.style.transformOrigin = "";
        toolbar.style.transition = "";
        toolbar.style.transform = "";
        contentArea.style.transition = "";
        contentArea.style.transform = "";
        contentArea.style.transformOrigin = "";
        setIsAnimating(false);
      }, 450);

      setIsFullscreen(true);
    } else {
      // EXIT FULLSCREEN - FLIP technique: measure before/after, invert, then play

      // FIRST: Capture current position (in fullscreen)
      const initialContainerRect = editorContainer.getBoundingClientRect();
      const initialToolbarRect = toolbar.getBoundingClientRect();
      const initialContentRect = contentArea.getBoundingClientRect();

      // LAST: Remove fullscreen to get final position
      editorContainer.classList.remove("fullscreen-editor");

      // Measure final positions
      const finalContainerRect = editorContainer.getBoundingClientRect();
      const finalToolbarRect = toolbar.getBoundingClientRect();
      const finalContentRect = contentArea.getBoundingClientRect();

      // INVERT: Calculate how much to transform to look like we're still in fullscreen
      const containerDeltaX = initialContainerRect.left - finalContainerRect.left;
      const containerDeltaY = initialContainerRect.top - finalContainerRect.top;
      const containerScaleX = initialContainerRect.width / finalContainerRect.width;
      const containerScaleY = initialContainerRect.height / finalContainerRect.height;

      const toolbarDeltaY = initialToolbarRect.top - finalToolbarRect.top;
      const contentDeltaY = initialContentRect.top - finalContentRect.top;
      const contentScaleX = initialContentRect.width / finalContentRect.width;

      // Apply inverted transforms to make it look like fullscreen again
      editorContainer.style.transition = "none";
      editorContainer.style.transformOrigin = "top left";
      editorContainer.style.transform = `translate(${containerDeltaX}px, ${containerDeltaY}px) scale(${containerScaleX}, ${containerScaleY})`;
      editorContainer.style.overflow = "visible";

      toolbar.style.transition = "none";
      toolbar.style.transform = `translateY(${toolbarDeltaY}px)`;
      toolbar.style.position = "relative";
      toolbar.style.zIndex = "10";

      contentArea.style.transition = "none";
      contentArea.style.transform = `translateY(${contentDeltaY}px) scaleX(${contentScaleX})`;
      contentArea.style.transformOrigin = "center top";

      // Force reflow
      void editorContainer.offsetHeight;

      // PLAY: Animate to natural position (no transform)
      const smoothEasing = "cubic-bezier(0.16, 1, 0.3, 1)";

      editorContainer.style.transition = `transform 450ms ${smoothEasing}`;
      editorContainer.style.transform = "translate(0, 0) scale(1, 1)";

      toolbar.style.transition = `transform 450ms ${smoothEasing}`;
      toolbar.style.transform = "translateY(0)";

      contentArea.style.transition = `transform 450ms ${smoothEasing}`;
      contentArea.style.transform = "translateY(0) scaleX(1)";

      setTimeout(() => {
        // Clean up all inline styles
        editorContainer.style.transition = "";
        editorContainer.style.transform = "";
        editorContainer.style.transformOrigin = "";
        editorContainer.style.overflow = "";
        toolbar.style.transition = "";
        toolbar.style.transform = "";
        toolbar.style.position = "";
        toolbar.style.zIndex = "";
        contentArea.style.transition = "";
        contentArea.style.transform = "";
        contentArea.style.transformOrigin = "";
        setIsAnimating(false);
      }, 450);

      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`z-50 ${isFullscreen ? "fixed bottom-6 left-1/2 -translate-x-1/2" : "absolute bottom-4 right-4"}`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <BrandButton
            family="default"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md hover:shadow-lg"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </BrandButton>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
