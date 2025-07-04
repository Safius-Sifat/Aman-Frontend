<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { language } from "$lib/stores/language.js";
  import { user } from "$lib/stores/user.js";
  import { supabase } from "$lib/supabase.js";
  import LanguageSelector from "$lib/components/LanguageSelector.svelte";
  import {
    Users,
    HeartHandshake,
    ShieldCheck,
    Brain,
    Globe,
    ArrowRight,
    CheckCircle,
  } from "lucide-svelte";

  let mounted = false;

  const translations = {
    en: {
      title: "Aman",
      subtitle: "Reconnecting Families Through AI",
      heroDescription:
        "Advanced biometric matching and AI-powered analysis to help familiar individuals separated by conflict and displacement find each other again.",
      getStarted: "Start Your Search",
      learnMore: "Learn More",
      trustedBy: "Trusted by families worldwide",
      stats: {
        familiesReunited: "Families Reunited",
        countriesSupported: "Countries Supported",
        activeSearches: "Active Searches",
        successRate: "Success Rate",
      },
      features: {
        secure: "Military-Grade Security",
        secureDesc:
          "Your biometric data is encrypted and protected with the highest security standards",
        ai: "AI-Powered Matching",
        aiDesc:
          "Advanced algorithms analyze facial features, voice patterns, and personal information with 95% accuracy",
        global: "Global Network",
        globalDesc:
          "Connect with family members across 50+ countries and refugee camps worldwide",
        support: "24/7 Support",
        supportDesc:
          "Our dedicated team provides round-the-clock assistance in multiple languages",
      },
      howItWorks: {
        title: "How Aman Works",
        step1: "Upload Your Information",
        step1Desc:
          "Provide your photo, voice sample, and background information securely",
        step2: "AI Analysis",
        step2Desc:
          "Our advanced AI system analyzes and matches your data with our global database",
        step3: "Find Matches",
        step3Desc:
          "Receive notifications when potential family matches are discovered",
      },
    },
    es: {
      title: "Aman",
      subtitle: "Reconectando Familias a través de IA",
      heroDescription:
        "Coincidencias biométricas avanzadas y análisis impulsado por IA para ayudar a las familias separadas por conflictos y desplazamientos a encontrarse nuevamente.",
      getStarted: "Comienza tu Búsqueda",
      learnMore: "Saber Más",
      trustedBy: "Confiado por familias en todo el mundo",
      stats: {
        familiesReunited: "Familias Reunidas",
        countriesSupported: "Países Apoyados",
        activeSearches: "Búsquedas Activas",
        successRate: "Tasa de Éxito",
      },
      features: {
        secure: "Seguridad de Grado Militar",
        secureDesc:
          "Sus datos biométricos están encriptados y protegidos con los más altos estándares de seguridad",
        ai: "Coincidencia Impulsada por IA",
        aiDesc:
          "Algoritmos avanzados analizan características faciales, patrones de voz e información personal con 95% de precisión",
        global: "Red Global",
        globalDesc:
          "Conéctese con familiares en más de 50 países y campos de refugiados en todo el mundo",
        support: "Soporte 24/7",
        supportDesc:
          "Nuestro equipo dedicado brinda asistencia las 24 horas en múltiples idiomas",
      },
    },
    ar: {
      title: "Aman",
      subtitle: "إعادة توصيل الأسر من خلال الذكاء الاصطناعي",
      heroDescription:
        "المطابقة البيومترية المتقدمة والتحليل المدعوم بالذكاء الاصطناعي لمساعدة الأسر المنفصلة بسبب النزاعات والنزوح في العثور على بعضها البعض مرة أخرى.",
      getStarted: "ابدأ بحثك",
      learnMore: "اعرف المزيد",
      trustedBy: "موثوق به من قبل العائلات في جميع أنحاء العالم",
      stats: {
        familiesReunited: "الأسر المتجمعة",
        countriesSupported: "البلدان المدعومة",
        activeSearches: "عمليات البحث النشطة",
        successRate: "معدل النجاح",
      },
      features: {
        secure: "أمان بدرجة عسكرية",
        secureDesc: "بياناتك البيومترية مشفرة ومحمية بأعلى معايير الأمان",
        ai: "مطابقة مدعومة بالذكاء الاصطناعي",
        aiDesc:
          "خوارزميات متقدمة تحلل ملامح الوجه وأنماط الصوت والمعلومات الشخصية بدقة 95%",
        global: "شبكة عالمية",
        globalDesc:
          "تواصل مع أفراد الأسرة عبر أكثر من 50 دولة ومخيمات اللاجئين في جميع أنحاء العالم",
        support: "دعم 24/7",
        supportDesc: "فريقنا المخصص يقدم المساعدة على مدار الساعة بلغات متعددة",
      },
    },
    bn: {
      title: "Aman",
      subtitle: "এআই এর মাধ্যমে পরিবারের পুনর্মিলন",
      heroDescription:
        "উন্নত বায়োমেট্রিক ম্যাচিং এবং এআই-চালিত বিশ্লেষণ যা দ্বন্দ্ব এবং বাস্তুচ্যুতির কারণে বিচ্ছিন্ন পরিবারগুলিকে আবার একসাথে খুঁজে পেতে সাহায্য করে।",
      getStarted: "আপনার অনুসন্ধান শুরু করুন",
      learnMore: "আরও জানুন",
      trustedBy: "বিশ্বব্যাপী পরিবারগুলির দ্বারা বিশ্বস্ত",
      stats: {
        familiesReunited: "পরিবার পুনর্মিলিত",
        countriesSupported: "সমর্থিত দেশ",
        activeSearches: "সক্রিয় অনুসন্ধান",
        successRate: "সাফল্যের হার",
      },
      features: {
        secure: "সামরিক-গ্রেড নিরাপত্তা",
        secureDesc:
          "আপনার বায়োমেট্রিক ডেটা সর্বোচ্চ নিরাপত্তা মানদণ্ডের সাথে এনক্রিপ্ট এবং সুরক্ষিত",
        ai: "এআই-চালিত ম্যাচিং",
        aiDesc:
          "উন্নত অ্যালগরিদম 95% নির্ভুলতার সাথে মুখের বৈশিষ্ট্য, কণ্ঠস্বর প্যাটার্ন এবং ব্যক্তিগত তথ্য বিশ্লেষণ করে",
        global: "বিশ্বব্যাপী নেটওয়ার্ক",
        globalDesc:
          "50+ দেশ এবং বিশ্বব্যাপী শরণার্থী শিবিরে পরিবারের সদস্যদের সাথে সংযোগ করুন",
        support: "24/7 সহায়তা",
        supportDesc:
          "আমাদের নিবেদিত দল একাধিক ভাষায় 24 ঘন্টা সহায়তা প্রদান করে",
      },
    },
  };

  $: t = translations[$language] || translations.en;
  $: isRtl = $language === "ar";

  onMount(async () => {
    mounted = true;

    // Check if user is already authenticated with Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      user.set({
        id: session.user.id,
        email: session.user.email,
        firstName:
          session.user.user_metadata?.full_name?.split(" ")[0] || "User",
      });
      goto("/dashboard");
    }
  });
