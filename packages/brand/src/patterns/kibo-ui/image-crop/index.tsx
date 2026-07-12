"use client";

import { Button } from "@workspace/ui/components/button";
import { CropIcon, RotateCcwIcon } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
  type ReactCropProps,
} from "react-image-crop";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";

import "react-image-crop/dist/ReactCrop.css";

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined,
): PercentCrop =>
  centerCrop(
    aspect
      ? makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          aspect,
          mediaWidth,
          mediaHeight,
        )
      : { x: 0, y: 0, width: 90, height: 90, unit: "%" },
    mediaWidth,
    mediaHeight,
  );

const percentCropToPixelCrop = (
  percentCrop: PercentCrop,
  mediaWidth: number,
  mediaHeight: number,
): PixelCrop => ({
  unit: "px",
  x: Math.round((percentCrop.x / 100) * mediaWidth),
  y: Math.round((percentCrop.y / 100) * mediaHeight),
  width: Math.round((percentCrop.width / 100) * mediaWidth),
  height: Math.round((percentCrop.height / 100) * mediaHeight),
});

const getCroppedPngImage = async (
  imageSrc: HTMLImageElement,
  scaleFactor: number,
  pixelCrop: PixelCrop,
  maxImageSize: number,
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Context is null, this should never happen.");
  }

  const scaleX = imageSrc.naturalWidth / imageSrc.width;
  const scaleY = imageSrc.naturalHeight / imageSrc.height;

  const canvasWidth = Math.max(1, Math.floor(pixelCrop.width * scaleFactor));
  const canvasHeight = Math.max(1, Math.floor(pixelCrop.height * scaleFactor));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.drawImage(
    imageSrc,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvasWidth,
    canvasHeight,
  );

  const croppedImageUrl = canvas.toDataURL("image/png");
  const response = await fetch(croppedImageUrl);
  const blob = await response.blob();

  if (blob.size > maxImageSize) {
    if (scaleFactor <= 0.2) {
      return croppedImageUrl;
    }
    return await getCroppedPngImage(imageSrc, scaleFactor * 0.9, pixelCrop, maxImageSize);
  }

  return croppedImageUrl;
};

type ImageCropContextType = {
  file: File;
  maxImageSize: number;
  imgSrc: string;
  crop: PercentCrop | undefined;
  completedCrop: PixelCrop | null;
  imgSize: { width: number; height: number } | null;
  imgRef: RefObject<HTMLImageElement | null>;
  onCrop?: (croppedImage: string) => void;
  reactCropProps: Omit<ReactCropProps, "onChange" | "onComplete" | "children">;
  handleChange: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
  handleComplete: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => Promise<void>;
  onImageElementLoad: (img: HTMLImageElement) => void;
  applyCrop: () => Promise<void>;
  resetCrop: () => void;
};

const ImageCropContext = createContext<ImageCropContextType | null>(null);

const useImageCrop = () => {
  const context = useContext(ImageCropContext);
  if (!context) {
    throw new Error("ImageCrop components must be used within ImageCrop");
  }
  return context;
};

export type ImageCropProps = {
  file: File;
  maxImageSize?: number;
  onCrop?: (croppedImage: string) => void;
  children: ReactNode;
  onChange?: ReactCropProps["onChange"];
  onComplete?: ReactCropProps["onComplete"];
} & Omit<ReactCropProps, "onChange" | "onComplete" | "children">;

