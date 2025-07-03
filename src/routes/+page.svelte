<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { language } from '$lib/stores/language.js';
  import { user } from '$lib/stores/user.js';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  
  let mounted = false;
  let currentStep = 'landing'; // 'landing', 'biometric', 'connections', 'matching', 'complete'
  
  const translations = {
    en: {
      title: 'Family Reunification Platform',
      subtitle: 'Connecting families separated by conflict and displacement through secure biometric matching and AI-powered analysis',
      getStarted: 'Get Started',
      next: 'Next',
      previous: 'Previous',
      complete: 'Complete Setup',
      steps: {
        biometric: {
          title: 'Biometric Registration',
          subtitle: 'Secure identity verification through advanced biometric scanning',
          description: 'We use facial recognition, voice patterns, and fingerprint scanning to create a unique, secure profile that helps us match you with your family members.',
          action: 'Capture Biometrics'
        },
        connections: {
          title: 'Family Connections',
          subtitle: 'Tell us about your missing family members',
          description: 'Provide information about family members you are looking for. The more details you can share, the better we can help you reconnect.',
          action: 'Add Family Info'
        },
        matching: {
          title: 'AI-Powered Matching',
          subtitle: 'Our system searches for potential matches',
          description: 'Advanced AI algorithms analyze your biometric data and family information to search our global database for potential matches.',
          action: 'Start Matching'
        }
      },
      features: {
        secure: 'Secure & Private',
        secureDesc: 'Your biometric data is encrypted and protected with military-grade security',
        ai: 'AI-Powered Matching',
        aiDesc: 'Advanced algorithms analyze facial features, voice patterns, and personal information',
        global: 'Global Network',
        globalDesc: 'Connect with family members across borders and refugee camps worldwide'
      }
    },
    es: {
      title: 'Plataforma de Reunificación Familiar',
      subtitle: 'Conectando familias separadas por conflictos y desplazamientos a través de coincidencias biométricas seguras y análisis impulsado por IA',
      getStarted: 'Comenzar',
      next: 'Siguiente',
      previous: 'Anterior',
      complete: 'Completar Configuración',
      steps: {
        biometric: {
          title: 'Registro Biométrico',
          subtitle: 'Verificación de identidad segura através de escaneo biométrico avanzado',
          description: 'Utilizamos reconocimiento facial, patrones de voz y escaneo de huellas dactilares para crear un perfil único y seguro.',
          action: 'Capturar Biométricos'
        },
        connections: {
          title: 'Conexiones Familiares',
          subtitle: 'Cuéntanos sobre tus familiares desaparecidos',
          description: 'Proporciona información sobre los familiares que estás buscando. Cuantos más detalles compartas, mejor podremos ayudarte.',
          action: 'Agregar Info Familiar'
        },
        matching: {
          title: 'Coincidencia con IA',
          subtitle: 'Nuestro sistema busca coincidencias potenciales',
          description: 'Algoritmos avanzados de IA analizan tus datos biométricos e información familiar para buscar coincidencias.',
          action: 'Iniciar Coincidencias'
        }
      },
      features: {
        secure: 'Seguro y Privado',
        secureDesc: 'Sus datos biométricos están encriptados y protegidos con seguridad de grado militar',
        ai: 'Coincidencia Impulsada por IA',
        aiDesc: 'Algoritmos avanzados analizan características faciales, patrones de voz e información personal',
        global: 'Red Global',
        globalDesc: 'Conéctese con familiares a través de fronteras y campos de refugiados en todo el mundo'
      }
    },
    ar: {
      title: 'منصة لم الشمل الأسري',
      subtitle: 'ربط الأسر المنفصلة بسبب النزاعات والنزوح من خلال المطابقة البيومترية الآمنة والتحليل المدعوم بالذكاء الاصطناعي',
      getStarted: 'ابدأ',
      next: 'التالي',
      previous: 'السابق',
      complete: 'إكمال الإعداد',
      steps: {
        biometric: {
          title: 'التسجيل البيومتري',
          subtitle: 'التحقق الآمن من الهوية من خلال المسح البيومتري المتقدم',
          description: 'نستخدم التعرف على الوجه وأنماط الصوت ومسح بصمات الأصابع لإنشاء ملف شخصي فريد وآمن.',
          action: 'التقاط البيانات البيومترية'
        },
        connections: {
          title: 'الروابط العائلية',
          subtitle: 'أخبرنا عن أفراد عائلتك المفقودين',
          description: 'قدم معلومات حول أفراد الأسرة الذين تبحث عنهم. كلما شاركت تفاصيل أكثر، كان بإمكاننا مساعدتك بشكل أفضل.',
          action: 'إضافة معلومات العائلة'
        },
        matching: {
          title: 'المطابقة بالذكاء الاصطناعي',
          subtitle: 'نظامنا يبحث عن التطابقات المحتملة',
          description: 'خوارزميات الذكاء الاصطناعي المتقدمة تحلل بياناتك البيومترية ومعلومات العائلة للبحث عن التطابقات.',
          action: 'بدء المطابقة'
        }
      },
      features: {
        secure: 'آمن وخاص',
        secureDesc: 'بياناتك البيومترية مشفرة ومحمية بأمان عسكري الدرجة',
        ai: 'مطابقة مدعومة بالذكاء الاصطناعي',
        aiDesc: 'خوارزميات متقدمة تحلل ملامح الوجه وأنماط الصوت والمعلومات الشخصية',
        global: 'شبكة عالمية',
        globalDesc: 'تواصل مع أفراد الأسرة عبر الحدود ومخيمات اللاجئين في جميع أنحاء العالم'
      }
    }
  };
  
  $: t = translations[$language] || translations.en;
  $: isRtl = $language === 'ar';
  
  onMount(() => {
    mounted = true;
    // Redirect if user is already logged in
    if ($user) {
      goto('/dashboard');
    }
  });

  function startJourney() {
    currentStep = 'biometric';
  }

  function nextStep() {
    if (currentStep === 'biometric') {
      currentStep = 'connections';
    } else if (currentStep === 'connections') {
      currentStep = 'matching';
    } else if (currentStep === 'matching') {
      currentStep = 'complete';
      // Here you could redirect to dashboard or show completion
      setTimeout(() => {
        goto('/dashboard');
      }, 2000);
    }
  }

  function previousStep() {
    if (currentStep === 'connections') {
      currentStep = 'biometric';
    } else if (currentStep === 'matching') {
      currentStep = 'connections';
    } else if (currentStep === 'complete' || currentStep === 'biometric') {
      currentStep = 'landing';
    }
  }