</script>

<svelte:head>
  <title>{t.title} - {t.subtitle}</title>
  <meta name="description" content={t.heroDescription} />
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50"
  dir={isRtl ? "rtl" : "ltr"}
>
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
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
            <h1 class="text-lg font-semibold text-gray-900">{t.title}</h1>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <LanguageSelector />
        </div>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative py-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <div class="mb-8">
          <div
            class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
            style="background: linear-gradient(135deg, #1A8161, #22c55e);"
          >
            <HeartHandshake size={40} strokeWidth={1.5} class="text-white" />
          </div>

          <h1
            class="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            {t.subtitle}
          </h1>

          <p
            class="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8"
          >
            {t.heroDescription}
          </p>

          <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              on:click={() => goto("/register")}
              class="btn-primary text-lg px-8 py-4 flex items-center"
            >
              {t.getStarted}
              <ArrowRight size={20} strokeWidth={2} class="ml-2" />
            </button>

            <button class="btn-outline text-lg px-8 py-4">
              {t.learnMore}
            </button>
          </div>
        </div>

        <p class="text-sm text-gray-500 mb-8">{t.trustedBy}</p>
      </div>
    </div>
  </section>

  <!-- Statistics Section -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
            12,847
          </div>
          <div class="text-gray-600 font-medium">
            {t.stats.familiesReunited}
          </div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
            52
          </div>
          <div class="text-gray-600 font-medium">
            {t.stats.countriesSupported}
          </div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
            89,432
          </div>
          <div class="text-gray-600 font-medium">{t.stats.activeSearches}</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-green-600 mb-2">
            87%
          </div>
          <div class="text-gray-600 font-medium">{t.stats.successRate}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Why Choose Aman?
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced technology meets compassionate service to help individuals
          find each other
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          class="card text-center group hover:shadow-xl transition-all duration-300"
        >
          <div
            class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
          >
            <ShieldCheck size={32} strokeWidth={2} class="text-green-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {t.features.secure}
          </h3>
          <p class="text-gray-600 leading-relaxed">{t.features.secureDesc}</p>
        </div>

        <div
          class="card text-center group hover:shadow-xl transition-all duration-300"
        >
          <div
            class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
          >
            <Brain size={32} strokeWidth={2} class="text-emerald-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {t.features.ai}
          </h3>
          <p class="text-gray-600 leading-relaxed">{t.features.aiDesc}</p>
        </div>

        <div
          class="card text-center group hover:shadow-xl transition-all duration-300"
        >
          <div
            class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
          >
            <Globe size={32} strokeWidth={2} class="text-blue-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {t.features.global}
          </h3>
          <p class="text-gray-600 leading-relaxed">{t.features.globalDesc}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-4xl md:text-5xl font-bold text-black mb-6">
        Ready to Start Your Search?
      </h2>
      <p class="text-xl text-green-100 mb-8 leading-relaxed">
        Join thousands of people who have found hope through Aman
      </p>
      <button
        on:click={() => goto("/register")}
        class="bg-white text-green-600 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 inline-flex items-center shadow-lg"
      >
        {t.getStarted}
        <ArrowRight size={24} strokeWidth={2} class="ml-2" />
      </button>
    </div>
  </section>
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
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -3px rgba(26, 129, 97, 0.3);
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
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -3px rgba(26, 129, 97, 0.3);
  }

  :global(.card) {
    background: white;
    padding: 2rem;
    border-radius: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid rgba(26, 129, 97, 0.1);
  }

  :global(.card:hover) {
    transform: translateY(-4px);
    border-color: rgba(26, 129, 97, 0.2);
  }
</style>
