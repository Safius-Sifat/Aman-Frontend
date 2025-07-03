<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { language } from '$lib/stores/language.js';
  import { user } from '$lib/stores/user.js';
  import { page } from '$app/stores';
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
    // Initialize language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('language') || 
                          navigator.language.split('-')[0] || 'en';
    language.set(savedLanguage);
    
    // Initialize user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user.set(JSON.parse(savedUser));
    }
  });
  
  $: if (mounted && $language) {
    localStorage.setItem('language', $language);
  }
  
  $: if (mounted && $user) {
    localStorage.setItem('user', JSON.stringify($user));
  }
</script>

<div class="min-h-screen bg-slate-50">
  <main class="min-h-screen">
    <slot />
  </main>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
