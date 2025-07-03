<script>
  export let currentStep = 1;
  export let totalSteps = 4;
  
  $: progress = (currentStep / totalSteps) * 100;
  
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Biometric Data' },
    { number: 3, label: 'Additional Info' },
    { number: 4, label: 'Review & Submit' }
  ];
</script>

<div class="w-full">
  <!-- Progress Bar -->
  <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
    <div 
      class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style="width: {progress}%"
    ></div>
  </div>
  
  <!-- Step Indicators -->
  <div class="flex justify-between items-center">
    {#each steps as step}
      <div class="flex flex-col items-center">
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 {
            step.number <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }"
        >
          {#if step.number < currentStep}
            <i data-lucide="check" class="w-4 h-4"></i>
          {:else}
            {step.number}
          {/if}
        </div>
        <span class="text-xs text-gray-600 mt-2 text-center max-w-[80px]">
          {step.label}
        </span>
      </div>
    {/each}
  </div>
</div>

<script>
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
</script>
