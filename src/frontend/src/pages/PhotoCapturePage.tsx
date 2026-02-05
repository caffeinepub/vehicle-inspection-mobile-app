import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Camera, MapPin, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAddPhotoToDetailedInspection } from '../hooks/useQueries';
import type { PhotoMetadata } from '../backend';
import { useCamera } from '../camera/useCamera';

interface PhotoCapturePageProps {
  inspectionId: bigint | null;
  onNavigate: (page: 'dashboard' | 'pre-inspection-form' | 'remarks') => void;
}

interface CapturedPhoto {
  dataUrl: string;
  gpsCoordinates: string;
  timestamp: number;
  watermarkText: string;
}

export default function PhotoCapturePage({ inspectionId, onNavigate }: PhotoCapturePageProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const addPhoto = useAddPhotoToDetailedInspection();

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto: capturePhotoFromCamera,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    width: 1920,
    height: 1080,
    quality: 0.9,
    format: 'image/jpeg',
  });

  useEffect(() => {
    if (!inspectionId) {
      toast.error('No inspection ID found');
      onNavigate('dashboard');
    }
  }, [inspectionId, onNavigate]);

  useEffect(() => {
    return () => {
      if (isActive) {
        stopCamera();
      }
    };
  }, [isActive, stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) {
      setIsVideoReady(false);
      return;
    }

    const checkVideoReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
        setIsVideoReady(true);
      }
    };

    const handleLoadedMetadata = () => {
      checkVideoReady();
    };

    const handleCanPlay = () => {
      checkVideoReady();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);

    checkVideoReady();

    const pollInterval = setInterval(checkVideoReady, 200);
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (!isVideoReady && isActive) {
        toast.error('Camera preview not ready. Please try restarting the camera.');
      }
    }, 5000);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [isActive, videoRef, isVideoReady]);

  const requestLocationPermission = async (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        setLocationPermission('denied');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          resolve(position);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
          toast.error('Location access denied. Photos will be captured without GPS data.');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleStartCamera = async () => {
    setIsVideoReady(false);
    const success = await startCamera();
    if (!success) {
      toast.error('Failed to start camera. Please check permissions and try again.');
    }
  };

  const handleStopCamera = async () => {
    setIsVideoReady(false);
    await stopCamera();
  };

  const handleRetry = async () => {
    setIsVideoReady(false);
    const success = await retry();
    if (!success) {
      toast.error('Failed to restart camera. Please check permissions and try again.');
    }
  };

  const handleCapturePhoto = async () => {
    if (!isActive || !isVideoReady) {
      toast.error('Camera is not ready. Please wait or restart the camera.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Camera preview is not ready. Please wait a moment and try again.');
      return;
    }

    const position = await requestLocationPermission();
    const now = Date.now();
    const dateStr = new Date(now).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    let gpsCoordinates = 'GPS unavailable';
    if (position) {
      gpsCoordinates = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
    }

    const photoFile = await capturePhotoFromCamera();
    if (!photoFile) {
      toast.error('Failed to capture photo. Please try again.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const watermarkText = `${dateStr} | ${gpsCoordinates}`;
      const fontSize = Math.max(canvas.width / 40, 16);
      context.font = `bold ${fontSize}px Arial`;
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(10, canvas.height - fontSize - 20, canvas.width - 20, fontSize + 15);
      context.fillStyle = 'white';
      context.fillText(watermarkText, 20, canvas.height - 15);

      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const newPhoto: CapturedPhoto = {
        dataUrl: watermarkedDataUrl,
        gpsCoordinates,
        timestamp: now,
        watermarkText,
      };

      setPhotos((prev) => [...prev, newPhoto]);
      toast.success('Photo captured successfully!');
    };

    reader.readAsDataURL(photoFile);
  };

  const deletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    toast.success('Photo deleted');
  };

  const handleNext = async () => {
    if (photos.length === 0) {
      toast.error('Please capture at least one photo');
      return;
    }

    if (!inspectionId) {
      toast.error('No inspection ID found');
      return;
    }

    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const photoMetadata: PhotoMetadata = {
          filePath: `photo_${inspectionId}_${i}_${photo.timestamp}.jpg`,
          gpsCoordinates: photo.gpsCoordinates,
          timestamp: BigInt(photo.timestamp),
          watermarkText: photo.watermarkText,
        };
        await addPhoto.mutateAsync({ inspectionId, photo: photoMetadata });
      }

      localStorage.setItem(`inspection_${inspectionId}_photos`, JSON.stringify(photos));

      toast.success('Photos saved successfully!');
      await handleStopCamera();
      onNavigate('remarks');
    } catch (error: any) {
      console.error('Error saving photos:', error);
      toast.error('Failed to save photos. Please try again.');
    }
  };

  const getCameraStatus = () => {
    if (isSupported === false) return 'unsupported';
    if (error) return 'error';
    if (isLoading) return 'loading';
    if (isActive && !isVideoReady) return 'initializing';
    if (isActive && isVideoReady) return 'ready';
    return 'idle';
  };

  const cameraStatus = getCameraStatus();

  const getErrorMessage = () => {
    if (!error) return null;
    switch (error.type) {
      case 'permission':
        return 'Camera permission denied. Please allow camera access in your browser settings and click "Try Again" below.';
      case 'not-found':
        return 'No camera found on your device. Please connect a camera and click "Try Again" below.';
      case 'not-supported':
        return 'Camera is not supported in this browser. Please try using Chrome, Firefox, or Safari.';
      case 'unknown':
      default:
        return `Camera error: ${error.message}. Please click "Try Again" below.`;
    }
  };

  if (isSupported === false) {
    return (
      <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container max-w-4xl mx-auto p-4 py-8 space-y-6">
          <Button variant="ghost" onClick={() => onNavigate('pre-inspection-form')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Camera Not Supported</h3>
              <p className="text-muted-foreground mb-4">
                Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari to capture inspection photos.
              </p>
              <Button onClick={() => onNavigate('pre-inspection-form')} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-4xl mx-auto p-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('pre-inspection-form')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Photo Capture</CardTitle>
            <CardDescription>
              Capture inspection photos with GPS coordinates and timestamp watermarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium mb-3">{getErrorMessage()}</p>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!isActive && !error ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Click the button below to start your device camera and begin capturing inspection photos
                  </p>
                  <Button onClick={handleStartCamera} size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting Camera...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : isActive ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px', aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="destructive" size="icon" onClick={handleStopCamera} disabled={isLoading}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  {locationPermission === 'granted' && (
                    <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      GPS Active
                    </div>
                  )}
                  {cameraStatus === 'initializing' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-background/90 rounded-lg p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm font-medium">Initializing camera preview...</span>
                      </div>
                    </div>
                  )}
                  {cameraStatus === 'ready' && (
                    <div className="absolute bottom-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Camera Ready
                    </div>
                  )}
                </div>

                {cameraStatus === 'initializing' && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Waiting for camera to be ready. This may take a few seconds...
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCapturePhoto}
                  size="lg"
                  className="w-full"
                  disabled={!isVideoReady || isLoading || cameraStatus !== 'ready'}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            ) : null}

            <canvas ref={canvasRef} className="hidden" />

            {photos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Captured Photos ({photos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.dataUrl}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deletePhoto(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                onClick={handleNext}
                disabled={photos.length === 0 || addPhoto.isPending}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {addPhoto.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Add Remarks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
