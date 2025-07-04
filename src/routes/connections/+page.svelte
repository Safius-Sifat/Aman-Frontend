<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.js";
  import { language } from "$lib/stores/language.js";
  import ConnectionGraph from "$lib/components/ConnectionGraph.svelte";

  let connections = [];
  let loading = true;
  let error = "";
  let selectedNode = null;
  let filterLevel = "all";
  let minScore = 50;

  const translations = {
    en: {
      title: "Family Connection Graph",
      subtitle:
        "Visualize potential family connections based on biometric and information matching",
      loading: "Loading connections...",
      noConnections: "No connections found",
      backToDashboard: "Back to Dashboard",
      filters: "Filters",
      showAll: "Show All",
      highConfidence: "High Confidence (80%+)",
      mediumConfidence: "Medium Confidence (60-79%)",
      lowConfidence: "Low Confidence (50-59%)",
      minimumScore: "Minimum Match Score",
      nodeDetails: "Connection Details",
      matchScore: "Match Score",
      facialMatch: "Facial Match",
      voiceMatch: "Voice Match",
      infoMatch: "Information Match",
      contact: "Contact",
      viewProfile: "View Profile",
      close: "Close",
      legend: "Legend",
      you: "You",
      potentialFamily: "Potential Family",
      strongConnection: "Strong Connection",
      mediumConnection: "Medium Connection",
      weakConnection: "Weak Connection",
    },
    es: {
      title: "Gráfico de Conexiones Familiares",
      subtitle:
        "Visualice las conexiones familiares potenciales basadas en coincidencias biométricas y de información",
      loading: "Cargando conexiones...",
      noConnections: "No se encontraron conexiones",
      backToDashboard: "Volver al Panel",
      filters: "Filtros",
      showAll: "Mostrar Todo",
      highConfidence: "Alta Confianza (80%+)",
      mediumConfidence: "Confianza Media (60-79%)",
      lowConfidence: "Baja Confianza (50-59%)",
      minimumScore: "Puntuación Mínima de Coincidencia",
      nodeDetails: "Detalles de Conexión",
      matchScore: "Puntuación de Coincidencia",
      facialMatch: "Coincidencia Facial",
      voiceMatch: "Coincidencia de Voz",
      infoMatch: "Coincidencia de Información",
      contact: "Contactar",
      viewProfile: "Ver Perfil",
      close: "Cerrar",
      legend: "Leyenda",
      you: "Usted",
      potentialFamily: "Familia Potencial",
      strongConnection: "Conexión Fuerte",
      mediumConnection: "Conexión Media",
      weakConnection: "Conexión Débil",
    },
    ar: {
      title: "رسم الاتصالات العائلية",
      subtitle:
        "تصور الاتصالات العائلية المحتملة بناءً على التطابق البيومتري والمعلوماتي",
      loading: "جاري تحميل الاتصالات...",
      noConnections: "لم يتم العثور على اتصالات",
      backToDashboard: "العودة إلى لوحة التحكم",
      filters: "المرشحات",
      showAll: "عرض الكل",
      highConfidence: "ثقة عالية (80%+)",
      mediumConfidence: "ثقة متوسطة (60-79%)",
      lowConfidence: "ثقة منخفضة (50-59%)",
      minimumScore: "الحد الأدنى لدرجة التطابق",
      nodeDetails: "تفاصيل الاتصال",
      matchScore: "درجة التطابق",
      facialMatch: "تطابق الوجه",
      voiceMatch: "تطابق الصوت",
      infoMatch: "تطابق المعلومات",
      contact: "اتصال",
      viewProfile: "عرض الملف الشخصي",
      close: "إغلاق",
      legend: "الشرح",
      you: "أنت",
      potentialFamily: "عائلة محتملة",
      strongConnection: "اتصال قوي",
      mediumConnection: "اتصال متوسط",
      weakConnection: "اتصال ضعيف",
    },
  };

  $: t = translations[$language] || translations.en;
  $: isRtl = $language === "ar";
  $: filteredConnections = connections.filter((conn) => {
    if (conn.score < minScore) return false;

    if (filterLevel === "high" && conn.score < 80) return false;
    if (filterLevel === "medium" && (conn.score < 60 || conn.score >= 80))
      return false;
    if (filterLevel === "low" && (conn.score < 50 || conn.score >= 60))
      return false;

    return true;
  });

  onMount(async () => {
    if (!$user) {
      goto("/");
      return;
    }

    await loadConnections();
  });

  async function loadConnections() {
    try {
      loading = true;

      const response = await fetch("/api/connections");
      if (response.ok) {
        const data = await response.json();
        connections = data.connections || [];
      } else {
        error = "Failed to load connections";
      }
    } catch (err) {
      error = "Failed to load connections";
    } finally {
      loading = false;
    }
  }

  function handleNodeClick(event) {
    selectedNode = event.detail;
  }

  function closeDetails() {
    selectedNode = null;
  }

  function getScoreColor(score) {
    if (score >= 80) return "#059669";
    if (score >= 60) return "#F59E0B";
    return "#6B7280";
  }

  function getConfidenceLabel(score) {
    if (score >= 80) return t.highConfidence;
    if (score >= 60) return t.mediumConfidence;
    return t.lowConfidence;
  }
