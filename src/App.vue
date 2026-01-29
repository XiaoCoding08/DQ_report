<script setup>
import Sidebar from './components/layout/Sidebar.vue';
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-50">
    <Sidebar class="shrink-0" />

    <main class="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
      <router-view></router-view>
    </main>
  </div>
</template>