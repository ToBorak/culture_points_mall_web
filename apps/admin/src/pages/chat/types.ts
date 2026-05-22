export type StepKind = 'llm_text' | 'tool_use' | 'tool_result' | 'error' | 'done';

export interface Step {
  kind: StepKind;
  text?: string;
  toolName?: string;
  toolId?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

export interface ChatTurn {
  id: string;
  sessionId: number | null;
  userText: string;
  steps: Step[];
  done: boolean;
}
