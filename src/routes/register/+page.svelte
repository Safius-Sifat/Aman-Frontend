<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { language } from "../../lib/stores/language.js";
  import { user } from "../../lib/stores/user.js";
  import LanguageSelector from "../../lib/components/LanguageSelector.svelte";
  import VoiceRecorder from "../../lib/components/VoiceRecorder.svelte";
  import BackgroundInfoForm from "../../lib/components/BackgroundInfoForm.svelte";
  import ProgressSlider from "../../lib/components/ProgressSlider.svelte";
  import GoogleAuthButton from "../../lib/components/GoogleAuthButton.svelte";

  // Import lucide-svelte icons
  import {
    Users,
    Camera,
    Video,
    Image,
    Check,
    RotateCcw,
    X,
    Heart,
    Loader2,
  } from "lucide-svelte";

  let mounted = false;
  let currentStep = "biometric"; // 'biometric', 'connections', 'matching', 'complete'

  // Form data for missing variables
  let personalInfo = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    languages: [],
    familyMembers: [],
  };

  let additionalInfo = {
    lastKnownLocation: "",
    separationDate: "",
    separationCircumstances: "",
    contactInformation: "",
    additionalNotes: "",
  };

  let loading = false;
  let error = "";
  const totalSteps = 4;

  // Camera functionality
  let videoElement: HTMLVideoElement; // Binds to the <video> element
  let canvasElement: HTMLCanvasElement; // Binds to the <canvas> element
  let stream: MediaStream | null = null; // Stores the MediaStream object
  let capturedImage: string | null = null; // Stores the captured image as a Data URL
  let cameraActive = false;
  let voiceRecording = null;
  let voiceRecordingUrl = null;
  let backgroundInfo = "";
  let isListening = false;
  let speechRecognition = null;
  let speechSupported = false;
  let infoError = "";

  // Generalized, easy-to-read short story for all users to read aloud
  const voiceScript = {
    en: "Once upon a time, a family lived happily together in a small village. They shared meals, laughter, and stories every day. One day, a storm separated them, but they never lost hope. Each family member remembered the love and kindness they shared, believing they would be reunited again.",
    es: "Había una vez una familia que vivía felizmente junta en un pequeño pueblo. Compartían comidas, risas e historias todos los días. Un día, una tormenta los separó, pero nunca perdieron la esperanza. Cada miembro de la familia recordaba el amor y la bondad que compartían, creyendo que volverían a reunirse.",
    ar: "كان يا ما كان، عاشت عائلة بسعادة معًا في قرية صغيرة. كانوا يتشاركون الطعام والضحك والقصص كل يوم. في يوم من الأيام، فرقتهم عاصفة، لكنهم لم يفقدوا الأمل أبدًا. تذكر كل فرد من العائلة الحب واللطف الذي جمعهم، مؤمنين بأنهم سيلتقون من جديد.",
  };

  const translations = {
    en: {
      title: "Registration Process",
      next: "Next",
      previous: "Previous",
      complete: "Complete Setup",
      backToHome: "Back to Home",
      processing: "Processing...",
      submit: "Submit Registration",
      stepLabels: ["Photo", "Voice", "Info", "Complete"],
      firstName: "First Name",
      lastName: "Last Name",
      dateOfBirth: "Date of Birth",
      placeOfBirth: "Place of Birth",
      nationality: "Nationality",
      languages: "Languages Spoken",
      familyMembers: "Family Members",
      addFamilyMember: "Add Family Member",
      memberName: "Member Name",
      relationship: "Relationship",
      lastKnownLocation: "Last Known Location",
      separationDate: "Date of Separation",
      separationCircumstances: "Circumstances of Separation",
      contactInformation: "Contact Information",
      additionalNotes: "Additional Notes",
      steps: {
        biometric: {
          title: "Take Your Photo",
          subtitle: "Capture your photo for identity verification",
          description:
            "We need a clear photo of your face to help create your profile and assist with family matching.",
          action: "Capture Photo",
          openCamera: "Open Camera",
          selectFromGallery: "Select from Gallery",
          retake: "Retake Photo",
          usePhoto: "Use This Photo",
        },
        connections: {
          title: "Voice Recording",
          subtitle: "Record your voice message",
          description:
            "Please read the provided script aloud. This voice recording will help us create your unique voice profile for family matching.",
          action: "Record Voice",
        },
        matching: {
          title: "Background Information",
          subtitle: "Tell us about yourself",
          description:
            "Please provide detailed background information about yourself. This will help us better understand your situation and assist with family matching.",
        },
      },
    },
    es: {
      title: "Proceso de Registro",
      next: "Siguiente",
      previous: "Anterior",
      complete: "Completar Configuración",
      backToHome: "Volver a Inicio",
      processing: "Procesando...",
      submit: "Enviar Registro",
      stepLabels: ["Foto", "Voz", "Info", "Completo"],
      firstName: "Nombre",
      lastName: "Apellido",
      dateOfBirth: "Fecha de Nacimiento",
      placeOfBirth: "Lugar de Nacimiento",
      nationality: "Nacionalidad",
      languages: "Idiomas Hablados",
      familyMembers: "Miembros de la Familia",
      addFamilyMember: "Agregar Miembro de la Familia",
      memberName: "Nombre del Miembro",
      relationship: "Relación",
      lastKnownLocation: "Última Ubicación Conocida",
      separationDate: "Fecha de Separación",
      separationCircumstances: "Circunstancias de la Separación",
      contactInformation: "Información de Contacto",
      additionalNotes: "Notas Adicionales",
      steps: {
        biometric: {
          title: "Toma tu Foto",
          subtitle: "Captura tu foto para verificación de identidad",
          description:
            "Necesitamos una foto clara de tu rostro para ayudar a crear tu perfil y asistir con el emparejamiento familiar.",
          action: "Capturar Foto",
          openCamera: "Abrir Cámara",
          selectFromGallery: "Seleccionar de Galería",
          retake: "Volver a Tomar",
          usePhoto: "Usar Esta Foto",
        },
        connections: {
          title: "Grabación de Voz",
          subtitle: "Graba tu mensaje de voz",
          description:
            "Por favor lee el guión proporcionado en voz alta. Esta grabación de voz nos ayudará a crear tu perfil de voz único para el emparejamiento familiar.",
          action: "Grabar Voz",
        },
        matching: {
          title: "Información de Antecedentes",
          subtitle: "Cuéntanos sobre ti",
          description:
            "Por favor proporciona información detallada sobre tus antecedentes. Esto nos ayudará a entender mejor tu situación y asistir con el emparejamiento familiar.",
        },
      },
    },
    ar: {
      title: "عملية التسجيل",
      next: "التالي",
      previous: "السابق",
      complete: "إكمال الإعداد",
      backToHome: "العودة إلى الرئيسية",
      processing: "جاري المعالجة...",
      submit: "إرسال التسجيل",
      stepLabels: ["صورة", "صوت", "معلومات", "مكتمل"],
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      dateOfBirth: "تاريخ الميلاد",
      placeOfBirth: "مكان الميلاد",
      nationality: "الجنسية",
      languages: "اللغات المتحدثة",
      familyMembers: "أفراد العائلة",
      addFamilyMember: "إضافة فرد من العائلة",
      memberName: "اسم الفرد",
      relationship: "العلاقة",
      lastKnownLocation: "آخر موقع معروف",
      separationDate: "تاريخ الانفصال",
      separationCircumstances: "ظروف الانفصال",
      contactInformation: "معلومات الاتصال",
      additionalNotes: "ملاحظات إضافية",
      steps: {
        biometric: {
          title: "التقط صورتك",
          subtitle: "التقط صورتك للتحقق من الهوية",
          description:
            "نحتاج إلى صورة واضحة لوجهك لمساعدتنا في إنشاء ملفك الشخصي والمساعدة في مطابقة العائلة.",
          action: "التقاط الصورة",
          openCamera: "فتح الكاميرا",
          selectFromGallery: "اختيار من المعرض",
          retake: "إعادة التصوير",
          usePhoto: "استخدام هذه الصورة",
        },
        connections: {
          title: "تسجيل الصوت",
          subtitle: "سجل رسالتك الصوتية",
          description:
            "يرجى قراءة النص المقدم بصوت عالٍ. سيساعدنا هذا التسجيل الصوتي في إنشاء ملفك الصوتي الفريد لمطابقة العائلة.",
          action: "تسجيل الصوت",
        },
        matching: {
          title: "معلومات الخلفية",
          subtitle: "أخبرنا عن نفسك",
          description:
            "يرجى تقديم معلومات مفصلة عن خلفيتك. سيساعدنا هذا في فهم وضعك بشكل أفضل والمساعدة في مطابقة العائلة.",
        },
      },
    },
  };

  $: t = translations[$language] || translations.en;
  $: isRtl = $language === "ar";
  $: currentStepNumber =
    currentStep === "biometric"
      ? 1
      : currentStep === "connections"
        ? 2
        : currentStep === "matching"
          ? 3
          : 4;

  onMount(() => {
    mounted = true;
    if ($user) {
      goto("/dashboard");
    }

    // Check for speech recognition support
    if (typeof window !== "undefined") {
      speechSupported =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    }
  });

  async function nextStep() {
    if (currentStep === "biometric") {
      currentStep = "connections";
    } else if (currentStep === "connections") {
      currentStep = "matching";
    } else if (currentStep === "matching") {
      // Verify information before proceeding
      const isValid = await verifyInformation();
      if (isValid) {
        currentStep = "complete";
      }
    } else {
      currentStep = "complete";
    }
  }

  function previousStep() {
    if (currentStep === "connections") {
      currentStep = "biometric";
    } else if (currentStep === "matching") {
      currentStep = "connections";
    } else if (currentStep === "biometric") {
      goto("/");
    }
  }

  function addFamilyMember() {
    personalInfo.familyMembers = [
      ...personalInfo.familyMembers,
      { name: "", relationship: "" },
    ];
  }

  function removeFamilyMember(index) {
    personalInfo.familyMembers = personalInfo.familyMembers.filter(
      (_, i) => i !== index,
    );
  }

  function addLanguage() {
    personalInfo.languages = [...personalInfo.languages, ""];
  }

  function removeLanguage(index) {
    personalInfo.languages = personalInfo.languages.filter(
      (_, i) => i !== index,
    );
  }

  async function submitRegistration() {
    loading = true;
    error = "";

    try {
      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 2000));
      user.set({ name: "New User", email: "user@example.com" });
      goto("/dashboard");
    } catch (err) {
      error = "Registration failed. Please try again.";
    } finally {
      loading = false;
    }
  }

  function completeRegistration() {
    // Prepare registration data for authentication
    const registrationData = {
      capturedImage,
      voiceRecording,
      voiceRecordingUrl,
      backgroundInfo,
      personalInfo,
      additionalInfo,
    };

    // This will be handled by the GoogleAuthButton component
    return registrationData;
  }

  function handleAuthSuccess(event) {
    console.log("Authentication successful:", event.detail);
    // The redirect will be handled by Supabase
  }

  function handleAuthError(event) {
    error = event.detail.error;
    console.error("Authentication error:", event.detail.error);
  }

  async function openCamera() {
    try {
      // Request camera permission first
      const permissions = await navigator.permissions?.query?.({
        name: "camera",
      });
      if (permissions && permissions.state === "denied") {
        error =
          "Camera access denied. Please allow camera permissions in your browser settings.";
        cameraActive = false;
        return;
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      // Only set srcObject if videoElement is attached to DOM
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };
        cameraActive = true;
        error = "";
      }
    } catch (err) {
      error = "Unable to access camera. Please check permissions.";
      cameraActive = false;
      console.error("Camera error:", err);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
      cameraActive = false;
      if (videoElement) {
        videoElement.srcObject = null; // Disconnect the video element
      }
    }
  }

  function capturePhoto() {
    if (!videoElement || !canvasElement) return;

    const context = canvasElement.getContext("2d");
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0);
    capturedImage = canvasElement.toDataURL("image/jpeg", 0.8);
    stopCamera();
  }

  function selectFromGallery() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files && target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          capturedImage = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  function retakePhoto() {
    capturedImage = null;
    openCamera();
  }

  function usePhoto() {
    if (capturedImage) {
      nextStep();
    }
  }

  function handleVoiceRecordingComplete(event) {
    // Handle the recording completion
    console.log("Recording completed:", event.detail);
  }

  function handleVoiceRecordingAccepted(event) {
    voiceRecording = event.detail.audio;
    voiceRecordingUrl = event.detail.audioUrl;
    console.log("Voice recording accepted:", event.detail);
  }

  function handleBackgroundInfoChange(event) {
    backgroundInfo = event.detail.text;
    infoError = ""; // Clear error when user types
  }

  function handleListeningChange(event) {
    isListening = event.detail.isListening;
  }

  function handleInfoError(event) {
    infoError = event.detail.message;
  }

  async function verifyInformation() {
    if (!backgroundInfo.trim()) {
      infoError =
        "Please provide some background information before proceeding.";
      return false;
    }

    if (backgroundInfo.trim().length < 50) {
      infoError =
        "Please provide more detailed information (at least 50 characters).";
      return false;
    }

    loading = true;
    infoError = "";

    try {
      // Call Gemini API to verify the information
      const response = await fetch("/api/verify-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backgroundInfo: backgroundInfo.trim(),
          language: $language,
        }),
      });

      const result = await response.json();

      if (response.ok && result.isRelevant) {
        // Information is relevant, proceed to next step
        return true;
      } else {
        // Information is not sufficient or relevant
        infoError =
          result.feedback ||
          "Please provide more detailed and relevant background information. Include details about your family, where you lived, your experiences, and anything that might help identify you.";
        return false;
      }
    } catch (err) {
      console.error("Verification error:", err);
      // Proceed anyway if API fails
      return true;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{t.title} - Aman</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50"
  dir={isRtl ? "rtl" : "ltr"}
>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color: #1A8161;"
            >
              <Users size={20} strokeWidth={2} class="text-white" />
            </div>
          </div>
          <div class="ml-3">
            <h1 class="text-lg font-semibold text-gray-900">ReuniteAI</h1>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <LanguageSelector />
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Progress Slider -->
    <div class="max-w-2xl mx-auto">
      <ProgressSlider
        currentStep={currentStepNumber}
        {totalSteps}
        stepLabels={t.stepLabels}
        language={$language}
      />
    </div>

    {#if currentStep === "biometric"}
      <!-- Camera Step -->
      <div class="max-w-2xl mx-auto">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t.steps.biometric.title}
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            {t.steps.biometric.subtitle}
          </p>
          <p class="text-gray-600 mb-8">
            {t.steps.biometric.description}
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <!-- Camera Preview Area -->
          <div class="relative mb-6">
            <div
              class="w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
            >
              {#if capturedImage}
                <!-- Captured Image Preview -->
                <img
                  src={capturedImage}
                  alt="Captured"
                  class="w-full h-full object-cover"
                />
              {:else if cameraActive}
                <!-- Live Camera Feed -->
                <video
                  bind:this={videoElement}
                  autoplay
                  playsinline
                  class="w-full h-full object-cover"
                >
                  <track kind="captions" label="No captions" />
                </video>
              {:else}
                <!-- Placeholder -->
                <div class="text-center">
                  <Camera
                    size={64}
                    strokeWidth={1.5}
                    class="text-gray-400 mx-auto mb-4"
                  />
                  <p class="text-gray-500">Camera preview will appear here</p>
                </div>
              {/if}
            </div>

            <!-- Hidden canvas for capturing -->
            <canvas bind:this={canvasElement} class="hidden"></canvas>
          </div>

          <!-- Camera Controls -->
          <div class="flex flex-wrap gap-4 justify-center">
            {#if !capturedImage}
              {#if !cameraActive}
                <!-- Initial Controls -->
                <button on:click={openCamera} class="btn-primary">
                  <Video size={20} strokeWidth={2} class="mr-2" />
                  {t.steps.biometric.openCamera}
                </button>
                <button on:click={selectFromGallery} class="btn-outline">
                  <Image size={20} strokeWidth={2} class="mr-2" />
                  {t.steps.biometric.selectFromGallery}
                </button>
              {:else}
                <!-- Capture Control -->
                <button
                  on:click={capturePhoto}
                  class="btn-primary text-lg px-8 py-4"
                >
                  <Camera size={24} strokeWidth={2} class="mr-3" />
                  {t.steps.biometric.action}
                </button>
                <button on:click={stopCamera} class="btn-outline">
                  <X size={20} strokeWidth={2} class="mr-2" />
                  Cancel
                </button>
              {/if}
            {:else}
              <!-- Photo Review Controls -->
              <button on:click={usePhoto} class="btn-primary">
                <Check size={20} strokeWidth={2} class="mr-2" />
                {t.steps.biometric.usePhoto}
              </button>
              <button on:click={retakePhoto} class="btn-outline">
                <RotateCcw size={20} strokeWidth={2} class="mr-2" />
                {t.steps.biometric.retake}
              </button>
              <button on:click={selectFromGallery} class="btn-outline">
                <Image size={20} strokeWidth={2} class="mr-2" />
                {t.steps.biometric.selectFromGallery}
              </button>
            {/if}
          </div>
        </div>

        <div class="flex justify-between">
          <button on:click={previousStep} class="btn-outline">
            {t.backToHome}
          </button>
          <button on:click={nextStep} class="btn-primary">
            {t.next}
          </button>
        </div>
      </div>
    {/if}

    {#if currentStep === "connections"}
      <!-- Voice Recording Step -->
      <div class="max-w-2xl mx-auto">
        <div class="mb-8 text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t.steps.connections.title}
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            {t.steps.connections.subtitle}
          </p>
          <p class="text-gray-600 mb-8">
            {t.steps.connections.description}
          </p>
        </div>

        <VoiceRecorder
          script={voiceScript[$language] || voiceScript.en}
          language={$language}
          on:recording-complete={handleVoiceRecordingComplete}
          on:recording-accepted={handleVoiceRecordingAccepted}
        />

        <div class="flex justify-between mt-8">
          <button on:click={previousStep} class="btn-outline">
            {t.previous}
          </button>
          <button on:click={nextStep} class="btn-primary">
            {t.next}
          </button>
        </div>
      </div>
    {/if}

    {#if currentStep === "matching"}
      <!-- Background Information Step -->
      <div class="max-w-2xl mx-auto">
        <div class="mb-8 text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t.steps.matching.title}
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            {t.steps.matching.subtitle}
          </p>
          <p class="text-gray-600 mb-6">
            {t.steps.matching.description}
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <BackgroundInfoForm
            bind:backgroundInfo
            language={$language}
            bind:isListening
            bind:speechSupported
            error={infoError}
            on:text-changed={handleBackgroundInfoChange}
            on:listening-changed={handleListeningChange}
            on:error={handleInfoError}
          />
        </div>

        <div class="flex justify-between">
          <button on:click={previousStep} class="btn-outline">
            {t.previous}
          </button>
          <button
            on:click={nextStep}
            class="btn-primary"
            disabled={loading || !backgroundInfo.trim()}
          >
            {#if loading}
              <Loader2 size={20} strokeWidth={2} class="mr-2 animate-spin" />
              Verifying...
            {:else}
              {t.next}
            {/if}
          </button>
        </div>
      </div>
    {/if}

    {#if currentStep === "complete"}
      <!-- Completion Step -->
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Setup Complete!
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            Your profile has been created and our AI is now searching for
            matches.
          </p>
          <p class="text-gray-600 mb-8">
            Sign in to securely save your registration and access your
            dashboard.
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div
            class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Heart size={48} strokeWidth={1.5} class="text-green-600" />
          </div>

          <GoogleAuthButton
            language={$language}
            registrationData={completeRegistration()}
            on:auth-success={handleAuthSuccess}
            on:auth-error={handleAuthError}
          />
        </div>
      </div>
    {/if}

    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <p class="text-red-800">{error}</p>
      </div>
    {/if}
  </main>
</div>

<style>
  :global(.btn-primary) {
    background-color: #1a8161;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    border: 2px solid #1a8161;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(26, 129, 97, 0.2);
  }

  :global(.btn-primary:hover) {
    background-color: #156b54;
    border-color: #156b54;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(26, 129, 97, 0.3);
  }

  :global(.btn-primary:active) {
    transform: translateY(0);
    box-shadow: 0 4px 6px -1px rgba(26, 129, 97, 0.2);
  }

  :global(.btn-primary:disabled) {
    background-color: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  :global(.btn-outline) {
    background-color: transparent;
    color: #1a8161;
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    border: 2px solid #1a8161;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.btn-outline:hover) {
    background-color: #1a8161;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(26, 129, 97, 0.3);
  }

  :global(.btn-outline:active) {
    transform: translateY(0);
    box-shadow: 0 4px 6px -1px rgba(26, 129, 97, 0.2);
  }
</style>
