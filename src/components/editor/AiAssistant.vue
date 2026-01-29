<script setup>
import { ref, nextTick, watch } from 'vue';
import { Icon } from '@iconify/vue';

// 接收父组件的内容 (v-model) 和模式
const props = defineProps({
  modelValue: { type: String, default: '' }, // 编辑器的内容
  mode: { type: String, default: 'report' }  // 模式：'template' 或 'report'
});

const emit = defineEmits(['update:modelValue']);

// 状态
const inputVal = ref('');
const isThinking = ref(false);
const chatContainer = ref(null);
const messages = ref([
  { role: 'ai', content: '你好！我是你的报告助手。<br>我可以帮你调整大纲、扩写内容或润色语气。' }
]);

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// 发送消息核心逻辑
const sendMessage = () => {
  const text = inputVal.value.trim();
  if (!text) return;

  // 1. 用户消息上屏
  messages.value.push({ role: 'user', content: text });
  inputVal.value = '';
  isThinking.value = true;
  scrollToBottom();

  // 2. 模拟 AI 思考 (延迟 1.5秒)
  setTimeout(() => {
    isThinking.value = false;
    processAiCommand(text); // 执行修改逻辑
    scrollToBottom();
  }, 1500);
};

// ================== 核心：模拟 AI 修改逻辑 ==================
const processAiCommand = (text) => {
  let currentContent = props.modelValue;
  let reply = "";
  let success = false;

  // --- 场景 1: 扩写内容 ---
  if (text.includes("扩写") || text.includes("详细")) {
    const targetText = "L92井位于准噶尔盆地腹部的莫西庄凸起构造带上。本次钻探的主要地质任务包括探明含油气边界。";
    const newText = "L92井构造位置位于准噶尔盆地腹部莫西庄凸起构造带南翼。该构造带经历了海西期、印支期及燕山期多期构造运动的叠加改造，形成了现今“两隆夹一凹”的构造格局。本次钻探的主要地质任务包括：1. 探明含油气边界；2. 建立该区块低孔低渗储层的“四性”关系；3. 获取精确的地层压力系数。";
    
    if (currentContent.includes(targetText.substring(0, 10))) {
      currentContent = currentContent.replace(targetText, newText);
      reply = "【内容扩写】已对“区域地质背景”进行了深度扩写，补充了构造演化史及具体地质任务。";
      success = true;
    } else {
      reply = "我尝试寻找“区域地质背景”段落，但似乎未找到原文。已在文末为您补充了通用扩写内容。";
      currentContent += "\n\n### [AI 补充] 区域地质背景补充\n该区域沉积相主要为三角洲前缘沉积，砂体发育良好。";
      success = true;
    }
  }
  
  // --- 场景 2: 润色/专业化 ---
  else if (text.includes("润色") || text.includes("专业")) {
    currentContent = currentContent
      .replace(/物性好/g, "物性优越")
      .replace(/建议/g, "综合研判建议")
      .replace(/# /g, '# [AI精修] ');
    reply = "【全文润色】已修正部分口语化表达（如将“物性好”改为“物性优越”），并提升了报告的专业度。";
    success = true;
  }
  
  // --- 场景 3: 增加章节 ---
  else if (text.includes("增加") || text.includes("添加") || text.includes("章")) {
    if (!currentContent.includes("后续跟踪")) {
      currentContent += `\n\n## 第四章 后续跟踪与生产建议\n### 4.1 生产动态监测\n建议投产初期控制生产压差在 3-5MPa 范围内。\n### 4.2 数字化档案\n建议将本井数据录入数据库。`;
      reply = "【结构调整】已在报告末尾新增了“第四章 后续跟踪与生产建议”。";
      success = true;
    } else {
      reply = "报告中似乎已经包含了相关章节。";
    }
  }

  // --- 默认回复 ---
  else {
    reply = "收到指令。但我还在学习中，您可以试试对我说：<br>1. <b>“帮我扩写地质背景”</b><br>2. <b>“全文润色一下”</b><br>3. <b>“增加生产建议章节”</b>";
  }

  // 3. 将修改后的内容同步回父组件
  if (success) {
    emit('update:modelValue', currentContent);
  }
  
  messages.value.push({ role: 'ai', content: reply });
};
</script>

<template>
  <div class="flex flex-col h-full bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden ring-1 ring-indigo-50">
    <div class="h-10 bg-indigo-50/50 border-b border-indigo-100 px-4 flex items-center justify-between shrink-0">
      <span class="text-xs font-bold text-indigo-600 flex items-center gap-2">
        <Icon icon="ri:sparkling-fill" /> AI 智能助手
      </span>
      <span class="text-[10px] text-indigo-400">试试："扩写地质背景" 或 "润色全文"</span>
    </div>

    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-white hide-scrollbar">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="[
          'max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed text-justify break-words shadow-sm',
          msg.role === 'user' 
            ? 'bg-blue-50 text-blue-700 self-end ml-auto rounded-tr-none' 
            : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
        ]"
      >
        <div v-html="msg.content"></div>
      </div>

      <div v-if="isThinking" class="bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl rounded-tl-none w-fit">
        <div class="flex items-center gap-1">
          <Icon icon="ri:brain-line" class="text-gray-400 text-xs mr-1" />
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
        </div>
      </div>
    </div>

    <div class="p-3 border-t border-gray-100 bg-gray-50 shrink-0">
      <div class="relative">
        <input 
          v-model="inputVal"
          @keydown.enter="sendMessage"
          type="text" 
          placeholder="给 AI 发送指令..." 
          class="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
        />
        <button 
          @click="sendMessage"
          class="absolute right-1 top-1 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Icon icon="ri:send-plane-fill" class="text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 简单的打字机动画延迟 */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
</style>