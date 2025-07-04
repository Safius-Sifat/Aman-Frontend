<script>
    import { Camera, Mic, User, CheckCircle, Check } from "lucide-svelte";

    export let currentStep = 1;
    export let totalSteps = 4;
    export let stepLabels = [];
    export let language = "en";

    const stepIcons = [Camera, Mic, User, CheckCircle];

    const stepColors = [
        "blue", // Photo step
        "emerald", // Voice step
        "amber", // Info step
        "green", // Complete step
    ];

    const translations = {
        en: {
            step: "Step",
            of: "of",
        },
        es: {
            step: "Paso",
            of: "de",
        },
        ar: {
            step: "خطوة",
            of: "من",
        },
    };

    $: t = translations[language] || translations.en;
    $: isRtl = language === "ar";
    $: progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    $: currentStepColor = stepColors[currentStep - 1] || "blue";
</script>

<div class="progress-slider" dir={isRtl ? "rtl" : "ltr"}>
    <!-- Progress Header -->
    <div class="flex justify-between items-center mb-6">
        <div
            class="flex items-center"
            class:space-x-4={!isRtl}
            class:space-x-reverse={isRtl}
        ></div>
    </div>

    <!-- Progress Bar Container -->
    <div class="relative mb-8">
        <!-- Background Track -->
        <div
            class="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner"
        >
            <!-- Animated Progress Fill -->
            <div
                class="h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                class:from-blue-400={currentStepColor === "blue"}
                class:via-blue-500={currentStepColor === "blue"}
                class:to-blue-600={currentStepColor === "blue"}
                class:from-emerald-400={currentStepColor === "emerald"}
                class:via-emerald-500={currentStepColor === "emerald"}
                class:to-emerald-600={currentStepColor === "emerald"}
                class:from-amber-400={currentStepColor === "amber"}
                class:via-amber-500={currentStepColor === "amber"}
                class:to-amber-600={currentStepColor === "amber"}
                class:from-green-400={currentStepColor === "green"}
                class:via-green-500={currentStepColor === "green"}
                class:to-green-600={currentStepColor === "green"}
                style="width: {progressPercentage}%"
            >
                <!-- Animated Shimmer Effect -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shimmer"
                ></div>

                <!-- Pulsing Glow Effect -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20 animate-pulse"
                ></div>
            </div>
        </div>

        <!-- Step Indicator Dots -->
        <div
            class="absolute top-0 left-0 w-full flex justify-between items-center transform -translate-y-1/2"
        >
            {#each Array(totalSteps) as _, index}
                {@const stepIcon = stepIcons[index]}
                {@const isCompleted = index + 1 < currentStep}
                {@const isCurrent = index + 1 === currentStep}
                {@const isFuture = index + 1 > currentStep}
                {@const stepColor = stepColors[index]}

                <div class="relative flex flex-col items-center group">
                    <!-- Step Circle with Icon -->
                    <div
                        class="w-10 h-10 rounded-full border-3 transition-all duration-500 flex items-center justify-center relative z-10 shadow-lg backdrop-blur-sm"
                        class:bg-blue-500={index + 1 <= currentStep &&
                            stepColor === "blue"}
                        class:border-blue-500={index + 1 <= currentStep &&
                            stepColor === "blue"}
                        class:bg-emerald-500={index + 1 <= currentStep &&
                            stepColor === "emerald"}
                        class:border-emerald-500={index + 1 <= currentStep &&
                            stepColor === "emerald"}
                        class:bg-amber-500={index + 1 <= currentStep &&
                            stepColor === "amber"}
                        class:border-amber-500={index + 1 <= currentStep &&
                            stepColor === "amber"}
                        class:bg-green-500={index + 1 <= currentStep &&
                            stepColor === "green"}
                        class:border-green-500={index + 1 <= currentStep &&
                            stepColor === "green"}
                        class:bg-white={isFuture}
                        class:border-gray-300={isFuture}
                        class:scale-125={isCurrent}
                        class:animate-bounce={isCurrent}
                    >
                        {#if isCompleted}
                            <!-- Completed step -->
                            <Check
                                size={16}
                                strokeWidth={3}
                                class="text-white animate-scale-in"
                            />
                        {:else if isCurrent}
                            <!-- Current step - pulsing icon -->
                            <svelte:component
                                this={stepIcon}
                                size={18}
                                strokeWidth={2}
                                class="text-white animate-pulse"
                            />
                        {:else}
                            <!-- Future step - muted icon -->
                            <svelte:component
                                this={stepIcon}
                                size={14}
                                strokeWidth={1.5}
                                class="text-gray-400"
                            />
                        {/if}

                        <!-- Animated Glow Ring for current step -->
                        {#if isCurrent}
                            <div
                                class="absolute inset-0 rounded-full animate-ping opacity-40"
                                class:bg-blue-400={currentStepColor === "blue"}
                                class:bg-emerald-400={currentStepColor ===
                                    "emerald"}
                                class:bg-amber-400={currentStepColor ===
                                    "amber"}
                                class:bg-green-400={currentStepColor ===
                                    "green"}
                            ></div>
                            <div
                                class="absolute inset-0 rounded-full animate-pulse opacity-60"
                                class:bg-blue-300={currentStepColor === "blue"}
                                class:bg-emerald-300={currentStepColor ===
                                    "emerald"}
                                class:bg-amber-300={currentStepColor ===
                                    "amber"}
                                class:bg-green-300={currentStepColor ===
                                    "green"}
                            ></div>
                        {/if}
                    </div>

                    <!-- Step Label with Enhanced Styling -->
                    {#if stepLabels[index]}
                        <div
                            class="absolute top-16 text-xs text-center whitespace-nowrap transition-all duration-500 px-3 py-1.5 rounded-full backdrop-blur-sm"
                            class:text-blue-700={index + 1 <= currentStep &&
                                stepColor === "blue"}
                            class:bg-blue-100={isCurrent &&
                                stepColor === "blue"}
                            class:border={isCurrent &&
                                (stepColor === "blue" ||
                                    stepColor === "emerald" ||
                                    stepColor === "amber" ||
                                    stepColor === "green")}
                            class:border-blue-300={isCurrent &&
                                stepColor === "blue"}
                            class:text-emerald-700={index + 1 <= currentStep &&
                                stepColor === "emerald"}
                            class:bg-emerald-100={isCurrent &&
                                stepColor === "emerald"}
                            class:border-emerald-300={isCurrent &&
                                stepColor === "emerald"}
                            class:text-amber-700={index + 1 <= currentStep &&
                                stepColor === "amber"}
                            class:bg-amber-100={isCurrent &&
                                stepColor === "amber"}
                            class:border-amber-300={isCurrent &&
                                stepColor === "amber"}
                            class:text-green-700={index + 1 <= currentStep &&
                                stepColor === "green"}
                            class:bg-green-100={isCurrent &&
                                stepColor === "green"}
                            class:border-green-300={isCurrent &&
                                stepColor === "green"}
                            class:font-semibold={isCurrent}
                            class:text-gray-500={isFuture}
                            class:bg-gray-50={isFuture}
                            class:transform={isCurrent}
                            class:scale-110={isCurrent}
                            class:shadow-lg={isCurrent}
                        >
                            {stepLabels[index]}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <!-- Bottom Spacing for Labels -->
    <div class="h-16"></div>
</div>

<style>
    .progress-slider {
        width: 100%;
        margin-bottom: 2rem;
    }

    .border-3 {
        border-width: 3px;
    }

    /* Enhanced Shimmer animation */
    @keyframes shimmer {
        0% {
            transform: translateX(-200%) skewX(-12deg);
        }
        100% {
            transform: translateX(300%) skewX(-12deg);
        }
    }

    .animate-shimmer {
        animation: shimmer 3s ease-in-out infinite;
    }

    /* Scale in animation for completed steps */
    @keyframes scale-in {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.3);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    /* Ensure proper spacing for step labels */
    .progress-slider .absolute.top-14 {
        transform: translateX(-50%);
        min-width: 60px;
    }

    /* Smooth transitions for all elements */
    .progress-slider * {
        transition: all 0.3s ease;
    }

    /* Enhanced hover effects */
    .group:hover .w-10 {
        transform: scale(1.15);
        transition: transform 0.2s ease;
    }

    /* Progress bar glow effect */
    .progress-slider .h-4 > div {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }

    /* RTL Support */
    [dir="rtl"] .space-x-reverse > * + * {
        margin-right: 1rem;
        margin-left: 0;
    }
</style>
