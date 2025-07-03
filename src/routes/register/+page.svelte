<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user.js';
  import { language } from '$lib/stores/language.js';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import CameraCapture from '$lib/components/CameraCapture.svelte';
  import VoiceRecorder from '$lib/components/VoiceRecorder.svelte';
  
  let currentStep = 1;
  const totalSteps = 4;
  let loading = false;
  let error = '';
  
  // Form data
  let personalInfo = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    languages: [],
    familyMembers: []
  };
  
  let biometricData = {
    photo: null,
    voiceRecording: null,
    faceFeatures: null,
    voiceFeatures: null
  };
  
  let additionalInfo = {
    lastKnownLocation: '',
    separationDate: '',
    separationCircumstances: '',
    contactInformation: '',
    additionalNotes: ''
  };
  
  const translations = {
    en: {
      title: 'Registration Process',
      step1: 'Personal Information',
      step2: 'Biometric Data',
      step3: 'Additional Information',
      step4: 'Review & Submit',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit Registration',
      processing: 'Processing...',
      firstName: 'First Name',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      placeOfBirth: 'Place of Birth',
      nationality: 'Nationality',
      languages: 'Languages Spoken',
      familyMembers: 'Family Members',
      addFamilyMember: 'Add Family Member',
      memberName: 'Member Name',
      relationship: 'Relationship',
      lastKnownLocation: 'Last Known Location',
      separationDate: 'Date of Separation',
      separationCircumstances: 'Circumstances of Separation',
      contactInformation: 'Contact Information',
      additionalNotes: 'Additional Notes',
      takeSelfie: 'Take Selfie',
      recordVoice: 'Record Voice',
      readScript: 'Please read the following text aloud:',
      scriptText: 'My name is [Your Name]. I am looking for my family members. I was born in [Place of Birth] on [Date of Birth]. I speak [Languages]. Please help me find my loved ones.',
      confirmData: 'Please review your information before submitting',
      dataProcessing: 'Your data will be processed using AI to find potential family matches.',
      privacyNotice: 'All biometric data is encrypted and stored securely.',
      requiredField: 'This field is required'
    },
    es: {
      title: 'Proceso de Registro',
      step1: 'Información Personal',
      step2: 'Datos Biométricos',
      step3: 'Información Adicional',
      step4: 'Revisar y Enviar',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar Registro',
      processing: 'Procesando...',
      firstName: 'Nombre',
      lastName: 'Apellido',
      dateOfBirth: 'Fecha de Nacimiento',
      placeOfBirth: 'Lugar de Nacimiento',
      nationality: 'Nacionalidad',
      languages: 'Idiomas Hablados',
      familyMembers: 'Miembros de la Familia',
      addFamilyMember: 'Agregar Miembro de la Familia',
      memberName: 'Nombre del Miembro',
      relationship: 'Relación',
      lastKnownLocation: 'Última Ubicación Conocida',
      separationDate: 'Fecha de Separación',
      separationCircumstances: 'Circunstancias de la Separación',
      contactInformation: 'Información de Contacto',
      additionalNotes: 'Notas Adicionales',
      takeSelfie: 'Tomar Selfie',
      recordVoice: 'Grabar Voz',
      readScript: 'Por favor lea el siguiente texto en voz alta:',
      scriptText: 'Mi nombre es [Su Nombre]. Estoy buscando a los miembros de mi familia. Nací en [Lugar de Nacimiento] el [Fecha de Nacimiento]. Hablo [Idiomas]. Por favor ayúdenme a encontrar a mis seres queridos.',
      confirmData: 'Por favor revise su información antes de enviar',
      dataProcessing: 'Sus datos serán procesados usando IA para encontrar posibles coincidencias familiares.',
      privacyNotice: 'Todos los datos biométricos están encriptados y almacenados de forma segura.',
      requiredField: 'Este campo es obligatorio'
    },
    ar: {
      title: 'عملية التسجيل',
      step1: 'المعلومات الشخصية',
      step2: 'البيانات البيومترية',
      step3: 'معلومات إضافية',
      step4: 'مراجعة وإرسال',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال التسجيل',
      processing: 'جاري المعالجة...',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      dateOfBirth: 'تاريخ الميلاد',
      placeOfBirth: 'مكان الميلاد',
      nationality: 'الجنسية',
      languages: 'اللغات المتحدثة',
      familyMembers: 'أفراد العائلة',
      addFamilyMember: 'إضافة فرد من العائلة',
      memberName: 'اسم الفرد',
      relationship: 'العلاقة',
      lastKnownLocation: 'آخر موقع معروف',
      separationDate: 'تاريخ الانفصال',
      separationCircumstances: 'ظروف الانفصال',
      contactInformation: 'معلومات الاتصال',
      additionalNotes: 'ملاحظات إضافية',
      takeSelfie: 'التقاط صورة شخصية',
      recordVoice: 'تسجيل الصوت',
      readScript: 'يرجى قراءة النص التالي بصوت عالٍ:',
      scriptText: 'اسمي [اسمك]. أبحث عن أفراد عائلتي. ولدت في [مكان الميلاد] في [تاريخ الميلاد]. أتحدث [اللغات]. يرجى مساعدتي في العثور على أحبائي.',
      confirmData: 'يرجى مراجعة معلوماتك قبل الإرسال',
      dataProcessing: 'ستتم معالجة بياناتك باستخدام الذكاء الاصطناعي للعثور على تطابقات عائلية محتملة.',
      privacyNotice: 'جميع البيانات البيومترية مشفرة ومخزنة بشكل آمن.',
      requiredField: 'هذا الحقل مطلوب'
    }
  };
  
  $: t = translations[$language] || translations.en;
  $: isRtl = $language === 'ar';
  
  onMount(() => {
    if (!$user) {
      goto('/');
    }
  });
  
  function nextStep() {
    if (validateCurrentStep()) {
      currentStep = Math.min(currentStep + 1, totalSteps);
    }
  }
  
  function previousStep() {
    currentStep = Math.max(currentStep - 1, 1);
  }
  
  function validateCurrentStep() {
    error = '';
    
    switch (currentStep) {
      case 1:
        if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth) {
          error = t.requiredField;
          return false;
        }
        break;
      case 2:
        if (!biometricData.photo || !biometricData.voiceRecording) {
          error = 'Please complete both biometric captures';
          return false;
        }
        break;
      case 3:
        if (!additionalInfo.lastKnownLocation || !additionalInfo.separationDate) {
          error = t.requiredField;
          return false;
        }
        break;
    }
    
    return true;
  }
  
  function addFamilyMember() {
    personalInfo.familyMembers = [...personalInfo.familyMembers, { name: '', relationship: '' }];
  }
  
  function removeFamilyMember(index) {
    personalInfo.familyMembers = personalInfo.familyMembers.filter((_, i) => i !== index);
  }
  
  function addLanguage() {
    personalInfo.languages = [...personalInfo.languages, ''];
  }
  
  function removeLanguage(index) {
    personalInfo.languages = personalInfo.languages.filter((_, i) => i !== index);
  }
  
  function handlePhotoCapture(event) {
    biometricData.photo = event.detail.photo;
    biometricData.faceFeatures = event.detail.features;
  }
  
  function handleVoiceCapture(event) {
    biometricData.voiceRecording = event.detail.recording;
    biometricData.voiceFeatures = event.detail.features;
  }
  
  async function submitRegistration() {
    if (!validateCurrentStep()) {
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const formData = new FormData();
      formData.append('personalInfo', JSON.stringify(personalInfo));
      formData.append('additionalInfo', JSON.stringify(additionalInfo));
      formData.append('photo', biometricData.photo);
      formData.append('voiceRecording', biometricData.voiceRecording);
      formData.append('faceFeatures', JSON.stringify(biometricData.faceFeatures));
      formData.append('voiceFeatures', JSON.stringify(biometricData.voiceFeatures));
      
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        user.set({ ...$user, ...data.user });
        goto('/dashboard');
      } else {
        error = data.error || 'Registration failed';
      }
    } catch (err) {
      error = 'Connection error. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>{t.title} - ReuniteAI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <button 
            on:click={() => goto('/')}
            class="flex items-center text-gray-600 hover:text-gray-900"
          >
            <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
            <span>Back to Home</span>
          </button>
        </div>
        <h1 class="text-lg font-semibold text-gray-900">{t.title}</h1>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Progress Bar -->
    <div class="mb-8">
      <ProgressBar {currentStep} {totalSteps} />
    </div>

    <!-- Step Content -->
    <div class="card">
      {#if currentStep === 1}
        <!-- Personal Information -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{t.step1}</h2>
          <p class="text-gray-600">Please provide your basic personal information</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label for="firstName" class="form-label">{t.firstName} *</label>
            <input 
              id="firstName"
              type="text" 
              bind:value={personalInfo.firstName}
              class="form-input"
              required
            />
          </div>
          
          <div>
            <label for="lastName" class="form-label">{t.lastName} *</label>
            <input 
              id="lastName"
              type="text" 
              bind:value={personalInfo.lastName}
              class="form-input"
              required
            />
          </div>
          
          <div>
            <label for="dateOfBirth" class="form-label">{t.dateOfBirth} *</label>
            <input 
              id="dateOfBirth"
              type="date" 
              bind:value={personalInfo.dateOfBirth}
              class="form-input"
              required
            />
          </div>
          
          <div>
            <label for="placeOfBirth" class="form-label">{t.placeOfBirth}</label>
            <input 
              id="placeOfBirth"
              type="text" 
              bind:value={personalInfo.placeOfBirth}
              class="form-input"
            />
          </div>
          
          <div>
            <label for="nationality" class="form-label">{t.nationality}</label>
            <input 
              id="nationality"
              type="text" 
              bind:value={personalInfo.nationality}
              class="form-input"
            />
          </div>
        </div>
        
        <!-- Languages -->
        <div class="mt-6">
          <label class="form-label">{t.languages}</label>
          {#each personalInfo.languages as language, index}
            <div class="flex gap-2 mb-2">
              <input 
                type="text" 
                bind:value={personalInfo.languages[index]}
                class="form-input"
                placeholder="Language"
              />
              <button 
                type="button"
                on:click={() => removeLanguage(index)}
                class="px-3 py-2 text-red-600 hover:text-red-700"
              >
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
          {/each}
          <button 
            type="button"
            on:click={addLanguage}
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Language
          </button>
        </div>
        
        <!-- Family Members -->
        <div class="mt-6">
          <label class="form-label">{t.familyMembers}</label>
          {#each personalInfo.familyMembers as member, index}
            <div class="flex gap-2 mb-2">
              <input 
                type="text" 
                bind:value={personalInfo.familyMembers[index].name}
                class="form-input"
                placeholder={t.memberName}
              />
              <input 
                type="text" 
                bind:value={personalInfo.familyMembers[index].relationship}
                class="form-input"
                placeholder={t.relationship}
              />
              <button 
                type="button"
                on:click={() => removeFamilyMember(index)}
                class="px-3 py-2 text-red-600 hover:text-red-700"
              >
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
          {/each}
          <button 
            type="button"
            on:click={addFamilyMember}
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + {t.addFamilyMember}
          </button>
        </div>
        
      {:else if currentStep === 2}
        <!-- Biometric Data -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{t.step2}</h2>
          <p class="text-gray-600">Capture your biometric data for family matching</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{t.takeSelfie}</h3>
            <CameraCapture on:capture={handlePhotoCapture} />
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{t.recordVoice}</h3>
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">{t.readScript}</p>
              <div class="p-4 bg-gray-50 rounded-lg border">
                <p class="text-sm text-gray-700">{t.scriptText}</p>
              </div>
            </div>
            <VoiceRecorder on:capture={handleVoiceCapture} />
          </div>
        </div>
        
      {:else if currentStep === 3}
        <!-- Additional Information -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{t.step3}</h2>
          <p class="text-gray-600">Provide additional information to help with family matching</p>
        </div>
        
        <div class="space-y-6">
          <div>
            <label for="lastKnownLocation" class="form-label">{t.lastKnownLocation} *</label>
            <input 
              id="lastKnownLocation"
              type="text" 
              bind:value={additionalInfo.lastKnownLocation}
              class="form-input"
              required
            />
          </div>
          
          <div>
            <label for="separationDate" class="form-label">{t.separationDate} *</label>
            <input 
              id="separationDate"
              type="date" 
              bind:value={additionalInfo.separationDate}
              class="form-input"
              required
            />
          </div>
          
          <div>
            <label for="separationCircumstances" class="form-label">{t.separationCircumstances}</label>
            <textarea 
              id="separationCircumstances"
              bind:value={additionalInfo.separationCircumstances}
              class="form-input h-32"
              rows="4"
            ></textarea>
          </div>
          
          <div>
            <label for="contactInformation" class="form-label">{t.contactInformation}</label>
            <textarea 
              id="contactInformation"
              bind:value={additionalInfo.contactInformation}
              class="form-input h-24"
              rows="3"
            ></textarea>
          </div>
          
          <div>
            <label for="additionalNotes" class="form-label">{t.additionalNotes}</label>
            <textarea 
              id="additionalNotes"
              bind:value={additionalInfo.additionalNotes}
              class="form-input h-32"
              rows="4"
            ></textarea>
          </div>
        </div>
        
      {:else if currentStep === 4}
        <!-- Review & Submit -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{t.step4}</h2>
          <p class="text-gray-600">{t.confirmData}</p>
        </div>
        
        <div class="space-y-6">
          <!-- Personal Information Review -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">{t.step1}</h3>
            <p><strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}</p>
            <p><strong>Date of Birth:</strong> {personalInfo.dateOfBirth}</p>
            <p><strong>Place of Birth:</strong> {personalInfo.placeOfBirth}</p>
            <p><strong>Nationality:</strong> {personalInfo.nationality}</p>
            {#if personalInfo.languages.length > 0}
              <p><strong>Languages:</strong> {personalInfo.languages.join(', ')}</p>
            {/if}
            {#if personalInfo.familyMembers.length > 0}
              <p><strong>Family Members:</strong></p>
              <ul class="list-disc list-inside ml-4">
                {#each personalInfo.familyMembers as member}
                  <li>{member.name} ({member.relationship})</li>
                {/each}
              </ul>
            {/if}
          </div>
          
          <!-- Biometric Data Review -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">{t.step2}</h3>
            <p>✓ Photo captured</p>
            <p>✓ Voice recording captured</p>
          </div>
          
          <!-- Additional Information Review -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">{t.step3}</h3>
            <p><strong>Last Known Location:</strong> {additionalInfo.lastKnownLocation}</p>
            <p><strong>Separation Date:</strong> {additionalInfo.separationDate}</p>
            {#if additionalInfo.separationCircumstances}
              <p><strong>Separation Circumstances:</strong> {additionalInfo.separationCircumstances}</p>
            {/if}
          </div>
          
          <!-- Privacy Notice -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div class="flex items-start">
              <i data-lucide="shield-check" class="w-5 h-5 text-blue-600 mt-0.5 mr-3"></i>
              <div>
                <p class="text-sm text-blue-800 mb-1">{t.privacyNotice}</p>
                <p class="text-sm text-blue-700">{t.dataProcessing}</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      {#if error}
        <div class="error-message mt-4">{error}</div>
      {/if}
      
      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-8">
        <button 
          type="button"
          on:click={previousStep}
          class="btn-outline"
          disabled={currentStep === 1}
        >
          {t.previous}
        </button>
        
        {#if currentStep < totalSteps}
          <button 
            type="button"
            on:click={nextStep}
            class="btn-primary"
          >
            {t.next}
          </button>
        {:else}
          <button 
            type="button"
            on:click={submitRegistration}
            class="btn-primary"
            disabled={loading}
          >
            {loading ? t.processing : t.submit}
          </button>
        {/if}
      </div>
    </div>
  </main>
</div>

<script>
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
</script>
