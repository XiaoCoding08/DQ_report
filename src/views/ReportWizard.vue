<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useReportStore } from '../stores/useReportStore';
import { Icon } from '@iconify/vue';

const router = useRouter();
const store = useReportStore();

// 状态管理
const currentStep = ref(1);
const selectedTemplateId = ref(null);
const localFiles = ref([]); // 本地临时存储的文件列表
const isGenerating = ref(false);
const loadingText = ref('准备开始...');

// 获取所有模板分类
const categories = computed(() => store.templates);

// --- 步骤 1 逻辑: 选择模板 ---
const selectTemplate = (id) => {
  selectedTemplateId.value = id;
};

// --- 步骤 2 逻辑: 文件上传 ---
const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  if (files.length) {
    localFiles.value = [...localFiles.value, ...files];
  }
  e.target.value = ''; // 重置 input
};

const removeFile = (index) => {
  localFiles.value.splice(index, 1);
};

// --- 步骤 3 逻辑: 执行生成 ---
const runGeneration = () => {
  if (!selectedTemplateId.value || localFiles.value.length === 0) return;

  isGenerating.value = true;
  
  // 模拟进度文案
  const steps = [
    `正在解析 ${localFiles.value[0].name} 等 ${localFiles.value.length} 份文件...`,
    "正在分析语义结构与关键数据...",
    "正在构建图表与结论章节...",
    "即将完成..."
  ];
  
  let stepIndex = 0;
  loadingText.value = steps[0];
  
  const interval = setInterval(() => {
    stepIndex++;
    if (stepIndex < steps.length) {
      loadingText.value = steps[stepIndex];
    }
  }, 2000);

  // 模拟耗时后完成
  setTimeout(() => {
    clearInterval(interval);
    
    // 1. 找到选中的模板标题
    let tplName = "未命名模板";
    store.templates.forEach(cat => {
      const t = cat.list.find(i => i.id === selectedTemplateId.value);
      if (t) tplName = t.title;
    });

    // 2. 创建新报告 (使用 store 中预置的 L92 报告内容作为演示结果)
    // 在真实应用中，这里会调用后端 API 传入文件和模板ID
    const demoContent = store.reports[0].content; 
    
    const newReport = {
      id: 'rpt_' + Date.now(),
      title: `基于 ${tplName} 的智能分析报告`,
      create_time: new Date().toLocaleDateString(),
      content: demoContent, // 演示用，直接复用内容
      // 记录本次生成所使用的参考文档名称，供编辑页按需展示
      sources: localFiles.value.map(f => f.name)
    };

    // 3. 存入 Store 并跳转
    store.addReport(newReport);
    router.push(`/editor/${newReport.id}`);
    
  }, 8000); // 8秒后完成
};
</script>

<template>
  <div class="flex flex-col h-full bg-white">
    
    <div class="shrink-0 py-8 px-6 flex items-center justify-center border-b border-gray-100 bg-gray-50/50">
      <div class="flex items-center gap-4">
        <div :class="['flex items-center gap-2 font-bold transition-colors', currentStep === 1 ? 'text-blue-600' : 'text-gray-400']">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm', currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">1</div>
          选择模板
        </div>
        
        <div class="w-16 h-0.5 bg-gray-200"></div>
        
        <div :class="['flex items-center gap-2 font-bold transition-colors', currentStep === 2 ? 'text-blue-600' : 'text-gray-400']">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm', currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">2</div>
          上传材料
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden relative">
      
      <div v-if="currentStep === 1 && !isGenerating" class="h-full flex flex-col">
        <div class="shrink-0 py-4 text-center">
          <h3 class="text-lg font-bold text-gray-800">请选择一个基础模板</h3>
        </div>
        
        <div class="flex-1 overflow-y-auto px-8 pb-8">
          <div class="max-w-5xl mx-auto grid grid-cols-1 gap-8">
            <div v-for="cat in categories" :key="cat.name">
              <h4 class="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">{{ cat.name }}</h4>
              <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
                <div 
                  v-for="tpl in cat.list" 
                  :key="tpl.id"
                  @click="selectTemplate(tpl.id)"
                  :class="['cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-3 hover:shadow-md', 
                    selectedTemplateId === tpl.id 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  ]"
                >
                  <div class="w-12 h-12 bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Icon icon="ri:file-list-2-line" class="text-xl" />
                  </div>
                  <span class="text-sm font-bold text-gray-700 line-clamp-2">{{ tpl.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="shrink-0 py-6 border-t border-gray-100 flex justify-center bg-white">
          <button 
            @click="currentStep = 2"
            :disabled="!selectedTemplateId"
            :class="['px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2', 
              selectedTemplateId ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            下一步 <Icon icon="ri:arrow-right-line" />
          </button>
        </div>
      </div>

      <div v-if="currentStep === 2 && !isGenerating" class="h-full flex flex-col items-center justify-center p-8 bg-gray-50/50">
        <div class="w-full max-w-2xl flex flex-col h-[500px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h4 class="font-bold text-gray-700">上传参考文档</h4>
            <span class="text-xs text-gray-400">支持 PDF, Word, TXT (可多选)</span>
          </div>
          
          <div class="flex-1 p-6 flex flex-col">
            <div 
              @click="$refs.fileInput.click()"
              v-if="localFiles.length === 0"
              class="flex-1 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                 <Icon icon="ri:upload-cloud-2-line" class="text-3xl" />
              </div>
              <p class="text-blue-900 font-bold text-lg">点击上传文档</p>
              <p class="text-sm text-blue-400 mt-2">或将文件拖拽至此处</p>
            </div>

            <div v-else class="flex-1 overflow-y-auto space-y-3">
              <div v-for="(file, idx) in localFiles" :key="idx" class="flex items-center justify-between p-3 border border-blue-100 bg-blue-50/30 rounded-lg">
                 <div class="flex items-center gap-3 overflow-hidden">
                    <Icon icon="ri:file-text-line" class="text-blue-500 shrink-0" />
                    <span class="text-sm font-medium text-gray-700 truncate">{{ file.name }}</span>
                 </div>
                 <button @click="removeFile(idx)" class="text-gray-400 hover:text-red-500 p-1">
                    <Icon icon="ri:close-line" />
                 </button>
              </div>
              <div @click="$refs.fileInput.click()" class="py-3 text-center text-sm text-blue-600 font-bold cursor-pointer hover:underline border-t border-gray-100 mt-2">
                + 继续添加文件
              </div>
            </div>

            <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileChange" />
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <button @click="currentStep = 1" class="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-white hover:shadow-sm">上一步</button>
          <button 
            @click="runGeneration"
            :disabled="localFiles.length === 0"
            :class="['px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all',
              localFiles.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-gray-300 text-white cursor-not-allowed shadow-none'
            ]"
          >
            <Icon icon="ri:sparkling-2-fill" /> 开始生成报告
          </button>
        </div>
      </div>

      <div v-if="isGenerating" class="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <div class="relative w-24 h-24 mb-8">
           <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
           <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
           <div class="absolute inset-0 flex items-center justify-center text-blue-600">
             <Icon icon="ri:robot-line" class="text-3xl" />
           </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">AI 正在生成报告...</h3>
        <p class="text-gray-500 font-mono text-sm animate-pulse">{{ loadingText }}</p>
      </div>

    </div>
  </div>
</template>