/**
 * Reads an image file picked by the user, downsizes it to a square thumbnail,
 * and returns a compressed JPEG data URL — small enough to store directly in
 * the database (no file storage bucket needed) while still looking crisp.
 */
export function fileToResizedDataUrl(file: File, maxDimension = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (JPG, PNG, etc).'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image is too large. Please choose a photo under 10MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load that image.'));
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const target = Math.min(maxDimension, size);
        const canvas = document.createElement('canvas');
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Image processing is not supported in this browser.'));
          return;
        }
        ctx.drawImage(img, sx, sy, size, size, 0, 0, target, target);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
