// components/Courses/CourseBanner.tsx
import { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import { Crop } from "react-image-crop";

export const CourseBanner = ({
  banner,
  onCropComplete,
}: {
  banner?: string;
  onCropComplete: (file: File) => void;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCrop = async () => {
    if (!imgRef.current || !crop) return;

    const croppedImage = await getCroppedImg(imgRef.current, crop);
    onCropComplete(croppedImage);
    setSelectedImage(null);
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<File> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], "banner.jpg", { type: "image/jpeg" }));
        }
      }, "image/jpeg");
    });
  };
  return (
    <div className="relative aspect-[6/2] bg-gray-100 rounded-t-xl overflow-hidden">
      {selectedImage ? (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-3xl w-full">
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={6 / 2}>
              <img ref={imgRef} src={selectedImage} className="w-full" />
            </ReactCrop>
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setSelectedImage(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCrop} className="btn-primary">
                Save Crop
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {banner && (
            <img src={banner} className="w-full h-full object-cover" />
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
          >
            <span className="text-white">Change Banner</span>
          </button>
        </>
      )}
    </div>
  );
};
