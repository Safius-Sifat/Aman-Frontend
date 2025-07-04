<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/user.js";
  import { language } from "$lib/stores/language.js";
  import { supabase } from "$lib/supabase.js";
  import {
    Users,
    Bell,
    Share2,
    LogOut,
    User,
    ChevronRight,
    Settings,
    AlertCircle,
  } from "lucide-svelte";

  let matches = [];
  let notifications = [];
  let loading = true;
  let error = "";
  let currentUser = null;
  let isNewUser = false;
  let userRecord = null;
  let processingStatus = null; // null, 0, or 1

  const translations = {
    en: {
      title: "Dashboard",
      welcome: "Welcome back",
      potentialMatches: "Potential Family Matches",
      noMatches: "No potential matches found yet",
      matchesDesc:
        "Our AI system is continuously analyzing your data to find potential family connections",
      recentActivity: "Recent Activity",
      viewConnections: "View Connection Graph",
      updateProfile: "Update Profile",
      settings: "Settings",
      logout: "Logout",
      matchScore: "Match Score",
      viewDetails: "View Details",
      contact: "Contact",
      similarity: "Similarity",
      facial: "Facial",
      voice: "Voice",
      information: "Information",
      newMatch: "New potential match found",
      profileUpdated: "Profile updated successfully",
      systemUpdate: "System analysis completed",
      processingStatuses: {
        notStarted: "Profile Processing Not Started",
        notStartedDesc:
          "Your profile data is ready but processing hasn't begun yet. Please wait for our system to start analyzing your information.",
        processing: "Profile Being Processed",
        processingDesc:
          "Our AI system is currently analyzing your data to find potential family matches. This may take some time.",
        completed: "Profile Processing Complete",
        completedDesc:
          "Your profile has been processed and we're actively searching for family matches.",
        noMatches: "No matches found yet",
        noMatchesDesc:
          "Keep checking back as we continuously search for new potential family connections.",
      },
    },
    es: {
      title: "Panel de Control",
      welcome: "Bienvenido de vuelta",
      potentialMatches: "Posibles Coincidencias Familiares",
      noMatches: "Aún no se han encontrado coincidencias potenciales",
      matchesDesc:
        "Nuestro sistema de IA está analizando continuamente sus datos para encontrar posibles conexiones familiares",
      recentActivity: "Actividad Reciente",
      viewConnections: "Ver Gráfico de Conexiones",
      updateProfile: "Actualizar Perfil",
      settings: "Configuraciones",
      logout: "Cerrar Sesión",
      matchScore: "Puntuación de Coincidencia",
      viewDetails: "Ver Detalles",
      contact: "Contactar",
      similarity: "Similitud",
      facial: "Facial",
      voice: "Voz",
      information: "Información",
      newMatch: "Nueva coincidencia potencial encontrada",
      profileUpdated: "Perfil actualizado exitosamente",
      systemUpdate: "Análisis del sistema completado",
      processingStatuses: {
        notStarted: "Procesamiento de Perfil No Iniciado",
        notStartedDesc:
          "Los datos de tu perfil están listos pero el procesamiento aún no ha comenzado. Por favor espera a que nuestro sistema comience a analizar tu información.",
        processing: "Perfil Siendo Procesado",
        processingDesc:
          "Nuestro sistema de IA está analizando actualmente tus datos para encontrar posibles coincidencias familiares. Esto puede tomar algún tiempo.",
        completed: "Procesamiento de Perfil Completo",
        completedDesc:
          "Tu perfil ha sido procesado y estamos buscando activamente coincidencias familiares.",
        noMatches: "Aún no se encontraron coincidencias",
        noMatchesDesc:
          "Sigue revisando ya que buscamos continuamente nuevas conexiones familiares potenciales.",
      },
    },
    ar: {
      title: "لوحة التحكم",
      welcome: "مرحباً بك مرة أخرى",
      potentialMatches: "التطابقات العائلية المحتملة",
      noMatches: "لم يتم العثور على تطابقات محتملة بعد",
      matchesDesc:
        "يقوم نظام الذكاء الاصطناعي لدينا بتحليل بياناتك باستمرار للعثور على اتصالات عائلية محتملة",
      recentActivity: "النشاط الأخير",
      viewConnections: "عرض رسم الاتصالات",
      updateProfile: "تحديث الملف الشخصي",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      matchScore: "درجة التطابق",
      viewDetails: "عرض التفاصيل",
      contact: "اتصال",
      similarity: "التشابه",
      facial: "الوجه",
      voice: "الصوت",
      information: "المعلومات",
      newMatch: "تم العثور على تطابق محتمل جديد",
      profileUpdated: "تم تحديث الملف الشخصي بنجاح",
      systemUpdate: "تم الانتهاء من تحليل النظام",
      processingStatuses: {
        notStarted: "لم يبدأ معالجة الملف الشخصي",
        notStartedDesc:
          "بيانات ملفك الشخصي جاهزة ولكن المعالجة لم تبدأ بعد. يرجى انتظار نظامنا لبدء تحليل معلوماتك.",
        processing: "جاري معالجة الملف الشخصي",
        processingDesc:
          "نظام الذكاء الاصطناعي لدينا يحلل حاليًا بياناتك للعثور على تطابقات عائلية محتملة. قد يستغرق هذا بعض الوقت.",
        completed: "اكتملت معالجة الملف الشخصي",
        completedDesc:
          "تمت معالجة ملفك الشخصي ونحن نبحث بنشاط عن تطابقات عائلية.",
        noMatches: "لم يتم العثور على تطابقات بعد",
        noMatchesDesc:
          "استمر في المراجعة حيث نبحث باستمرار عن اتصالات عائلية محتملة جديدة.",
      },
    },
  };

  $: t = translations[$language] || translations.en;
  $: isRtl = $language === "ar";

  onMount(async () => {
    // Check if user is authenticated with Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      goto("/");
      return;
    }

    currentUser = session.user;

    // Update user store with Supabase user data
    user.set({
      id: currentUser.id,
      email: currentUser.email,
      firstName:
        currentUser.user_metadata?.full_name?.split(" ")[0] ||
        currentUser.user_metadata?.name ||
        "User",
      lastName:
        currentUser.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
        "",
      avatar: currentUser.user_metadata?.avatar_url || null,
    });

    // Check if user exists in our users table and get processing status
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("*")
      .eq("email", currentUser.email)
      .single();
    // userRecord = existingUser;
    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking user existence:", userCheckError);
    } else if (!existingUser) {
      isNewUser = true;
      processingStatus = null;
    } else {
      userRecord = existingUser;
      processingStatus = existingUser.is_processed;
    }

    // Load registration data from localStorage if it exists and user is new
    const registrationData = localStorage.getItem("registrationData");
    if (registrationData && isNewUser) {
      try {
        const data = JSON.parse(registrationData);
        await processNewUserRegistration(data);
        localStorage.removeItem("registrationData");
      } catch (err) {
        console.error("Error processing registration data:", err);
      }
    }

    await loadDashboardData();
  });

  async function processNewUserRegistration(data) {
    try {
      loading = true;

      let imageUrl = null;
      let voiceUrl = null;

      // Upload image to Supabase storage if exists
      if (data.capturedImage) {
        const imageBlob = await fetch(data.capturedImage).then((r) => r.blob());
        const imageFileName = `${currentUser.id}_photo_${Date.now()}.jpg`;

        const { data: imageUpload, error: imageError } = await supabase.storage
          .from("user-uploads")
          .upload(`photos/${imageFileName}`, imageBlob, {
            contentType: "image/jpeg",
          });

        if (imageError) {
          console.error("Error uploading image:", imageError);
        } else {
          const { data: imagePublicUrl } = supabase.storage
            .from("user-uploads")
            .getPublicUrl(`photos/${imageFileName}`);
          imageUrl = imagePublicUrl.publicUrl;
        }
      }

      // Upload voice recording to Supabase storage if exists
      if (data.voiceRecording) {
        const voiceFileName = `${currentUser.id}_voice_${Date.now()}.wav`;

        const { data: voiceUpload, error: voiceError } = await supabase.storage
          .from("user-uploads")
          .upload(`voices/${voiceFileName}`, data.voiceRecording, {
            contentType: "audio/wav",
          });

        if (voiceError) {
          console.error("Error uploading voice:", voiceError);
        } else {
          const { data: voicePublicUrl } = supabase.storage
            .from("user-uploads")
            .getPublicUrl(`voices/${voiceFileName}`);
          voiceUrl = voicePublicUrl.publicUrl;
        }
      }

      // Extract user information from registration data
      const personalInfo = data.personalInfo || {};
      const fullName =
        `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim();

      // Insert new user into users table
      const { data: insertedUser, error: insertError } = await supabase
        .from("users")
        .insert({
          name:
            fullName ||
            currentUser.user_metadata?.full_name ||
            currentUser.email,
          email: currentUser.email,
          description: data.backgroundInfo || null,
          image_url: imageUrl,
          voice_url: voiceUrl,
          location: personalInfo.placeOfBirth || null,
          is_processed: null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting user:", insertError);
        error = "Failed to save user profile";
        return;
      }

      console.log("New user profile created successfully");
      userRecord = insertedUser;
      isNewUser = false;

      // Call the API to start processing
      await callProcessingAPI(insertedUser.id);
    } catch (err) {
      console.error("Error processing new user registration:", err);
      error = "Failed to process registration data";
    } finally {
      loading = false;
    }
  }

  async function callProcessingAPI(userId) {
    try {
      console.log("Calling processing API for user ID:", userId);

      // Call the processing API
      const response = await fetch(
        `http://194.195.117.171:8000/api/v1/users/search/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API response status:", response.status);

      // Refetch user data to check if processing status changed
      await refetchUserProcessingStatus();
    } catch (err) {
      console.error("Error calling processing API:", err);
    }
  }

  async function refetchUserProcessingStatus() {
    try {
      const { data: updatedUser, error: fetchError } = await supabase
        .from("users")
        .select("is_processed")
        .eq("email", currentUser.email)
        .single();

      if (fetchError) {
        console.error("Error refetching user data:", fetchError);
        return;
      }

      if (updatedUser && updatedUser.is_processed !== processingStatus) {
        console.log(
          "Processing status changed from",
          processingStatus,
          "to",
          updatedUser.is_processed,
        );
        processingStatus = updatedUser.is_processed;
      }
    } catch (err) {
      console.error("Error refetching user data:", err);
    }
  }

  async function processRegistrationData(data) {
    // This function is kept for backward compatibility but not used for new users
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: currentUser.id,
        background_info: data.backgroundInfo,
        personal_info: data.personalInfo,
        additional_info: data.additionalInfo,
        has_photo: !!data.capturedImage,
        has_voice: !!data.voiceRecording,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error storing registration data:", error);
      }
    } catch (err) {
      console.error("Error processing registration data:", err);
    }
  }

  async function loadDashboardData() {
    try {
      loading = true;

      if (userRecord) {
        // alert("User record found");
        // Load matches if userRecord exists
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
          .order("match_score", { ascending: false })
          .limit(10);

        if (matchesError) {
          console.error("Error loading matches:", matchesError);
        } else {
          // Transform matches data for display
          matches =
            matchesData?.map((match) => ({
              id: match.id,
              name: match.user2?.name || "Unknown",
              relationship: "Potential Family Member",
              location: match.user2?.location || "Unknown",
              score: match.match_score * 100 || 0,
              facialScore: Math.round(match.facial_similarity || 0),
              voiceScore: Math.round(match.voice_similarity || 0),
              infoScore: Math.round(match.text_similarity || 0),
              image_url: match.user2?.image_url,
              description: match.user2?.description,
            })) || [];
        }
      } else {
        // No matches available if userRecord doesn't exist
        matches = [];
      }

      // Create notifications based on processing status
      notifications = [];

      if (processingStatus === null) {
        notifications.push({
          message: "Profile data uploaded, waiting for processing to begin",
          created_at: new Date().toISOString(),
        });
      } else if (processingStatus === 0) {
        notifications.push({
          message: "Profile processing started - AI analysis in progress",
          created_at: new Date().toISOString(),
        });
      } else if (processingStatus === 1) {
        notifications.push({
          message: t.newMatch,
          created_at: new Date().toISOString(),
        });
        notifications.push({
          message: "Profile processing completed successfully",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        });
      }
    } catch (err) {
      error = "Failed to load dashboard data";
      console.error("Dashboard data loading error:", err);
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        user.set(null);
        localStorage.clear();
        goto("/");
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout even if there's an error
      user.set(null);
      localStorage.clear();
      goto("/");
    }
  }

  function getMatchScoreColor(score) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-gray-600";
  }

  function getMatchScoreBg(score) {
    if (score >= 80) return "bg-emerald-100";
    if (score >= 60) return "bg-amber-100";
    return "bg-gray-100";
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
</script>

<svelte:head>
  <title>{t.title} - Aman</title>
</svelte:head>

<div class="min-h-screen bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
  <!-- Header -->

  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
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
          <button
            on:click={() => goto("/connections")}
            class="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            <Share2 size={16} strokeWidth={2} class="mr-2" />
            {t.viewConnections}
          </button>

          <div class="relative">
            <button
              class="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              <Bell size={16} strokeWidth={2} class="mr-2" />
              {#if notifications.length > 0}
                <span
                  class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {notifications.length}
                </span>
              {/if}
            </button>
          </div>

          <button
            on:click={handleLogout}
            class="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            <LogOut size={16} strokeWidth={2} class="mr-2" />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        {t.welcome}, {$user?.firstName || "User"}!
      </h1>
      <p class="text-gray-600">{t.matchesDesc}</p>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"
        ></div>
        {#if isNewUser}
          <p class="ml-4 text-gray-600">Setting up your profile...</p>
        {:else if processingStatus === 0}
          <p class="ml-4 text-gray-600">Processing your profile data...</p>
        {/if}
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <AlertCircle size={20} strokeWidth={2} class="text-red-600 mr-3" />
          <p class="text-red-700">{error}</p>
        </div>
      </div>
    {:else}
      {#if isNewUser}
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <Users size={20} strokeWidth={2} class="text-green-600 mr-3" />
            <p class="text-green-700">
              Welcome! Your profile has been created and is being processed for
              family matching.
            </p>
          </div>
        </div>
      {:else if processingStatus !== 1}
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
      {/if}

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Potential Matches -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">
                {t.potentialMatches}
              </h2>
              {#if processingStatus === 1 && matches.length > 0}
                <button
                  on:click={() => goto("/connections")}
                  class="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  {t.viewConnections}
                </button>
              {/if}
            </div>

            {#if processingStatus !== 1}
              <div class="text-center py-12">
                <div
                  class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Users size={32} strokeWidth={1.5} class="text-gray-400" />
                </div>
                <p class="text-gray-500 text-lg mb-2">
                  {processingStatus === null
                    ? t.processingStatuses.notStarted
                    : "Processing in progress..."}
                </p>
                <p class="text-gray-400 text-sm">
                  {processingStatus === null
                    ? t.processingStatuses.notStartedDesc
                    : t.processingStatuses.processingDesc}
                </p>
              </div>
            {:else if matches.length === 0}
              <div class="text-center py-12">
                <div
                  class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Users size={32} strokeWidth={1.5} class="text-gray-400" />
                </div>
                <p class="text-gray-500 text-lg mb-2">
                  {t.processingStatuses.noMatches}
                </p>
                <p class="text-gray-400 text-sm">
                  {t.processingStatuses.noMatchesDesc}
                </p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each matches as match}
                  <div
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div
                          class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
                        >
                          {#if match.image_url}
                            <img
                              src={match.image_url}
                              alt={match.name}
                              class="w-12 h-12 object-cover"
                            />
                          {:else}
                            <User
                              size={24}
                              strokeWidth={2}
                              class="text-gray-400"
                            />
                          {/if}
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-900">
                            {match.name}
                          </h3>
                          <p class="text-sm text-gray-600">
                            {match.relationship}
                          </p>
                          <p class="text-xs text-gray-500">{match.location}</p>
                        </div>
                      </div>

                      <div class="flex items-center space-x-3">
                        <div class="text-right">
                          <div
                            class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreBg(
                              match.score,
                            )}`}
                          >
                            <span class={getMatchScoreColor(match.score)}>
                              {match.score}% {t.matchScore}
                            </span>
                          </div>
                          <div class="text-xs text-gray-500 mt-1">
                            {t.facial}: {match.facialScore}% |
                            {t.voice}: {match.voiceScore}% |
                            {t.information}: {match.infoScore}%
                          </div>
                        </div>

                        <div class="flex space-x-2">
                          <button class="btn-outline text-xs px-3 py-1">
                            {t.viewDetails}
                          </button>
                          <button class="btn-primary text-xs px-3 py-1">
                            {t.contact}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <button
                on:click={() => goto("/connections")}
                class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
                disabled={processingStatus !== 1}
                class:opacity-50={processingStatus !== 1}
              >
                <div class="flex items-center">
                  <Share2
                    size={16}
                    strokeWidth={2}
                    class="text-gray-400 mr-3"
                  />
                  <span class="text-sm text-gray-700">{t.viewConnections}</span>
                </div>
                <ChevronRight size={16} strokeWidth={2} class="text-gray-400" />
              </button>

              <button
                on:click={() => goto("/profile")}
                class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <User size={16} strokeWidth={2} class="text-gray-400 mr-3" />
                  <span class="text-sm text-gray-700">{t.updateProfile}</span>
                </div>
                <ChevronRight size={16} strokeWidth={2} class="text-gray-400" />
              </button>

              <button
                on:click={() => goto("/settings")}
                class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <Settings
                    size={16}
                    strokeWidth={2}
                    class="text-gray-400 mr-3"
                  />
                  <span class="text-sm text-gray-700">{t.settings}</span>
                </div>
                <ChevronRight size={16} strokeWidth={2} class="text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">{t.recentActivity}</h3>
            <div class="space-y-3">
              {#each notifications as notification}
                <div class="flex items-start space-x-3">
                  <div
                    class={`w-2 h-2 rounded-full mt-2 ${
                      processingStatus === 1
                        ? "bg-green-500"
                        : processingStatus === 0
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                  ></div>
                  <div>
                    <p class="text-sm text-gray-700">{notification.message}</p>
                    <p class="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              {/each}

              {#if notifications.length === 0}
                <p class="text-sm text-gray-500">No recent activity</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  :global(.card) {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

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
</style>
