<script>
    import { createEventDispatcher } from "svelte";
    import { Mic, AlertCircle } from "lucide-svelte";

    const dispatch = createEventDispatcher();

    export let backgroundInfo = "";
    export let language = "en";
    export let isListening = false;
    export let speechSupported = false;
    export let error = "";

    let speechRecognition = null;

    const translations = {
        en: {
            placeholder:
                "You can include:\n• Your family background and members\n• Places where you lived or visited\n• Your occupation, education, or skills\n• Memorable events or experiences\n• People you know or distinctive features\n• Your current situation\n• Anything that might help identify you or connect you with your family",
            speechTooltip: "Use voice dictation",
        },
        es: {
            placeholder:
                "Puedes incluir:\n• Tus antecedentes familiares y miembros\n• Lugares donde viviste o visitaste\n• Tu ocupación, educación o habilidades\n• Eventos o experiencias memorables\n• Personas que conoces o características distintivas\n• Tu situación actual\n• Cualquier cosa que pueda ayudar a identificarte o conectarte con tu familia",
            speechTooltip: "Usar dictado por voz",
        },
        ar: {
            placeholder:
                "يمكنك تضمين:\n• خلفيتك العائلية والأعضاء\n• الأماكن التي عشت فيها أو زرتها\n• مهنتك أو تعليمك أو مهاراتك\n• الأحداث أو التجارب التي لا تُنسى\n• الأشخاص الذين تعرفهم أو الميزات المميزة\n• وضعك الحالي\n• أي شيء قد يساعد في تحديد هويتك أو ربطك بعائلتك",
            speechTooltip: "استخدام الإملاء الصوتي",
        },
    };

    $: t = translations[language] || translations.en;
    $: isRtl = language === "ar";

    function startSpeechRecognition() {
        if (!speechSupported) return;

        try {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            speechRecognition = new SpeechRecognition();

            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.lang =
                language === "ar"
                    ? "ar-SA"
                    : language === "es"
                      ? "es-ES"
                      : "en-US";

            speechRecognition.onstart = () => {
                isListening = true;
                dispatch("listening-changed", { isListening: true });
            };

            speechRecognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript + " ";
                    }
                }
                if (transcript) {
                    backgroundInfo += transcript;
                    dispatch("text-changed", { text: backgroundInfo });
                }
            };

            speechRecognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                isListening = false;
                dispatch("listening-changed", { isListening: false });
                dispatch("error", {
                    message: "Speech recognition error. Please try again.",
                });
            };

            speechRecognition.onend = () => {
                isListening = false;
                dispatch("listening-changed", { isListening: false });
            };

            speechRecognition.start();
        } catch (err) {
            console.error("Speech recognition initialization error:", err);
            dispatch("error", {
                message: "Speech recognition not supported in this browser.",
            });
        }
    }

    function stopSpeechRecognition() {
        if (speechRecognition) {
            speechRecognition.stop();
            isListening = false;
            dispatch("listening-changed", { isListening: false });
        }
    }

    function toggleSpeechRecognition() {
        if (isListening) {
            stopSpeechRecognition();
        } else {
            startSpeechRecognition();
        }
    }

    function handleTextInput(event) {
        backgroundInfo = event.target.value;
        dispatch("text-changed", { text: backgroundInfo });
    }
</script>

<div class="background-info-form" dir={isRtl ? "rtl" : "ltr"}>
    <div class="mb-6">
        <label
            for="backgroundInfo"
            class="block text-sm font-medium text-gray-700 mb-2"
        >
            Background Information *
        </label>
        <div class="relative">
            <textarea
                id="backgroundInfo"
                bind:value={backgroundInfo}
                on:input={handleTextInput}
                placeholder={t.placeholder}
                class="w-full h-64 px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:border-transparent resize-none transition-all duration-200"
                style="focus:ring-color: rgba(26, 129, 97, 0.2); focus:border-color: #1A8161;"
                rows="12"
            ></textarea>

            <!-- Speech Recognition Button -->
            {#if speechSupported}
                <button
                    type="button"
                    on:click={toggleSpeechRecognition}
                    class="absolute bottom-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    class:bg-red-100={isListening}
                    class:text-red-600={isListening}
                    class:text-gray-500={!isListening}
                    title={t.speechTooltip}
                >
                    {#if isListening}
                        <div
                            class="w-4 h-4 bg-red-600 rounded-full animate-pulse"
                        ></div>
                    {:else}
                        <Mic size={16} strokeWidth={2} />
                    {/if}
                </button>
            {/if}
        </div>

        <div class="mt-2 text-sm text-gray-500">
            {backgroundInfo.length} characters
        </div>
    </div>

    {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div class="flex items-center">
                <AlertCircle
                    size={20}
                    strokeWidth={2}
                    class="text-red-600 mr-2"
                />
                <p class="text-red-800">{error}</p>
            </div>
        </div>
    {/if}
</div>

<style>
    .background-info-form {
        max-width: 100%;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>