export const ImageCrop = ({
  file,
  maxImageSize = 1024 * 1024 * 5,
  onCrop,
  children,
  onChange,
  onComplete,
  ...reactCropProps
}: ImageCropProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgSize, setImgSize] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [initialCrop, setInitialCrop] = useState<PercentCrop>();

  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (!imgSrc) return;
    const probe = new window.Image();
    probe.onload = () => {
      setImgSize({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.src = imgSrc;
  }, [imgSrc]);

  const onImageElementLoad = useCallback(
    (img: HTMLImageElement) => {
      const { width, height } = img;
      const newCrop = centerAspectCrop(width, height, reactCropProps.aspect);
      setCrop(newCrop);
      setInitialCrop(newCrop);
      setCompletedCrop(percentCropToPixelCrop(newCrop, width, height));
    },
    [reactCropProps.aspect],
  );

  const handleChange = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
    onChange?.(pixelCrop, percentCrop);
  };

  // biome-ignore lint/suspicious/useAwait: "onComplete is async"
  const handleComplete = async (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCompletedCrop(pixelCrop);
    onComplete?.(pixelCrop, percentCrop);
  };

  const applyCrop = async () => {
    if (!imgRef.current) {
      return;
    }

    const selectedCrop =
      completedCrop ??
      (crop ? percentCropToPixelCrop(crop, imgRef.current.width, imgRef.current.height) : null);

    if (!selectedCrop || selectedCrop.width <= 0 || selectedCrop.height <= 0) {
      return;
    }

    const croppedImage = await getCroppedPngImage(imgRef.current, 1, selectedCrop, maxImageSize);

    onCrop?.(croppedImage);
  };

  const resetCrop = () => {
    if (initialCrop) {
      setCrop(initialCrop);
      if (imgRef.current) {
        setCompletedCrop(
          percentCropToPixelCrop(initialCrop, imgRef.current.width, imgRef.current.height),
        );
        return;
      }
      setCompletedCrop(null);
    }
  };

  const contextValue: ImageCropContextType = {
    file,
    maxImageSize,
    imgSrc,
    crop,
    completedCrop,
    imgSize,
    imgRef,
    ...(onCrop !== undefined ? { onCrop } : {}),
    reactCropProps,
    handleChange,
    handleComplete,
    onImageElementLoad,
    applyCrop,
    resetCrop,
  };

  return <ImageCropContext.Provider value={contextValue}>{children}</ImageCropContext.Provider>;
};

export type ImageCropContentProps = {
  style?: CSSProperties;
  className?: string;
};

export const ImageCropContent = ({ style, className }: ImageCropContentProps) => {
  const {
    imgSrc,
    crop,
    handleChange,
    handleComplete,
    onImageElementLoad,
    imgRef,
    imgSize,
    reactCropProps,
  } = useImageCrop();

  const shadcnStyle = {
    "--rc-border-color": "var(--color-border)",
    "--rc-focus-color": "var(--color-primary)",
  } as React.CSSProperties;

  return (
    <ReactCrop
      className={cn("max-h-[277px] max-w-full", className)}
      {...(crop ? { crop } : {})}
      onChange={handleChange}
      onComplete={handleComplete}
      {...(style ? { style: { ...shadcnStyle, ...style } } : { style: shadcnStyle })}
      {...reactCropProps}
    >
      {imgSrc && imgSize && (
        <Image
          alt="crop"
          className="max-w-full h-auto object-contain"
          onLoadingComplete={(img) => {
            imgRef.current = img;
            onImageElementLoad(img);
          }}
          ref={imgRef}
          src={imgSrc}
          width={imgSize.width}
          height={imgSize.height}
          unoptimized
        />
      )}
    </ReactCrop>
  );
};

export type ImageCropApplyProps = ComponentProps<typeof Button> & {
  asChild?: boolean;
};

export const ImageCropApply = ({
  asChild = false,
  children,
  onClick,
  type,
  size = "icon",
  variant = "ghost",
  ...props
}: ImageCropApplyProps) => {
  const { applyCrop } = useImageCrop();

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    await applyCrop();
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button onClick={handleClick} size={size} type={type ?? "button"} variant={variant} {...props}>
      {children ?? <CropIcon className="size-4" />}
    </Button>
  );
};

export type ImageCropResetProps = ComponentProps<typeof Button> & {
  asChild?: boolean;
};

export const ImageCropReset = ({
  asChild = false,
  children,
  onClick,
  type,
  size = "icon",
  variant = "ghost",
  ...props
}: ImageCropResetProps) => {
  const { resetCrop } = useImageCrop();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    resetCrop();
    onClick?.(e);
  };

  if (asChild) {
    return (
      <Slot.Root onClick={handleClick} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <Button onClick={handleClick} size={size} type={type ?? "button"} variant={variant} {...props}>
      {children ?? <RotateCcwIcon className="size-4" />}
    </Button>
  );
};

// Keep the original Cropper component for backward compatibility
export type CropperProps = Omit<ReactCropProps, "onChange"> & {
  file: File;
  maxImageSize?: number;
  onCrop?: (croppedImage: string) => void;
  onChange?: ReactCropProps["onChange"];
};

export const Cropper = ({
  onChange,
  onComplete,
  onCrop,
  style,
  className,
  file,
  maxImageSize,
  ...props
}: CropperProps) => (
  <ImageCrop
    file={file}
    {...(maxImageSize !== undefined ? { maxImageSize } : {})}
    {...(onChange !== undefined ? { onChange } : {})}
    {...(onComplete !== undefined ? { onComplete } : {})}
    {...(onCrop !== undefined ? { onCrop } : {})}
    {...props}
  >
    <ImageCropContent
      {...(className !== undefined ? { className } : {})}
      {...(style !== undefined ? { style } : {})}
    />
  </ImageCrop>
);
