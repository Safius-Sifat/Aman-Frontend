<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { extractFaceFeatures } from "$lib/services/biometrics.js";

  const dispatch = createEventDispatcher();

  let videoElement;
  let canvasElement;
  let stream;
  let isCapturing = false;
  let capturedPhoto = null;
  let error = "";
  let isProcessing = false;

  onMount(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  });

  async function startCamera() {
    try {
      error = "";
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      if (videoElement) {
        videoElement.srcObject = stream;
        isCapturing = true;
      }
    } catch (err) {
      error = "Camera access denied or not available";
      console.error("Camera error:", err);
    }
  }

  async function capturePhoto() {
    if (!videoElement || !canvasElement) return;

    try {
      isProcessing = true;
      error = "";

      const context = canvasElement.getContext("2d");
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(videoElement, 0, 0);

      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvasElement.toBlob(resolve, "image/jpeg", 0.8);
      });

      // Extract face features
      const features = await extractFaceFeatures(blob);

      // Create object URL for preview
      capturedPhoto = URL.createObjectURL(blob);

      // Stop camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        isCapturing = false;
      }

      // Dispatch capture event
      dispatch("capture", {
        photo: blob,
        features: features,
      });
    } catch (err) {
      error = "Failed to capture photo";
      console.error("Capture error:", err);
    } finally {
      isProcessing = false;
    }
  }

  function retakePhoto() {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
      capturedPhoto = null;
    }
    startCamera();
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      isCapturing = false;
    }
  }
</script>

<div class="camera-capture">
  {#if !isCapturing && !capturedPhoto}
    <div
      class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
    >
      <div
        class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <i data-lucide="camera" class="w-8 h-8 text-gray-400"></i>
      </div>
      <p class="text-gray-600 mb-4">Click to start camera and take a selfie</p>
      <button
        on:click={startCamera}
        class="btn-primary"
        disabled={isProcessing}
      >
        <i data-lucide="camera" class="w-4 h-4 mr-2"></i>
        Start Camera
      </button>
    </div>
  {/if}

  {#if isCapturing}
    <div class="relative">
      <video
        bind:this={videoElement}
        autoplay
        playsinline
        class="w-full h-64 bg-black rounded-lg object-cover"
      ></video>

      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="absolute inset-4 border-2 border-blue-500 rounded-lg opacity-50"
        ></div>
        <div
          class="absolute top-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded"
        >
          Position your face within the frame
        </div>
      </div>

      <div class="flex justify-center space-x-3 mt-4">
        <button
          on:click={capturePhoto}
          class="btn-primary"
          disabled={isProcessing}
        >
          {#if isProcessing}
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            Processing...
          {:else}
            <i data-lucide="camera" class="w-4 h-4 mr-2"></i>
            Capture Photo
          {/if}
        </button>

        <button
          on:click={stopCamera}
          class="btn-outline"
          disabled={isProcessing}
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}

  {#if capturedPhoto}
    <div class="text-center">
      <img
        src={capturedPhoto}
        alt="Captured selfie"
        class="w-full h-64 object-cover rounded-lg mb-4"
      />

      <div class="flex justify-center space-x-3">
        <button on:click={retakePhoto} class="btn-outline">
          <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
          Retake Photo
        </button>

        <div class="flex items-center text-emerald-600">
          <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i>
          <span class="text-sm font-medium">Photo Captured</span>
        </div>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="error-message">
      <i data-lucide="alert-circle" class="w-4 h-4 mr-2"></i>
      {error}
    </div>
  {/if}

  <canvas bind:this={canvasElement} class="hidden"></canvas>
</div>
