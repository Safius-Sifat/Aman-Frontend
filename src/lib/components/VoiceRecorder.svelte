<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { extractVoiceFeatures } from '$lib/services/biometrics.js';
  
  const dispatch = createEventDispatcher();
  
  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  let isPaused = false;
  let recordingTime = 0;
  let recordingTimer;
  let audioBlob = null;
  let audioUrl = null;
  let error = '';
  let isProcessing = false;
  
  const MAX_RECORDING_TIME = 60; // 60 seconds
  const MIN_RECORDING_TIME = 5; // 5 seconds
  
  onMount(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  });
  
  async function startRecording() {
    try {
      error = '';
      audioChunks = [];
      recordingTime = 0;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        audioBlob = blob;
        audioUrl = URL.createObjectURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process audio if minimum time met
        if (recordingTime >= MIN_RECORDING_TIME) {
          await processAudio(blob);
        }
      };
      
      mediaRecorder.start();
      isRecording = true;
      
      // Start timer
      recordingTimer = setInterval(() => {
        recordingTime++;
        if (recordingTime >= MAX_RECORDING_TIME) {
          stopRecording();
        }
      }, 1000);
      
    } catch (err) {
      error = 'Microphone access denied or not available';
      console.error('Recording error:', err);
    }
  }
  
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      isPaused = false;
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      
      if (recordingTime < MIN_RECORDING_TIME) {
        error = `Recording too short. Minimum ${MIN_RECORDING_TIME} seconds required.`;
        resetRecording();
      }
    }
  }
  
  function pauseRecording() {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        isPaused = false;
      } else {
        mediaRecorder.pause();
        isPaused = true;
      }
    }
  }
  
  function resetRecording() {
    if (recordingTimer) {
      clearInterval(recordingTimer);
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
    
    audioBlob = null;
    audioChunks = [];
    isRecording = false;
    isPaused = false;
    recordingTime = 0;
    error = '';
  }
  
  async function processAudio(blob) {
    try {
      isProcessing = true;
      error = '';
      
      const features = await extractVoiceFeatures(blob);
      
      dispatch('capture', {
        recording: blob,
        features: features
      });
      
    } catch (err) {
      error = 'Failed to process audio recording';
      console.error('Audio processing error:', err);
    } finally {
      isProcessing = false;
    }
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

<div class="voice-recorder">
  {#if !isRecording && !audioBlob}
    <div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="mic" class="w-8 h-8 text-gray-400"></i>
      </div>
      <p class="text-gray-600 mb-4">
        Click to start recording your voice<br>
        <span class="text-sm">Minimum {MIN_RECORDING_TIME} seconds, maximum {MAX_RECORDING_TIME} seconds</span>
      </p>
      <button 
        on:click={startRecording}
        class="btn-primary"
        disabled={isProcessing}
      >
        <i data-lucide="mic" class="w-4 h-4 mr-2"></i>
        Start Recording
      </button>
    </div>
  {/if}
  
  {#if isRecording}
    <div class="text-center">
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 {isPaused ? 'opacity-50' : 'animate-pulse'}">
          <i data-lucide="mic" class="w-12 h-12 text-white"></i>
        </div>
        
        <div class="text-2xl font-mono text-gray-900 mb-2">
          {formatTime(recordingTime)}
        </div>
        
        <div class="text-sm text-gray-600">
          {isPaused ? 'Recording paused' : 'Recording in progress...'}
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            class="bg-red-500 h-2 rounded-full transition-all duration-1000"
            style="width: {(recordingTime / MAX_RECORDING_TIME) * 100}%"
          ></div>
        </div>
      </div>
      
      <div class="flex justify-center space-x-3">
        <button 
          on:click={pauseRecording}
          class="btn-outline"
        >
          <i data-lucide="{isPaused ? 'play' : 'pause'}" class="w-4 h-4 mr-2"></i>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        
        <button 
          on:click={stopRecording}
          class="btn-primary"
          disabled={recordingTime < MIN_RECORDING_TIME}
        >
          <i data-lucide="square" class="w-4 h-4 mr-2"></i>
          Stop Recording
        </button>
      </div>
      
      {#if recordingTime < MIN_RECORDING_TIME}
        <p class="text-amber-600 text-sm mt-2">
          Keep recording for at least {MIN_RECORDING_TIME - recordingTime} more seconds
        </p>
      {/if}
    </div>
  {/if}
  
  {#if audioBlob}
    <div class="text-center">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
        <div class="flex items-center justify-center mb-4">
          <i data-lucide="volume-2" class="w-8 h-8 text-gray-400"></i>
        </div>
        
        <audio 
          controls 
          src={audioUrl}
          class="w-full mb-4"
        ></audio>
        
        <div class="text-sm text-gray-600">
          Recording length: {formatTime(recordingTime)}
        </div>
      </div>
      
      <div class="flex justify-center space-x-3">
        <button 
          on:click={resetRecording}
          class="btn-outline"
          disabled={isProcessing}
        >
          <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
          Record Again
        </button>
        
        <div class="flex items-center text-emerald-600">
          {#if isProcessing}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
            <span class="text-sm font-medium">Processing...</span>
          {:else}
            <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i>
            <span class="text-sm font-medium">Recording Complete</span>
          {/if}
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
</div>

<script>
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
</script>
