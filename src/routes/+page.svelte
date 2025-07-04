<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { language } from "$lib/stores/language.js";
  import { user } from "$lib/stores/user.js";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";

  let mounted = false;

  const translations = {
    en: {
      title: "Family Reunification Platform",
      subtitle:
        "Connecting families separated by conflict and displacement through secure biometric matching and AI-powered analysis",
      getStarted: "Get Started",
      features: {
        secure: "Secure & Private",
        secureDesc:
          "Your biometric data is encrypted and protected with military-grade security",
        ai: "AI-Powered Matching",
        aiDesc:
          "Advanced algorithms analyze facial features, voice patterns, and personal information",
        global: "Global Network",
        globalDesc:
          "Connect with family members across borders and refugee camps worldwide",
      },
    },
    es: {
      title: "Plataforma de Reunificación Familiar",
      subtitle:
        "Conectando familias separadas por conflictos y desplazamientos a través de coincidencias biométricas seguras y análisis impulsado por IA",
      getStarted: "Comenzar",
      features: {
        secure: "Seguro y Privado",
        secureDesc:
          "Sus datos biométricos están encriptados y protegidos con seguridad de grado militar",
        ai: "Coincidencia Impulsada por IA",
        aiDesc:
          "Algoritmos avanzados analizan características faciales, patrones de voz e información personal",
        global: "Red Global",
        globalDesc:
          "Conéctese con familiares a través de fronteras y campos de refugiados en todo el mundo",
      },
    },
    ar: {
      title: "منصة لم الشمل الأسري",
      subtitle:
        "ربط الأسر المنفصلة بسبب النزاعات والنزوح من خلال المطابقة البيومترية الآمنة والتحليل المدعوم بالذكاء الاصطناعي",
      getStarted: "ابدأ",
      features: {
        secure: "آمن وخاص",
        secureDesc: "بياناتك البيومترية مشفرة ومحمية بأمان عسكري الدرجة",
        ai: "مطابقة مدعومة بالذكاء الاصطناعي",
        aiDesc:
          "خوارزميات متقدمة تحلل ملامح الوجه وأنماط الصوت والمعلومات الشخصية",
        global: "شبكة عالمية",
        globalDesc:
          "تواصل مع أفراد الأسرة عبر الحدود ومخيمات اللاجئين في جميع أنحاء العالم",
      },
    },
    bn: {
      title: "পারিবারিক পুনর্মিলনী প্ল্যাটফর্ম",
      subtitle:
        "দ্বন্দ্ব এবং বাস্তুচ্যুতির কারণে বিচ্ছিন্ন পরিবারগুলিকে নিরাপদ বায়োমেট্রিক ম্যাচিং এবং এআই-চালিত বিশ্লেষণের মাধ্যমে সংযুক্ত করা",
      getStarted: "শুরু করুন",
      features: {
        secure: "নিরাপদ এবং ব্যক্তিগত",
        secureDesc:
          "আপনার বায়োমেট্রিক ডেটা এনক্রিপ্ট করা এবং সামরিক-গ্রেড নিরাপত্তার সাথে সুরক্ষিত",
        ai: "এআই-চালিত ম্যাচিং",
        aiDesc:
          "উন্নত অ্যালগরিদম মুখের বৈশিষ্ট্য, কণ্ঠস্বর প্যাটার্ন এবং ব্যক্তিগত তথ্য বিশ্লেষণ করে",
        global: "বিশ্বব্যাপী নেটওয়ার্ক",
        globalDesc:
          "সীমানা জুড়ে এবং বিশ্বব্যাপী শরণার্থী শিবিরে পরিবারের সদস্যদের সাথে সংযোগ করুন",
      },
    },
  };

  $: t = translations[$language] || translations.en;
  $: isRtl = $language === "ar";

  onMount(() => {
    mounted = true;
    // Redirect if user is already logged in
    if ($user) {
      goto("/dashboard");
    }
  });
</script>

<svelte:head>
  <title>{t.title}</title>
  <meta name="description" content={t.subtitle} />
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50"
  dir={isRtl ? "rtl" : "ltr"}
>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
            >
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
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <div class="mb-8">
        <div
          class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
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
          on:click={() => goto("/register")}
          class="btn-primary text-lg px-8 py-4"
        >
          {t.getStarted}
        </button>
      </div>
    </div>

    <!-- Features Section -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <div class="card text-center">
        <div
          class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <i data-lucide="shield-check" class="w-6 h-6 text-blue-600"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {t.features.secure}
        </h3>
        <p class="text-gray-600">{t.features.secureDesc}</p>
      </div>

      <div class="card text-center">
        <div
          class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <i data-lucide="brain" class="w-6 h-6 text-emerald-600"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {t.features.ai}
        </h3>
        <p class="text-gray-600">{t.features.aiDesc}</p>
      </div>

      <div class="card text-center">
        <div
          class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <i data-lucide="globe" class="w-6 h-6 text-amber-600"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {t.features.global}
        </h3>
        <p class="text-gray-600">{t.features.globalDesc}</p>
      </div>
    </div>
  </main>
</div>
