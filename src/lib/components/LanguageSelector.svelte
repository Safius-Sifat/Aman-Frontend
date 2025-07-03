<script>
  import { language } from '$lib/stores/language.js';
  
  let isOpen = false;
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' }
  ];
  
  $: currentLanguage = languages.find(lang => lang.code === $language) || languages[0];
  
  function selectLanguage(langCode) {
    language.set(langCode);
    isOpen = false;
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  function closeDropdown() {
    isOpen = false;
  }
</script>

<div class="relative">
  <button 
    on:click={toggleDropdown}
    class="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
    aria-haspopup="true"
    aria-expanded={isOpen}
  >
    <span class="text-lg">{currentLanguage.flag}</span>
    <span class="text-gray-700">{currentLanguage.name}</span>
    <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400"></i>
  </button>
  
  {#if isOpen}
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 z-10" 
      on:click={closeDropdown}
      aria-hidden="true"
    ></div>
    
    <!-- Dropdown Menu -->
    <div class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
      <div class="py-1">
        {#each languages as lang}
          <button
            on:click={() => selectLanguage(lang.code)}
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 {lang.code === $language ? 'bg-blue-50 text-blue-700' : ''}"
          >
            <span class="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {#if lang.code === $language}
              <i data-lucide="check" class="w-4 h-4 text-blue-600 ml-auto"></i>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
