import { defineStore } from 'pinia';
import type { AssistantMode, AssistantResult } from '../types';
const search = () => ({
  draft: '',
  messages: [] as string[],
  result: null as AssistantResult | null,
  hideSaved: false
});
export const useAssistantStore = defineStore('assistant', {
  state: () => ({
    mode: 'identify' as AssistantMode,
    searches: { identify: search(), recommend: search() }
  })
});
