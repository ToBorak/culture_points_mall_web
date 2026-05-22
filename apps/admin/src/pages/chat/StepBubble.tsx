import { Panel, Shout, Stamp } from '@cpm/ui';
import { motion } from 'framer-motion';
import type { Step } from './types';

export function StepBubble({ step }: { step: Step }) {
  if (step.kind === 'llm_text') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="my-2">
        <Panel shadow="yellow">
          <div className="whitespace-pre-wrap font-kuaile">{step.text}</div>
        </Panel>
      </motion.div>
    );
  }
  if (step.kind === 'tool_use') {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="my-2 ml-6">
        <Panel shadow="blue">
          <div className="flex items-center gap-2 mb-1">
            <Shout tone="blue" rotation={-2}>
              调用 {step.toolName}
            </Shout>
          </div>
          <pre className="text-xs bg-paper border border-ink p-2 rounded">{JSON.stringify(step.input, null, 2)}</pre>
        </Panel>
      </motion.div>
    );
  }
  if (step.kind === 'tool_result') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-2 ml-6">
        <Panel shadow={step.error ? 'red' : 'green'}>
          <div className="flex items-center gap-2 mb-1">
            <Stamp text={step.error ? 'FAIL' : 'DONE'} color={step.error ? 'red' : 'green'} rotation={-8} />
            <span className="font-kuaile">{step.toolName}</span>
          </div>
          {step.error ? (
            <div className="text-cRed text-sm">{step.error}</div>
          ) : (
            <pre className="text-xs bg-paper border border-ink p-2 rounded">{JSON.stringify(step.output, null, 2)}</pre>
          )}
        </Panel>
      </motion.div>
    );
  }
  if (step.kind === 'error') {
    return (
      <div className="my-2">
        <Panel shadow="red">
          <div className="text-cRed">{step.error}</div>
        </Panel>
      </div>
    );
  }
  if (step.kind === 'done') {
    return <div className="text-center text-xs text-ink/50">— 本轮结束 —</div>;
  }
  return null;
}