</script>

<svelte:head>
  <title>{t.title}</title>
  <meta name="description" content={t.subtitle} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50" dir={isRtl ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i data-lucide="users" class="w-5 h-5 text-white"></i>
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
    {#if currentStep === 'landing'}
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i data-lucide="heart-handshake" class="w-8 h-8 text-white"></i>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.title}
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        
        <div class="flex justify-center">
          <button 
            on:click={startJourney}
            class="btn-primary text-lg px-8 py-4"
          >
            {t.getStarted}
          </button>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="card text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i data-lucide="shield-check" class="w-6 h-6 text-blue-600"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{t.features.secure}</h3>
          <p class="text-gray-600">{t.features.secureDesc}</p>
        </div>
        
        <div class="card text-center">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i data-lucide="brain" class="w-6 h-6 text-emerald-600"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{t.features.ai}</h3>
          <p class="text-gray-600">{t.features.aiDesc}</p>
        </div>
        
        <div class="card text-center">
          <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i data-lucide="globe" class="w-6 h-6 text-amber-600"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{t.features.global}</h3>
          <p class="text-gray-600">{t.features.globalDesc}</p>
        </div>
      </div>
    {/if}

    {#if currentStep === 'biometric'}
      <!-- Biometric Step -->
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i data-lucide="scan-face" class="w-8 h-8 text-white"></i>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.steps.biometric.title}
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            {t.steps.biometric.subtitle}
          </p>
          <p class="text-gray-600 mb-8">
            {t.steps.biometric.description}
          </p>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="camera" class="w-12 h-12 text-blue-600"></i>
          </div>
          <p class="text-gray-600 mb-6">Click below to start biometric capture</p>
          <button class="btn-primary mb-4">
            {t.steps.biometric.action}
          </button>
        </div>
        
        <div class="flex justify-between">
          <button on:click={previousStep} class="btn-outline">
            {t.previous}
          </button>
          <button on:click={nextStep} class="btn-primary">
            {t.next}
          </button>
        </div>
      </div>
    {/if}

    {#if currentStep === 'connections'}
      <!-- Connections Step -->
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i data-lucide="users" class="w-8 h-8 text-white"></i>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.steps.connections.title}
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            {t.steps.connections.subtitle}
          </p>
          <p class="text-gray-600 mb-8">
            {t.steps.connections.description}
          </p>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div class="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="user-plus" class="w-12 h-12 text-emerald-600"></i>
          </div>
          <p class="text-gray-600 mb-6">Add information about family members you're looking for</p>
          <button class="btn-primary mb-4">
            {t.steps.connections.action}
          </button>
        </div>
        
        <div class="flex justify-between">
          <button on:click={previousStep} class="btn-outline">
            {t.previous}
          </button>
          <button on:click={nextStep} class="btn-primary">
            {t.next}
          </button>
        </div>
      </div>
    {/if}

    {#if currentStep === 'matching'}
      <!-- Matching Step -->
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i data-lucide="brain" class="w-8 h-8 text-white"></i>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.steps.matching.title}
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            {t.steps.matching.subtitle}
          </p>
          <p class="text-gray-600 mb-8">
            {t.steps.matching.description}
          </p>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div class="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="search" class="w-12 h-12 text-amber-600"></i>
          </div>
          <p class="text-gray-600 mb-6">AI is analyzing your data to find potential family matches</p>
          <button class="btn-primary mb-4">
            {t.steps.matching.action}
          </button>
        </div>
        
        <div class="flex justify-between">
          <button on:click={previousStep} class="btn-outline">
            {t.previous}
          </button>
          <button on:click={nextStep} class="btn-primary">
            {t.complete}
          </button>
        </div>
      </div>
    {/if}

    {#if currentStep === 'complete'}
      <!-- Completion Step -->
      <div class="max-w-2xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i data-lucide="check-circle" class="w-8 h-8 text-white"></i>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Setup Complete!
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            Your profile has been created and our AI is now searching for matches.
          </p>
          <p class="text-gray-600 mb-8">
            You'll be redirected to your dashboard where you can monitor progress and view potential matches.
          </p>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="heart" class="w-12 h-12 text-green-600"></i>
          </div>
          <p class="text-gray-600 mb-6">Redirecting to dashboard...</p>
          <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    {/if}
  </main>
</div>
