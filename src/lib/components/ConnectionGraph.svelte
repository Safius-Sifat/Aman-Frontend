<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { language } from "$lib/stores/language.js";

  export let connections = { nodes: [], links: [] };

  const dispatch = createEventDispatcher();

  let container;
  let svg;
  let simulation;
  let width = 800;
  let height = 600;
  let mounted = false;

  const translations = {
    en: {
      loading: "Loading graph...",
      noData: "No connections to display",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      resetView: "Reset View",
      centerView: "Center View",
    },
    es: {
      loading: "Cargando gráfico...",
      noData: "No hay conexiones para mostrar",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
      resetView: "Restablecer Vista",
      centerView: "Centrar Vista",
    },
    ar: {
      loading: "جاري تحميل الرسم البياني...",
      noData: "لا توجد اتصالات للعرض",
      zoomIn: "تكبير",
      zoomOut: "تصغير",
      resetView: "إعادة تعيين العرض",
      centerView: "توسيط العرض",
    },
  };

  $: t = translations[$language] || translations.en;
  $: if (mounted && connections.nodes.length > 0) {
    updateGraph();
  }

  onMount(() => {
    mounted = true;
    initializeGraph();
    updateGraph();

    // Handle window resize
    const handleResize = () => {
      if (container) {
        width = container.clientWidth;
        height = container.clientHeight;
        if (svg) {
          svg.attr("width", width).attr("height", height);
        }
        if (simulation) {
          simulation.force("center", d3.forceCenter(width / 2, height / 2));
          simulation.alpha(0.3).restart();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (simulation) {
        simulation.stop();
      }
    };
  });

  function initializeGraph() {
    if (!container || typeof d3 === "undefined") return;

    // Clear existing content
    d3.select(container).selectAll("*").remove();

    // Create SVG
    svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        svg.select("g").attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group
    const g = svg.append("g");

    // Add definitions for gradients and patterns
    const defs = svg.append("defs");

    // Gradient for strong connections
    const strongGradient = defs
      .append("linearGradient")
      .attr("id", "strong-connection")
      .attr("gradientUnits", "userSpaceOnUse");

    strongGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#059669")
      .attr("stop-opacity", 1);

    strongGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.8);

    // Gradient for medium connections
    const mediumGradient = defs
      .append("linearGradient")
      .attr("id", "medium-connection")
      .attr("gradientUnits", "userSpaceOnUse");

    mediumGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 1);

    mediumGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#fbbf24")
      .attr("stop-opacity", 0.8);

    // Shadow filter
    const filter = defs
      .append("filter")
      .attr("id", "shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter
      .append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 3)
      .attr("flood-color", "#000000")
      .attr("flood-opacity", 0.1);
  }

  function updateGraph() {
    if (!svg || !connections.nodes.length) return;

    const g = svg.select("g");

    // Clear existing elements
    g.selectAll("*").remove();

    // Create simulation
    simulation = d3
      .forceSimulation(connections.nodes)
      .force(
        "link",
        d3
          .forceLink(connections.links)
          .id((d) => d.id)
          .distance((d) => {
            // Vary distance based on connection strength
            if (d.strength === "strong") return 100;
            if (d.strength === "medium") return 120;
            return 150;
          }),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create links
    const link = g
      .append("g")
      .selectAll("line")
      .data(connections.links)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        if (d.strength === "strong") return "url(#strong-connection)";
        if (d.strength === "medium") return "url(#medium-connection)";
        return "#9CA3AF";
      })
      .attr("stroke-width", (d) => {
        if (d.strength === "strong") return 4;
        if (d.strength === "medium") return 3;
        return 2;
      })
      .attr("stroke-opacity", 0.8)
      .attr("stroke-dasharray", (d) =>
        d.strength === "weak" ? "5,5" : "none",
      );

    // Create nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(connections.nodes)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended),
      );

    // Add circles for nodes
    node
      .append("circle")
      .attr("r", (d) => (d.type === "self" ? 20 : 16))
      .attr("fill", (d) => (d.type === "self" ? "#2563EB" : "#9CA3AF"))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("filter", "url(#shadow)")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.type === "self" ? 24 : 20);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.type === "self" ? 20 : 16);
      })
      .on("click", function (event, d) {
        dispatch("nodeClick", d);
      });

    // Add icons to nodes
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", (d) => (d.type === "self" ? "14px" : "12px"))
      .attr("font-family", "Font Awesome 6 Free")
      .attr("font-weight", "900")
      .text((d) => (d.type === "self" ? "👤" : "👥"))
      .style("pointer-events", "none");

    // Add labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 35)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text((d) => d.name)
      .style("pointer-events", "none");

    // Add location labels
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 50)
      .attr("font-size", "10px")
      .attr("fill", "#6B7280")
      .text((d) => d.location)
      .style("pointer-events", "none");

    // Add connection strength labels to links
    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(connections.links)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#374151")
      .attr("font-weight", "bold")
      .text((d) => `${d.score}%`)
      .style("pointer-events", "none");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);

      linkLabels
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);
    });
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function zoomIn() {
    svg.transition().call(d3.zoom().scaleBy, 1.5);
  }

  function zoomOut() {
    svg.transition().call(d3.zoom().scaleBy, 1 / 1.5);
  }

  function resetView() {
    svg.transition().call(d3.zoom().transform, d3.zoomIdentity);
  }

  function centerView() {
    const bounds = svg.select("g").node().getBBox();
    const fullWidth = width;
    const fullHeight = height;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const scale =
      Math.min(fullWidth / bounds.width, fullHeight / bounds.height) * 0.9;
    const translate = [
      fullWidth / 2 - scale * centerX,
      fullHeight / 2 - scale * centerY,
    ];

    svg
      .transition()
      .call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale),
      );
  }
</script>

<div class="relative w-full h-full" bind:this={container}>
  {#if connections.nodes.length === 0}
    <div class="flex items-center justify-center h-full">
      <div class="text-center">
        <div
          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <i data-lucide="share-2" class="w-8 h-8 text-gray-400"></i>
        </div>
        <p class="text-gray-500">{t.noData}</p>
      </div>
    </div>
  {/if}

  <!-- Graph Controls -->
  {#if connections.nodes.length > 0}
    <div class="absolute top-4 right-4 flex flex-col space-y-2 z-10">
      <button
        on:click={zoomIn}
        class="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        title={t.zoomIn}
      >
        <i data-lucide="zoom-in" class="w-4 h-4 text-gray-600"></i>
      </button>

      <button
        on:click={zoomOut}
        class="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        title={t.zoomOut}
      >
        <i data-lucide="zoom-out" class="w-4 h-4 text-gray-600"></i>
      </button>

      <button
        on:click={resetView}
        class="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        title={t.resetView}
      >
        <i data-lucide="maximize" class="w-4 h-4 text-gray-600"></i>
      </button>

      <button
        on:click={centerView}
        class="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        title={t.centerView}
      >
        <i data-lucide="target" class="w-4 h-4 text-gray-600"></i>
      </button>
    </div>
  {/if}
</div>

<style>
  :global(.connection-graph) {
    font-family: "Inter", sans-serif;
  }
</style>