</script>

<svelte:head>
  <title>{t.title} - ReuniteAI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <button
            on:click={() => goto("/dashboard")}
            class="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
            {t.backToDashboard}
          </button>
          <h1 class="text-lg font-semibold text-gray-900">{t.title}</h1>
        </div>

        <div class="flex items-center space-x-4">
          <button
            on:click={() => goto("/dashboard")}
            class="btn-outline text-sm"
          >
            <i data-lucide="home" class="w-4 h-4 mr-2"></i>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p class="text-gray-600">{t.subtitle}</p>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-96">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">{t.loading}</p>
        </div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 mr-3"></i>
          <p class="text-red-700">{error}</p>
        </div>
      </div>
    {:else}
      <div class="grid lg:grid-cols-4 gap-6">
        <!-- Sidebar Controls -->
        <div class="space-y-6">
          <!-- Filters -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">{t.filters}</h3>

            <div class="space-y-4">
              <div>
                <label class="form-label">Connection Level</label>
                <select bind:value={filterLevel} class="form-input">
                  <option value="all">{t.showAll}</option>
                  <option value="high">{t.highConfidence}</option>
                  <option value="medium">{t.mediumConfidence}</option>
                  <option value="low">{t.lowConfidence}</option>
                </select>
              </div>

              <div>
                <label class="form-label">{t.minimumScore}: {minScore}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  bind:value={minScore}
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">{t.legend}</h3>

            <div class="space-y-3">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
                <span class="text-sm text-gray-700">{t.you}</span>
              </div>

              <div class="flex items-center">
                <div class="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                <span class="text-sm text-gray-700">{t.potentialFamily}</span>
              </div>

              <div class="border-t pt-3">
                <div class="flex items-center mb-2">
                  <div class="w-4 h-1 bg-emerald-600 mr-3"></div>
                  <span class="text-sm text-gray-700">{t.strongConnection}</span
                  >
                </div>

                <div class="flex items-center mb-2">
                  <div class="w-4 h-1 bg-amber-600 mr-3"></div>
                  <span class="text-sm text-gray-700">{t.mediumConnection}</span
                  >
                </div>

                <div class="flex items-center">
                  <div class="w-4 h-1 bg-gray-400 mr-3"></div>
                  <span class="text-sm text-gray-700">{t.weakConnection}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graph Container -->
        <div class="lg:col-span-3">
          <div class="card h-[600px]">
            {#if filteredConnections.length === 0}
              <div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div
                    class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <i data-lucide="share-2" class="w-8 h-8 text-gray-400"></i>
                  </div>
                  <p class="text-gray-500 text-lg">{t.noConnections}</p>
                </div>
              </div>
            {:else}
              <ConnectionGraph
                connections={filteredConnections}
                on:nodeClick={handleNodeClick}
              />
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </main>

  <!-- Node Details Modal -->
  {#if selectedNode}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">{t.nodeDetails}</h3>
            <button
              on:click={closeDetails}
              class="text-gray-400 hover:text-gray-600"
              aria-label={t.close}
            >
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div
                class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"
              >
                <i data-lucide="user" class="w-8 h-8 text-gray-400"></i>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">{selectedNode.name}</h4>
                <p class="text-sm text-gray-600">{selectedNode.relationship}</p>
                <p class="text-xs text-gray-500">{selectedNode.location}</p>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">{t.matchScore}</span>
                <span
                  class="font-semibold"
                  style="color: {getScoreColor(selectedNode.score)}"
                >
                  {selectedNode.score}%
                </span>
              </div>

              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">{t.facialMatch}</span>
                <span class="text-sm text-gray-700"
                  >{selectedNode.facialScore}%</span
                >
              </div>

              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">{t.voiceMatch}</span>
                <span class="text-sm text-gray-700"
                  >{selectedNode.voiceScore}%</span
                >
              </div>

              <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-gray-600">{t.infoMatch}</span>
                <span class="text-sm text-gray-700"
                  >{selectedNode.infoScore}%</span
                >
              </div>

              <div class="flex space-x-3">
                <button class="btn-outline flex-1 text-sm">
                  {t.viewProfile}
                </button>
                <button class="btn-primary flex-1 text-sm">
                  {t.contact}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
