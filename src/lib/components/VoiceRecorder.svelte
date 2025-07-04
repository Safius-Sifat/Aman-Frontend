<script>
  import { createEventDispatcher } from "svelte";
  import {
    Mic,
    CheckCircle,
    Square,
    Play,
    RotateCcw,
    Check,
    AlertCircle,
  } from "lucide-svelte";

  const dispatch = createEventDispatcher();

  export let script = "";
  export let language = "en";

  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  let recordedAudio = null;
  let audioUrl = null;
  let recordingTime = 0;
  let recordingInterval;
  let error = "";
  let audioSupported = false;

  const translations = {
    en: {
      readScript: "Please read the following script aloud:",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      playRecording: "Play Recording",
      retakeRecording: "Retake Recording",
      useRecording: "Use This Recording",
      recordingTime: "Recording Time",
      noMicrophone: "Microphone not supported on this device",
      microphoneError: "Unable to access microphone. Please check permissions.",
      readyToRecord: "Ready to record your voice",
      recording: "Recording...",
      recordingComplete: "Recording complete",
    },
    es: {
      readScript: "Por favor lea el siguiente guión en voz alta:",
      startRecording: "Iniciar Grabación",
      stopRecording: "Detener Grabación",
      playRecording: "Reproducir Grabación",
      retakeRecording: "Volver a Grabar",
      useRecording: "Usar Esta Grabación",
      recordingTime: "Tiempo de Grabación",
      noMicrophone: "Micrófono no compatible con este dispositivo",
      microphoneError:
        "No se puede acceder al micrófono. Verifique los permisos.",
      readyToRecord: "Listo para grabar tu voz",
      recording: "Grabando...",
      recordingComplete: "Grabación completa",
    },
    ar: {
      readScript: "يرجى قراءة النص التالي بصوت عالٍ:",
      startRecording: "بدء التسجيل",
      stopRecording: "إيقاف التسجيل",
      playRecording: "تشغيل التسجيل",
      retakeRecording: "إعادة التسجيل",
      useRecording: "استخدام هذا التسجيل",
      recordingTime: "وقت التسجيل",
      noMicrophone: "الميكروفون غير مدعوم على هذا الجهاز",
      microphoneError: "تعذر الوصول إلى الميكروفون. يرجى التحقق من الأذونات.",
      readyToRecord: "جاهز لتسجيل صوتك",
      recording: "جاري التسجيل...",
      recordingComplete: "اكتمل التسجيل",
    },
  };

  $: t = translations[language] || translations.en;
  $: isRtl = language === "ar";

  $: if (typeof window !== "undefined") {
    audioSupported = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  async function startRecording() {
    try {
      if (!audioSupported) {
        error = t.noMicrophone;
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        recordedAudio = audioBlob;
        audioUrl = URL.createObjectURL(audioBlob);

        // Stop all tracks to free up the microphone
        stream.getTracks().forEach((track) => track.stop());

        dispatch("recording-complete", {
          audio: audioBlob,
          audioUrl: audioUrl,
          duration: recordingTime,
        });
      };

      mediaRecorder.start();
      isRecording = true;
      recordingTime = 0;
      error = "";

      recordingInterval = setInterval(() => {
        recordingTime++;
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      error = t.microphoneError;
      isRecording = false;
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      clearInterval(recordingInterval);
    }
  }

  function playRecording() {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.error("Playback error:", err);
        error = "Failed to play recording";
      });
    }
  }

  function retakeRecording() {
    recordedAudio = null;
    audioUrl = null;
    recordingTime = 0;
    error = "";
    audioChunks = [];
  }

  function useRecording() {
    if (recordedAudio) {
      dispatch("recording-accepted", {
        audio: recordedAudio,
        audioUrl: audioUrl,
        duration: recordingTime,
      });
    }
  }
</script>

<div class="voice-recorder" dir={isRtl ? "rtl" : "ltr"}>
  <!-- Script Display -->
  {#if script}
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">{t.readScript}</h3>
      <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-gray-800 leading-relaxed text-sm md:text-base">
          {script}
        </p>
      </div>
    </div>
  {/if}

  <!-- Recording Interface -->
  <div class="bg-white rounded-xl shadow-lg p-6">
    <!-- Recording Status -->
    <div class="text-center mb-6">
      <div
        class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        {#if isRecording}
          <div class="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
        {:else if recordedAudio}
          <CheckCircle size={32} strokeWidth={2} class="text-green-600" />
        {:else}
          <Mic size={32} strokeWidth={2} class="text-gray-600" />
        {/if}
      </div>

      <p class="text-gray-600">
        {#if isRecording}
          {t.recording} {formatTime(recordingTime)}
        {:else if recordedAudio}
          {t.recordingComplete}
        {:else}
          {t.readyToRecord}
        {/if}
      </p>
    </div>

    <!-- Recording Controls -->
    <div class="flex flex-wrap gap-4 justify-center">
      {#if !recordedAudio}
        {#if !isRecording}
          {#if audioSupported}
            <button on:click={startRecording} class="btn-primary">
              <Mic size={16} strokeWidth={2} class="mr-2" />
              {t.startRecording}
            </button>
          {:else}
            <div class="text-center">
              <p class="text-gray-500">{t.noMicrophone}</p>
            </div>
          {/if}
        {:else}
          <button on:click={stopRecording} class="btn-outline">
            <Square size={16} strokeWidth={2} class="mr-2" />
            {t.stopRecording}
          </button>
          <div class="flex items-center text-red-600">
            <div
              class="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"
            ></div>
            <span class="font-mono">{formatTime(recordingTime)}</span>
          </div>
        {/if}
      {:else}
        <!-- Playback Controls -->
        <button on:click={playRecording} class="btn-outline">
          <Play size={16} strokeWidth={2} class="mr-2" />
          {t.playRecording}
        </button>
        <button on:click={retakeRecording} class="btn-outline">
          <RotateCcw size={16} strokeWidth={2} class="mr-2" />
          {t.retakeRecording}
        </button>
        <button on:click={useRecording} class="btn-primary">
          <Check size={16} strokeWidth={2} class="mr-2" />
          {t.useRecording}
        </button>
      {/if}
    </div>

    <!-- Recording Time Display -->
    {#if recordedAudio && recordingTime > 0}
      <div class="mt-4 text-center">
        <span class="text-sm text-gray-500"
          >{t.recordingTime}: {formatTime(recordingTime)}</span
        >
      </div>
    {/if}
  </div>

  <!-- Error Display -->
  {#if error}
    <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <AlertCircle size={20} strokeWidth={2} class="text-red-600 mr-2" />
        <p class="text-red-800">{error}</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .voice-recorder {
    max-width: 100%;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
