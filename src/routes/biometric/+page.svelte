<script>
    import { language } from "$lib/stores/language.js";
    import LanguageSelector from "$lib/components/LanguageSelector.svelte";
    import { goto } from "$app/navigation";

    const translations = {
        en: {
            title: "Biometric Registration",
            subtitle:
                "Secure identity verification through advanced biometric scanning",
            description:
                "We use facial recognition and voice patterns to create a unique, secure profile that helps us match you with your family members.",
            action: "Capture Biometrics",
            previous: "Back to Home",
        },
        es: {
            title: "Registro Biométrico",
            subtitle:
                "Verificación de identidad segura através de escaneo biométrico avanzado",
            description:
                "Utilizamos reconocimiento facial y patrones de voz para crear un perfil único y seguro.",
            action: "Capturar Biométricos",
            previous: "Volver a Inicio",
        },
        ar: {
            title: "التسجيل البيومتري",
            subtitle: "التحقق الآمن من الهوية من خلال المسح البيومتري المتقدم",
            description:
                "نستخدم التعرف على الوجه وأنماط الصوت لإنشاء ملف شخصي فريد وآمن.",
            action: "التقاط البيانات البيومترية",
            previous: "العودة إلى الرئيسية",
        },
    };

    $: t = translations[$language] || translations.en;
    $: isRtl = $language === "ar";
</script>

<svelte:head>
    <title>{t.title} - Aman</title>
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
                            <i data-lucide="users" class="w-5 h-5 text-white"
                            ></i>
                        </div>
                    </div>
                    <div class="ml-3">
                        <h1 class="text-lg font-semibold text-gray-900">
                            Aman
                        </h1>
                    </div>
                </div>

                <div class="flex items-center space-x-4">
                    <LanguageSelector />
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-2xl mx-auto text-center">
            <div class="mb-8">
                <div
                    class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                    <i data-lucide="scan-face" class="w-8 h-8 text-white"></i>
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {t.title}
                </h1>
                <p class="text-xl text-gray-600 mb-6">
                    {t.subtitle}
                </p>
                <p class="text-gray-600 mb-8">
                    {t.description}
                </p>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div
                    class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <i data-lucide="camera" class="w-12 h-12 text-blue-600"></i>
                </div>
                <p class="text-gray-600 mb-6">
                    Click below to start biometric capture
                </p>
                <button
                    class="btn-primary mb-4"
                    on:click={() => goto("/register")}
                >
                    {t.action}
                </button>
            </div>

            <div class="flex justify-center">
                <button on:click={() => goto("/")} class="btn-outline">
                    {t.previous}
                </button>
            </div>
        </div>
    </main>
</div>
