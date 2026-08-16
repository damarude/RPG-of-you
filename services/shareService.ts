
import html2canvas from 'html2canvas';

export const generateAndShare = async (
  element: HTMLElement, 
  fileName: string, 
  title: string, 
  text: string
): Promise<boolean> => {
  try {
    // 1. Generate Canvas from DOM element
    const canvas = await html2canvas(element, {
      backgroundColor: '#020617', // Match app background
      scale: 2, // High resolution (Retina)
      useCORS: true, // Critical for loading external avatars/images
      logging: false, // Cleaner console
      allowTaint: true, // Attempt to capture even if some CORS headers are missing (though toBlob might fail if tainted)
    });

    // 2. Convert Canvas to Blob
    const blob = await new Promise<Blob | null>(resolve => 
      canvas.toBlob(resolve, 'image/png', 1.0)
    );

    if (!blob) throw new Error("Failed to generate image blob");

    // 3. Prepare File for Sharing
    const file = new File([blob], fileName, { type: 'image/png' });
    const shareData = { files: [file], title, text };

    // 4. Attempt Native Share (Mobile/Android APK preference)
    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return true; // Success
      } catch (err) {
        // If user cancels (AbortError), we consider it handled. 
        // If it's another error, we fall through to download.
        if ((err as Error).name === 'AbortError') return true;
        console.warn("Native share failed, attempting download fallback...", err);
      }
    }

    // 5. Fallback: Direct Download (Desktop / WebViews without Share API)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;

  } catch (error) {
    console.error("Share generation error:", error);
    return false;
  }
};
