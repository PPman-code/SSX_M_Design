import { useEffect, useId, useRef, useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/useToast';
import './aira-chat.css';

const promptGroups = [
  [
    '今天还有什么事情要处理？',
    '帮我看看今天的排课',
    '带我去给学员点名',
    '帮我找一下今天下午17:00–19:00还有哪些老师有空',
    '帮我安排一节新课',
    '帮我看看最近的消息',
  ],
  [
    '帮我看看明天的课表',
    '今天还有哪些课没点名？',
    '这周有哪些待跟进的学员？',
    '帮我找一下周六上午有空的教室',
    '我接下来要上什么课？',
    '帮我看看本周的待办',
  ],
];

export function AiraChat({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [promptGroup, setPromptGroup] = useState(0);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const log = useRef<HTMLDivElement>(null);
  const latestMessage = useRef<HTMLLIElement>(null);
  const focusLog = useRef(false);
  const inputId = useId();
  const toast = useToast();

  useEffect(() => {
    if (!open || messages.length === 0) return;
    if (focusLog.current) {
      log.current?.focus({ preventScroll: true });
      focusLog.current = false;
    }
    latestMessage.current?.scrollIntoView({ block: 'nearest' });
  }, [open, messages]);

  function close() {
    setExpanded(false);
    onOpenChange(false);
  }

  function sendDraft() {
    const message = draft.trim();
    if (!message) {
      toast.showToast({ message: '请输入消息' });
      document.getElementById(inputId)?.focus();
      return;
    }
    setMessages(current => [...current, message]);
    setDraft('');
  }

  return <BottomSheet open={open} onOpenChange={next => { if (!next) close(); }}
    title="AIRA" mode="editor" className={expanded ? 'aira-chat aira-chat--expanded' : 'aira-chat'}
    header={<div className="aira-chat-header">
      <Icon name="app-tab-aira" size="lg" className="aira-chat-mark" />
      <strong>AIRA</strong>
      <Button variant="secondary" iconOnly icon={expanded ? 'shrink' : 'expand'}
        aria-label={expanded ? '缩小对话' : '展开对话'} onClick={() => setExpanded(current => !current)} />
      <Button variant="secondary" onClick={close}>收起</Button>
    </div>}
    footer={<form className="aira-chat-composer" onSubmit={event => { event.preventDefault(); sendDraft(); }}>
      <Input id={inputId} label="消息" layout="external" hideLabel value={draft} onValueChange={setDraft}
        placeholder="我问问" autoComplete="off" enterKeyHint="send" />
      <Button type="submit">发送</Button>
    </form>}>
    {messages.length === 0 && <section className="aira-chat-suggestions" aria-label="试试这样问">
      <div className="aira-chat-suggestions-heading">
        <h3>试试这样问</h3>
        <Button variant="ghost" onClick={() => setPromptGroup(current => (current + 1) % promptGroups.length)}>换一批</Button>
      </div>
      <ul className="aira-chat-prompts">
        {promptGroups[promptGroup].map(prompt => <li key={prompt}>
          <Button variant="ghost" onClick={() => {
            focusLog.current = true;
            setMessages(current => [...current, prompt]);
          }}>
            <span>{prompt}</span><Icon name="arrow-right" size="base" />
          </Button>
        </li>)}
      </ul>
    </section>}
    <div role="log" aria-label="对话消息" tabIndex={-1} ref={log}>
      <ul className="aira-chat-messages">
        {messages.map((message, index) => <li key={index} ref={index === messages.length - 1 ? latestMessage : undefined}>{message}</li>)}
      </ul>
    </div>
  </BottomSheet>;
}
