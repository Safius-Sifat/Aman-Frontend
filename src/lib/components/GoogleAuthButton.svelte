<script>
    import { createEventDispatcher } from "svelte";
    import { supabase } from "../supabase.js";
    import { Loader2 } from "lucide-svelte";

    const dispatch = createEventDispatcher();

    export let language = "en";
    export let registrationData = null;

    let authLoading = false;
    let authError = "";

    const translations = {
        en: {
            signInWithGoogle: "Sign in with Google",
            signingIn: "Signing in...",
            authError: "Authentication failed. Please try again.",
            description:
                "Sign in with Google to securely save your registration data and access your dashboard.",
        },
        es: {
            signInWithGoogle: "Iniciar sesión con Google",
            signingIn: "Iniciando sesión...",
            authError: "Error de autenticación. Por favor, inténtalo de nuevo.",
            description:
                "Inicia sesión con Google para guardar de forma segura tus datos de registro y acceder a tu panel.",
        },
        ar: {
            signInWithGoogle: "تسجيل الدخول باستخدام Google",
            signingIn: "جاري تسجيل الدخول...",
            authError: "فشل في المصادقة. يرجى المحاولة مرة أخرى.",
            description:
                "قم بتسجيل الدخول باستخدام Google لحفظ بيانات التسجيل بأمان والوصول إلى لوحة التحكم الخاصة بك.",
        },
    };

    $: t = translations[language] || translations.en;

    async function signInWithGoogle() {
        authLoading = true;
        authError = "";

        try {
            // Store registration data locally before auth
            if (registrationData) {
                localStorage.setItem(
                    "registrationData",
                    JSON.stringify({
                        ...registrationData,
                        timestamp: new Date().toISOString(),
                    }),
                );
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (data) {
                // User is signed in
                dispatch("auth-success", { data });
            }

            if (error) {
                authError = t.authError;
                console.error("Google auth error:", error);
                dispatch("auth-error", { error: authError });
            } else {
                dispatch("auth-success", { data });
            }
        } catch (err) {
            console.error("Authentication error:", err);
            authError = t.authError;
            dispatch("auth-error", { error: authError });
        } finally {
            authLoading = false;
        }
    }
</script>

<div class="google-auth-container">
    <div class="mb-6">
        <p class="text-gray-600 mb-6 text-center">
            {t.description}
        </p>
    </div>

    <!-- Google Sign In Button -->
    <button
        on:click={signInWithGoogle}
        class="btn-google w-full max-w-sm mx-auto"
        disabled={authLoading}
    >
        {#if authLoading}
            <Loader2 size={20} strokeWidth={2} class="mr-3 animate-spin" />
            {t.signingIn}
        {:else}
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            {t.signInWithGoogle}
        {/if}
    </button>

    <!-- Authentication Error -->
    {#if authError}
        <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center justify-center">
                <p class="text-red-800 text-sm">{authError}</p>
            </div>
        </div>
    {/if}
</div>

<style>
    .google-auth-container {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
    }

    :global(.btn-google) {
        background-color: white;
        color: #374151;
        padding: 0.875rem 1.5rem;
        border-radius: 1rem;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
        border: 2px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    :global(.btn-google:hover) {
        background-color: #f9fafb;
        border-color: #d1d5db;
        transform: translateY(-1px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    :global(.btn-google:active) {
        transform: translateY(0);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    :global(.btn-google:disabled) {
        background-color: #f9fafb;
        border-color: #e5e7eb;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        opacity: 0.7;
    }
</style>
