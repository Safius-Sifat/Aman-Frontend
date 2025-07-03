<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/user.js';
  import { language } from '$lib/stores/language.js';
  
  let matches = [];
  let notifications = [];
  let loading = true;
  let error = '';
  
  const translations = {
    en: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      potentialMatches: 'Potential Family Matches',
      noMatches: 'No potential matches found yet',
      matchesDesc: 'Our AI system is continuously analyzing your data to find potential family connections',
      recentActivity: 'Recent Activity',
      viewConnections: 'View Connection Graph',
      updateProfile: 'Update Profile',
      settings: 'Settings',
      logout: 'Logout',
      matchScore: 'Match Score',
      viewDetails: 'View Details',
      contact: 'Contact',
      similarity: 'Similarity',
      facial: 'Facial',
      voice: 'Voice',
      information: 'Information',
      newMatch: 'New potential match found',
      profileUpdated: 'Profile updated successfully',
      systemUpdate: 'System analysis completed'
    },
    es: {
      title: 'Panel de Control',
      welcome: 'Bienvenido de vuelta',
      potentialMatches: 'Posibles Coincidencias Familiares',
      noMatches: 'Aún no se han encontrado coincidencias potenciales',
      matchesDesc: 'Nuestro sistema de IA está analizando continuamente sus datos para encontrar posibles conexiones familiares',
      recentActivity: 'Actividad Reciente',
      viewConnections: 'Ver Gráfico de Conexiones',
      updateProfile: 'Actualizar Perfil',
      settings: 'Configuraciones',
      logout: 'Cerrar Sesión',
      matchScore: 'Puntuación de Coincidencia',
      viewDetails: 'Ver Detalles',
      contact: 'Contactar',
      similarity: 'Similitud',
      facial: 'Facial',
      voice: 'Voz',
      information: 'Información',
      newMatch: 'Nueva coincidencia potencial encontrada',
      profileUpdated: 'Perfil actualizado exitosamente',
      systemUpdate: 'Análisis del sistema completado'
    },
    ar: {
      title: 'لوحة التحكم',
      welcome: 'مرحباً بك مرة أخرى',
      potentialMatches: 'التطابقات العائلية المحتملة',
      noMatches: 'لم يتم العثور على تطابقات محتملة بعد',
      matchesDesc: 'يقوم نظام الذكاء الاصطناعي لدينا بتحليل بياناتك باستمرار للعثور على اتصالات عائلية محتملة',
      recentActivity: 'النشاط الأخير',
      viewConnections: 'عرض رسم الاتصالات',
      updateProfile: 'تحديث الملف الشخصي',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      matchScore: 'درجة التطابق',
      viewDetails: 'عرض التفاصيل',
      contact: 'اتصال',
      similarity: 'التشابه',
      facial: 'الوجه',
      voice: 'الصوت',
      information: 'المعلومات',
      newMatch: 'تم العثور على تطابق محتمل جديد',
      profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
      systemUpdate: 'تم الانتهاء من تحليل النظام'
    }
  };
  
  $: t = translations[$language] || translations.en;
  $: isRtl = $language === 'ar';
  
  onMount(async () => {
    if (!$user) {
      goto('/');
      return;
    }
    
    await loadDashboardData();
  });
  
  async function loadDashboardData() {
    try {
      loading = true;
      
      // Load potential matches
      const matchesResponse = await fetch('/api/matching');
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        matches = matchesData.matches || [];
      }
      
      // Load notifications
      const notificationsResponse = await fetch('/api/notifications');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        notifications = notificationsData.notifications || [];
      }
      
    } catch (err) {
      error = 'Failed to load dashboard data';
    } finally {
      loading = false;
    }
  }
  
  function handleLogout() {
    user.set(null);
    localStorage.removeItem('user');
    goto('/');
  }
  
  function getMatchScoreColor(score) {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-gray-600';
  }
  
  function getMatchScoreBg(score) {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-amber-100';
    return 'bg-gray-100';
  }
</script>

<svelte:head>
  <title>{t.title} - ReuniteAI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i data-lucide="users" class="w-5 h-5 text-white"></i>
            </div>
            <div class="ml-3">
              <h1 class="text-lg font-semibold text-gray-900">ReuniteAI</h1>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <button 
            on:click={() => goto('/connections')}
            class="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            <i data-lucide="share-2" class="w-4 h-4 mr-2"></i>
            {t.viewConnections}
          </button>
          
          <div class="relative">
            <button class="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2">
              <i data-lucide="bell" class="w-4 h-4 mr-2"></i>
              {#if notifications.length > 0}
                <span class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              {/if}
            </button>
          </div>
          
          <button 
            on:click={handleLogout}
            class="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            <i data-lucide="log-out" class="w-4 h-4 mr-2"></i>
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
        {t.welcome}, {$user?.firstName || 'User'}!
      </h1>
      <p class="text-gray-600">
        {t.matchesDesc}
      </p>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 mr-3"></i>
          <p class="text-red-700">{error}</p>
        </div>
      </div>
    {:else}
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Potential Matches -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">{t.potentialMatches}</h2>
              <button 
                on:click={() => goto('/connections')}
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t.viewConnections}
              </button>
            </div>
            
            {#if matches.length === 0}
              <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i data-lucide="users" class="w-8 h-8 text-gray-400"></i>
                </div>
                <p class="text-gray-500 text-lg mb-2">{t.noMatches}</p>
                <p class="text-gray-400 text-sm">{t.matchesDesc}</p>
              </div>
            {:else}
              <div class="space-y-4">
                {#each matches as match}
                  <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <i data-lucide="user" class="w-6 h-6 text-gray-400"></i>
                        </div>
                        <div>
                          <h3 class="font-semibold text-gray-900">{match.name}</h3>
                          <p class="text-sm text-gray-600">{match.relationship}</p>
                          <p class="text-xs text-gray-500">{match.location}</p>
                        </div>
                      </div>
                      
                      <div class="flex items-center space-x-3">
                        <div class="text-right">
                          <div class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreBg(match.score)}`}>
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
                on:click={() => goto('/connections')}
                class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <i data-lucide="share-2" class="w-4 h-4 text-gray-400 mr-3"></i>
                  <span class="text-sm text-gray-700">{t.viewConnections}</span>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>
              </button>
              
              <button 
                on:click={() => goto('/profile')}
                class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <i data-lucide="user" class="w-4 h-4 text-gray-400 mr-3"></i>
                  <span class="text-sm text-gray-700">{t.updateProfile}</span>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>
              </button>
              
              <button 
                on:click={() => goto('/settings')}
                class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <i data-lucide="settings" class="w-4 h-4 text-gray-400 mr-3"></i>
                  <span class="text-sm text-gray-700">{t.settings}</span>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>
              </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">{t.recentActivity}</h3>
            <div class="space-y-3">
              {#each notifications as notification}
                <div class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p class="text-sm text-gray-700">{notification.message}</p>
                    <p class="text-xs text-gray-500">{notification.timestamp}</p>
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

<script>
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
</script>
