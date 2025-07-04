<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.js";
  import { language } from "$lib/stores/language.js";
  import { supabase } from "$lib/supabase.js";
  import {
    Users,
    ArrowLeft,
    Search,
    Filter,
    Download,
    Share2,
    Heart,
    User as UserIcon,
    MapPin,
    Calendar,
    Phone,
    Grid3X3,
    Network,
  } from "lucide-svelte";

  let currentUser = null;
  let connections = [];
  let filteredConnections = [];
  let loading = true;
  let error = "";
  let searchQuery = "";
  let selectedRelationshipFilter = "all";
  let selectedConnection = null;
  let showConnectionDetails = false;
  let viewMode = "grid"; // "grid" or "graph"
  let svgContainer;
  let nodes = [];
  let links = [];
  let userRecord = null;
  let processingStatus = null; // null, 0, or 1

  const translations = {
    en: {
      title: "Family Connection Graph",
      subtitle: "Visualize your family network and potential connections",
      searchPlaceholder: "Search family members...",
      filterAll: "All Relationships",
      filterParent: "Parents",
      filterChild: "Children",
      filterSibling: "Siblings",
      filterExtended: "Extended Family",
      connectionStrength: "Connection Strength",
      location: "Location",
      lastSeen: "Last Seen",
      contact: "Contact",
      viewProfile: "View Profile",
      shareConnection: "Share Connection",
      downloadGraph: "Download Graph",
      processingStatuses: {
        notStarted: "Processing Not Started",
        notStartedDesc:
          "Your profile is waiting to be processed. Connection graph will be available once processing begins.",
        processing: "Processing in Progress",
        processingDesc:
          "Your profile is being analyzed. Connection graph will be available once processing is complete.",
        completed: "Processing Complete",
        completedDesc:
          "Your profile has been processed and connections are available.",
        noConnections: "No connections found yet",
        noConnectionsDesc:
          "Keep checking back as we continuously search for new family connections.",
      },
      relationshipTypes: {
        parent: "Parent",
        child: "Child",
        sibling: "Sibling",
        spouse: "Spouse",
        grandparent: "Grandparent",
        grandchild: "Grandchild",
        uncle: "Uncle/Aunt",
        cousin: "Cousin",
        unknown: "Potential Family",
      },
    },
    es: {
      title: "Gráfico de Conexiones Familiares",
      subtitle: "Visualiza tu red familiar y conexiones potenciales",
      searchPlaceholder: "Buscar miembros de la familia...",
      filterAll: "Todas las Relaciones",
      filterParent: "Padres",
      filterChild: "Hijos",
      filterSibling: "Hermanos",
      filterExtended: "Familia Extendida",
      connectionStrength: "Fuerza de Conexión",
      location: "Ubicación",
      lastSeen: "Visto por Última Vez",
      contact: "Contactar",
      viewProfile: "Ver Perfil",
      shareConnection: "Compartir Conexión",
      downloadGraph: "Descargar Gráfico",
      processingStatuses: {
        notStarted: "Procesamiento No Iniciado",
        notStartedDesc:
          "Tu perfil está esperando ser procesado. El gráfico de conexiones estará disponible una vez que comience el procesamiento.",
        processing: "Procesamiento en Progreso",
        processingDesc:
          "Tu perfil está siendo analizado. El gráfico de conexiones estará disponible una vez que se complete el procesamiento.",
        completed: "Procesamiento Completo",
        completedDesc:
          "Tu perfil ha sido procesado y las conexiones están disponibles.",
        noConnections: "Aún no se encontraron conexiones",
        noConnectionsDesc:
          "Sigue revisando ya que buscamos continuamente nuevas conexiones familiares.",
      },
    },
    ar: {
      title: "خريطة الاتصالات العائلية",
      subtitle: "تصور شبكة عائلتك والاتصالات المحتملة",
      searchPlaceholder: "البحث عن أفراد العائلة...",
      filterAll: "جميع العلاقات",
      filterParent: "الوالدين",
      filterChild: "الأطفال",
      filterSibling: "الأشقاء",
      filterExtended: "العائلة الممتدة",
      connectionStrength: "قوة الاتصال",
      location: "الموقع",
      lastSeen: "آخر ظهور",
      contact: "اتصال",
      viewProfile: "عرض الملف الشخصي",
      shareConnection: "مشاركة الاتصال",
      downloadGraph: "تحميل الرسم البياني",
      processingStatuses: {
        notStarted: "لم يبدأ المعالجة",
        notStartedDesc:
          "ملفك الشخصي في انتظار المعالجة. سيكون رسم الاتصالات متاحًا بمجرد بدء المعالجة.",
        processing: "المعالجة قيد التقدم",
        processingDesc:
          "يتم تحليل ملفك الشخصي. سيكون رسم الاتصالات متاحًا بمجرد اكتمال المعالجة.",
        completed: "اكتملت المعالجة",
        completedDesc: "تمت معالجة ملفك الشخصي والاتصالات متاحة.",
        noConnections: "لم يتم العثور على اتصالات بعد",
        noConnectionsDesc:
          "استمر في المراجعة حيث نبحث باستمرار عن اتصالات عائلية جديدة.",
      },
    },
  };

  $: t = translations[$language] || translations.en;
  $: isRtl = $language === "ar";

  onMount(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      goto("/");
      return;
    }

    currentUser = session.user;

    // Check user's processing status
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("*")
      .eq("email", currentUser.email)
      .single();

    if (userCheckError) {
      console.error("Error checking user existence:", userCheckError);
      error = "Failed to load user data";
      loading = false;
      return;
    }

    userRecord = existingUser;
    processingStatus = existingUser?.is_processed;

    await loadConnections();
  });

  async function loadConnections() {
    try {
      loading = true;

      if (processingStatus === 1) {
        // Load actual matches from database if processing is complete
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(
            `
            *,
            user2:user2_id (
              id,
              name,
              email,
              location,
              image_url,
              description
            )
          `,
          )
          .eq("user1_id", userRecord.id)
          .order("similarity_score", { ascending: false });

        if (matchesError) {
          console.error("Error loading matches:", matchesError);
          error = "Failed to load family connections";
        } else {
          // Transform matches data to connections format
          connections =
            matchesData?.map((match) => ({
              id: match.user2?.id,
              name: match.user2?.name || "Unknown",
              email: match.user2?.email,
              location: match.user2?.location || "Unknown",
              image_url: match.user2?.image_url,
              relationship: getRelationshipFromScore(match.similarity_score),
              connectionStrength: Math.round(match.similarity_score || 0),
              lastSeen: new Date(match.created_at),
              matchScore: Math.round(match.similarity_score || 0),
              isConfirmed: match.similarity_score >= 80,
              description: match.user2?.description,
            })) || [];

          filteredConnections = connections;
          generateGraphData();
        }
      } else {
        // No connections available if processing not complete
        connections = [];
        filteredConnections = [];
        nodes = [];
        links = [];
      }
    } catch (err) {
      console.error("Error loading connections:", err);
      error = "Failed to load connections";
    } finally {
      loading = false;
    }
  }

  function getRelationshipFromScore(score) {
    // Determine relationship type based on similarity score
    if (score >= 90) return "parent";
    if (score >= 80) return "sibling";
    if (score >= 70) return "cousin";
    if (score >= 60) return "uncle";
    return "unknown";
  }

  function generateGraphData() {
    if (connections.length === 0) {
      nodes = [];
      links = [];
      return;
    }

    // Create nodes including the current user
    nodes = [
      {
        id: "current-user",
        name: $user?.firstName || "You",
        x: 250,
        y: 200,
        isCurrentUser: true,
        connectionStrength: 100,
      },
      ...connections.map((conn, index) => ({
        id: conn.id,
        name: conn.name,
        relationship: conn.relationship,
        connectionStrength: conn.connectionStrength,
        isConfirmed: conn.isConfirmed,
        x: 250 + Math.cos((index * 2 * Math.PI) / connections.length) * 150,
        y: 200 + Math.sin((index * 2 * Math.PI) / connections.length) * 150,
        isCurrentUser: false,
      })),
    ];

    // Create links from current user to all connections
    links = connections.map((conn) => ({
      source: "current-user",
      target: conn.id,
      strength: conn.connectionStrength,
      relationship: conn.relationship,
    }));

    // Add some inter-family connections based on relationship types
    const familyGroups = {};
    connections.forEach((conn) => {
      if (!familyGroups[conn.relationship]) {
        familyGroups[conn.relationship] = [];
      }
      familyGroups[conn.relationship].push(conn);
    });

    // Connect family members of the same type
    Object.values(familyGroups).forEach((group) => {
      if (group.length > 1) {
        for (let i = 0; i < group.length - 1; i++) {
          links.push({
            source: group[i].id,
            target: group[i + 1].id,
            strength: Math.min(
              group[i].connectionStrength,
              group[i + 1].connectionStrength,
            ),
            relationship: "extended",
          });
        }
      }
    });
  }

  function getProcessingStatusInfo() {
    switch (processingStatus) {
      case null:
        return {
          title: t.processingStatuses.notStarted,
          description: t.processingStatuses.notStartedDesc,
          color: "bg-yellow-50 border-yellow-200 text-yellow-800",
          iconColor: "text-yellow-600",
        };
      case 0:
        return {
          title: t.processingStatuses.processing,
          description: t.processingStatuses.processingDesc,
          color: "bg-blue-50 border-blue-200 text-blue-800",
          iconColor: "text-blue-600",
        };
      case 1:
        return {
          title: t.processingStatuses.completed,
          description: t.processingStatuses.completedDesc,
          color: "bg-green-50 border-green-200 text-green-800",
          iconColor: "text-green-600",
        };
      default:
        return null;
    }
  }

  function handleSearch() {
    if (searchQuery.trim() === "") {
      filteredConnections = connections;
    } else {
      filteredConnections = connections.filter(
        (conn) =>
          conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    applyRelationshipFilter();
  }

  function applyRelationshipFilter() {
    if (selectedRelationshipFilter === "all") {
      return;
    }

    const filterMap = {
      parent: ["parent", "grandparent"],
      child: ["child", "grandchild"],
      sibling: ["sibling"],
      extended: ["uncle", "cousin", "unknown"],
    };

    filteredConnections = filteredConnections.filter((conn) =>
      filterMap[selectedRelationshipFilter]?.includes(conn.relationship),
    );
  }

  function handleConnectionClick(connection) {
    selectedConnection = connection;
    showConnectionDetails = true;
  }

  function getNodeColor(node) {
    if (node.isCurrentUser) return "#1A8161";

    const relationshipColors = {
      parent: "#3B82F6",
      child: "#10B981",
      sibling: "#8B5CF6",
      spouse: "#EC4899",
      grandparent: "#6366F1",
      grandchild: "#059669",
      uncle: "#F59E0B",
      cousin: "#F97316",
      unknown: "#6B7280",
    };

    return relationshipColors[node.relationship] || "#6B7280";
  }

  function getLinkColor(link) {
    const strength = link.strength;
    if (strength >= 80) return "#10B981";
    if (strength >= 60) return "#F59E0B";
    return "#EF4444";
  }

  function getLinkWidth(link) {
    const strength = link.strength;
    if (strength >= 80) return 3;
    if (strength >= 60) return 2;
    return 1;
  }

  function getNodeRadius(node) {
    if (node.isCurrentUser) return 25;
    return node.connectionStrength >= 80 ? 20 : 15;
  }

  function handleNodeClick(node) {
    if (node.isCurrentUser) return;

    const connection = connections.find((c) => c.id === node.id);
    if (connection) {
      selectedConnection = connection;
      showConnectionDetails = true;
    }
  }

  $: {
    handleSearch();
  }
</script>

<svelte:head>
  <title>{t.title} - ReuniteAI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
  <!-- Header -->
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <button
            on:click={() => goto("/dashboard")}
            class="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={20} strokeWidth={2} class="mr-2" />
            Back
          </button>
          <div class="flex items-center">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color: #1A8161;"
            >
              <Users size={20} strokeWidth={2} class="text-white" />
            </div>
            <div class="ml-3">
              <h1 class="text-lg font-semibold text-gray-900">Aman</h1>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- View Mode Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              on:click={() => (viewMode = "grid")}
              class={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid3X3 size={16} strokeWidth={2} class="mr-1 inline" />
              Grid
            </button>
            <button
              on:click={() => (viewMode = "graph")}
              class={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "graph"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Network size={16} strokeWidth={2} class="mr-1 inline" />
              Graph
            </button>
          </div>

          <button
            class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <Download size={20} strokeWidth={2} />
          </button>
          <button
            class="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <Share2 size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p class="text-gray-600">{t.subtitle}</p>
    </div>

    {#if processingStatus !== 1}
      <!-- Processing Status Info -->
      {@const statusInfo = getProcessingStatusInfo()}
      {#if statusInfo}
        <div class={`rounded-lg p-6 mb-6 ${statusInfo.color}`}>
          <div class="flex items-center">
            <Users
              size={24}
              strokeWidth={2}
              class={`mr-3 ${statusInfo.iconColor}`}
            />
            <div>
              <h3 class="text-lg font-semibold mb-2">{statusInfo.title}</h3>
              <p>{statusInfo.description}</p>
              {#if processingStatus === 0}
                <div class="mt-4 w-full bg-white rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full animate-pulse"
                    style="width: 60%"
                  ></div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <!-- Search and Filters - only show when processing is complete -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <Search
              size={20}
              strokeWidth={2}
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder={t.searchPlaceholder}
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div class="relative">
            <Filter
              size={20}
              strokeWidth={2}
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              bind:value={selectedRelationshipFilter}
              on:change={applyRelationshipFilter}
              class="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">{t.filterAll}</option>
              <option value="parent">{t.filterParent}</option>
              <option value="child">{t.filterChild}</option>
              <option value="sibling">{t.filterSibling}</option>
              <option value="extended">{t.filterExtended}</option>
            </select>
          </div>
        </div>
      </div>
    {/if}

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"
        ></div>
        {#if processingStatus === 0}
          <p class="ml-4 text-gray-600">Processing your profile data...</p>
        {/if}
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <Users size={20} strokeWidth={2} class="text-red-600 mr-3" />
          <p class="text-red-700">{error}</p>
        </div>
      </div>
    {:else if processingStatus !== 1}
      <div class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Heart size={40} strokeWidth={1.5} class="text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {processingStatus === null
            ? t.processingStatuses.notStarted
            : "Processing in Progress"}
        </h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {processingStatus === null
            ? t.processingStatuses.notStartedDesc
            : t.processingStatuses.processingDesc}
        </p>
      </div>
    {:else if filteredConnections.length === 0}
      <div class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Heart size={40} strokeWidth={1.5} class="text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {t.processingStatuses.noConnections}
        </h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {t.processingStatuses.noConnectionsDesc}
        </p>
      </div>
    {:else if viewMode === "grid"}
      <!-- Connections Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredConnections as connection}
          <div
            class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
            on:click={() => handleConnectionClick(connection)}
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"
                >
                  {#if connection.image_url}
                    <img
                      src={connection.image_url}
                      alt={connection.name}
                      class="w-12 h-12 rounded-full object-cover"
                    />
                  {:else}
                    <UserIcon size={24} strokeWidth={2} class="text-gray-400" />
                  {/if}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{connection.name}</h3>
                  <div class="flex items-center space-x-2 mt-1">
                    <span
                      class={`px-2 py-1 rounded-full text-xs font-medium ${getRelationshipColor(
                        connection.relationship,
                      )}`}
                    >
                      {t.relationshipTypes[connection.relationship]}
                    </span>
                    {#if connection.isConfirmed}
                      <span
                        class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                      >
                        Confirmed
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{t.connectionStrength}</span
                >
                <span
                  class={`font-semibold ${getConnectionStrengthColor(
                    connection.connectionStrength,
                  )}`}
                >
                  {connection.connectionStrength}%
                </span>
              </div>

              <div class="flex items-center text-sm text-gray-600">
                <MapPin size={14} strokeWidth={2} class="mr-2" />
                {connection.location}
              </div>

              <div class="flex items-center text-sm text-gray-600">
                <Calendar size={14} strokeWidth={2} class="mr-2" />
                {t.lastSeen}: {connection.lastSeen.toLocaleDateString()}
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex space-x-2">
                <button class="btn-outline text-xs px-3 py-2 flex-1">
                  {t.viewProfile}
                </button>
                <button class="btn-primary text-xs px-3 py-2 flex-1">
                  {t.contact}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Graph View -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Family Network Graph
          </h3>
          <div class="text-sm text-gray-600">
            Click on nodes to view details
          </div>
        </div>

        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <svg
            width="100%"
            height="500"
            viewBox="0 0 500 400"
            bind:this={svgContainer}
            class="bg-gray-50"
          >
            <!-- Define gradients for links -->
            <defs>
              <linearGradient
                id="strongConnection"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                <stop
                  offset="100%"
                  style="stop-color:#10B981;stop-opacity:0.3"
                />
              </linearGradient>
              <linearGradient
                id="mediumConnection"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
                <stop
                  offset="100%"
                  style="stop-color:#F59E0B;stop-opacity:0.3"
                />
              </linearGradient>
              <linearGradient
                id="weakConnection"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                <stop
                  offset="100%"
                  style="stop-color:#EF4444;stop-opacity:0.3"
                />
              </linearGradient>
            </defs>

            <!-- Render links -->
            {#each links as link}
              {@const sourceNode = nodes.find((n) => n.id === link.source)}
              {@const targetNode = nodes.find((n) => n.id === link.target)}
              {#if sourceNode && targetNode}
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={getLinkColor(link)}
                  stroke-width={getLinkWidth(link)}
                  opacity="0.6"
                  class="transition-all duration-300"
                />
              {/if}
            {/each}

            <!-- Render nodes -->
            {#each nodes as node}
              <g
                transform="translate({node.x}, {node.y})"
                class="cursor-pointer transition-all duration-300 hover:scale-110"
                on:click={() => handleNodeClick(node)}
              >
                <!-- Node circle -->
                <circle
                  r={getNodeRadius(node)}
                  fill={getNodeColor(node)}
                  stroke="white"
                  stroke-width="3"
                  class="drop-shadow-sm"
                />

                <!-- Node border for current user -->
                {#if node.isCurrentUser}
                  <circle
                    r={getNodeRadius(node) + 3}
                    fill="none"
                    stroke="#1A8161"
                    stroke-width="2"
                    stroke-dasharray="5,5"
                    opacity="0.7"
                  >
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="0"
                      to="360"
                      dur="10s"
                      repeatCount="indefinite"
                    />
                  </circle>
                {/if}

                <!-- Confirmed badge -->
                {#if node.isConfirmed && !node.isCurrentUser}
                  <circle
                    cx="15"
                    cy="-15"
                    r="8"
                    fill="#10B981"
                    stroke="white"
                    stroke-width="2"
                  />
                  <text
                    x="15"
                    y="-10"
                    text-anchor="middle"
                    fill="white"
                    font-size="10"
                    font-weight="bold">✓</text
                  >
                {/if}

                <!-- Node label -->
                <text
                  y={getNodeRadius(node) + 20}
                  text-anchor="middle"
                  fill="#374151"
                  font-size="12"
                  font-weight="600"
                  class="pointer-events-none"
                >
                  {node.name.split(" ")[0]}
                </text>

                <!-- Relationship label for non-current user -->
                {#if !node.isCurrentUser && node.relationship}
                  <text
                    y={getNodeRadius(node) + 35}
                    text-anchor="middle"
                    fill="#6B7280"
                    font-size="10"
                    class="pointer-events-none"
                  >
                    {t.relationshipTypes[node.relationship]}
                  </text>
                {/if}
              </g>
            {/each}
          </svg>
        </div>

        <!-- Graph Legend -->
        <div class="mt-4 flex flex-wrap gap-6 text-sm">
          <div class="flex items-center space-x-2">
            <div
              class="w-4 h-4 rounded-full"
              style="background-color: #1A8161;"
            ></div>
            <span>You</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-1 bg-green-500"></div>
            <span>Strong Connection (80%+)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-1 bg-yellow-500"></div>
            <span>Medium Connection (60-79%)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-1 bg-red-500"></div>
            <span>Weak Connection (&lt;60%)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div
              class="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs"
            >
              ✓
            </div>
            <span>Confirmed</span>
          </div>
        </div>
      </div>
    {/if}
  </main>

  <!-- Connection Details Modal -->
  {#if showConnectionDetails && selectedConnection}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Connection Details
          </h3>
          <button
            on:click={() => (showConnectionDetails = false)}
            class="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div class="text-center mb-6">
          <div
            class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            {#if selectedConnection.image_url}
              <img
                src={selectedConnection.image_url}
                alt={selectedConnection.name}
                class="w-20 h-20 rounded-full object-cover"
              />
            {:else}
              <UserIcon size={32} strokeWidth={2} class="text-gray-400" />
            {/if}
          </div>
          <h4 class="text-xl font-semibold text-gray-900">
            {selectedConnection.name}
          </h4>
          <span
            class={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRelationshipColor(
              selectedConnection.relationship,
            )}`}
          >
            {t.relationshipTypes[selectedConnection.relationship]}
          </span>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Match Score</span>
            <span class="font-semibold">{selectedConnection.matchScore}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">{t.connectionStrength}</span>
            <span
              class={`font-semibold ${getConnectionStrengthColor(
                selectedConnection.connectionStrength,
              )}`}
            >
              {selectedConnection.connectionStrength}%
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">{t.location}</span>
            <span class="text-gray-900">{selectedConnection.location}</span>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <button class="btn-primary w-full flex items-center justify-center">
            <Phone size={16} strokeWidth={2} class="mr-2" />
            {t.contact}
          </button>
          <button class="btn-outline w-full">
            {t.shareConnection}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.btn-primary) {
    background-color: #1a8161;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    border: none;
    cursor: pointer;
  }

  :global(.btn-primary:hover) {
    background-color: #156b54;
  }

  :global(.btn-outline) {
    background-color: transparent;
    color: #1a8161;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease-in-out;
    border: 1px solid #1a8161;
    cursor: pointer;
  }

  :global(.btn-outline:hover) {
    background-color: #1a8161;
    color: white;
  }

  svg text {
    user-select: none;
  }

  .drop-shadow-sm {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
</style>
