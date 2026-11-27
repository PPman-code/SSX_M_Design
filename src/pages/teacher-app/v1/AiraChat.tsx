import { useEffect, useId, useRef, useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/useToast';
import { copyText } from '../../../lib/clipboard';
import { AppPreviewStatus } from './AppPage';
import './aira-chat.css';

const promptGroups = [
  [
    '今天还有什么事情要处理？',
    '帮我看看今天的排课',
    '带我去给学员点名',
    '帮我找一下今天下午17:00–19:00还有哪些老师有空',
  ],
  [
    '帮我看看明天的课表',
    '今天还有哪些课没点名？',
    '这周有哪些待跟进的学员？',
    '帮我找一下周六上午有空的教室',
  ],
  [
    '帮我安排一节新课',
    '帮我看看最近的消息',
    '我接下来要上什么课？',
    '帮我看看本周的待办',
  ],
];

type ReplyRating = 'like' | 'dislike';
type AiraMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; time: Date; rating: ReplyRating | null };

const replyTimeFormat = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

function observeComposerFooter(form: HTMLFormElement | null) {
  const footer = form?.closest<HTMLElement>('.sheet-footer');
  const sheet = footer?.closest<HTMLElement>('.aira-chat');
  if (!footer || !sheet) return;

  const measure = () => sheet.style.setProperty('--aira-footer-height', `${footer.offsetHeight}px`);
  const observer = new ResizeObserver(measure);
  measure();
  observer.observe(footer, { box: 'border-box' });
  return () => {
    observer.disconnect();
    sheet.style.removeProperty('--aira-footer-height');
  };
}

function AiraVoiceButton() {
  const [holding, setHolding] = useState(false);
  const toast = useToast();
  const endHold = () => setHolding(false);

  return <Button variant="ghost" shape="round" className="aira-chat-hold"
    aria-label="按住说话" data-holding={holding || undefined}
    onPointerDown={event => { if (event.isPrimary && event.button === 0) setHolding(true); }}
    onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
    onLostPointerCapture={endHold} onBlur={endHold}
    onKeyDown={event => { if (event.key === ' ') setHolding(true); }}
    onKeyUp={event => { if (event.key === ' ') endHold(); }}
    onContextMenu={event => event.preventDefault()}
    onClick={() => toast.showToast({ message: '语音输入暂未接入' })}>
    {holding ? <>
      <span className="aira-chat-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
      <span>松开结束</span>
      <span className="aira-chat-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
    </> : '按住说话'}
  </Button>;
}

export function AiraChat({ open, onOpenChange, onReturnHome, preview }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnHome: () => void;
  preview: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [promptGroup, setPromptGroup] = useState(0);
  const [draft, setDraft] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [pendingReply, setPendingReply] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiraMessage[]>([]);
  const log = useRef<HTMLDivElement>(null);
  const latestMessage = useRef<HTMLLIElement>(null);
  const focusLog = useRef(false);
  const stopButton = useRef<HTMLButtonElement>(null);
  const modeButton = useRef<HTMLButtonElement>(null);
  const restoreModeFocus = useRef(false);
  const inputId = useId();
  const greetingId = useId();
  const toast = useToast();
  const canSend = !voiceMode && draft.trim().length > 0;
  const responding = pendingReply !== null;
  const messageCount = messages.length;

  useEffect(() => {
    if (!open || messageCount === 0) return;
    if (focusLog.current) {
      log.current?.focus({ preventScroll: true });
      focusLog.current = false;
    }
    latestMessage.current?.scrollIntoView({ block: 'nearest' });
  }, [open, messageCount, responding]);

  useEffect(() => {
    if (!open || pendingReply === null) return;
    const timer = window.setTimeout(() => {
      if (document.activeElement === stopButton.current) document.getElementById(inputId)?.focus();
      setMessages(current => [...current, { role: 'assistant', text: pendingReply, time: new Date(), rating: null }]);
      setPendingReply(null);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [inputId, open, pendingReply]);

  useEffect(() => {
    if (!restoreModeFocus.current) return;
    restoreModeFocus.current = false;
    modeButton.current?.focus({ preventScroll: true });
  }, [expanded]);

  function changeDisplayMode(nextExpanded: boolean) {
    restoreModeFocus.current = true;
    setExpanded(nextExpanded);
  }

  function close() {
    setExpanded(false);
    setVoiceMode(false);
    setPendingReply(null);
    onOpenChange(false);
  }

  function returnHome() {
    close();
    onReturnHome();
  }

  function sendDraft() {
    if (responding) return;
    const message = draft.trim();
    if (!message) {
      toast.showToast({ message: '请输入消息' });
      document.getElementById(inputId)?.focus();
      return;
    }
    submitMessage(message);
    setDraft('');
    document.getElementById(inputId)?.focus();
  }

  function submitMessage(message: string) {
    setMessages(current => [...current, { role: 'user', text: message }]);
    setPendingReply(/^(你好|您好)[！!。？?]*$/.test(message)
      ? '你好啊，有什么可以帮助你？'
      : '我可以帮你查看课表、整理待办，也可以带你去给学员点名。你想先看哪一项？');
  }

  function rateReply(index: number, rating: ReplyRating) {
    const reply = messages[index];
    if (reply?.role !== 'assistant') return;
    const nextRating = reply.rating === rating ? null : rating;
    setMessages(current => current.map((message, messageIndex) =>
      messageIndex === index && message.role === 'assistant'
        ? { ...message, rating: nextRating }
        : message));
    if (nextRating !== null) toast.showToast({ message: '谢谢你的反馈，我们会继续努力' });
  }

  const brand = <div className="aira-chat-brand" role="img" aria-label="AIRA">
    <Icon name="aira-chat-mark" className="aira-chat-mark" />
    <Icon name="aira-chat-wordmark" className="aira-chat-wordmark" />
  </div>;

  return <BottomSheet open={open} onOpenChange={next => { if (!next) close(); }}
    onCloseRequest={expanded ? returnHome : undefined}
    title="AIRA" mode={expanded ? 'editor' : 'selection'} className={expanded ? 'aira-chat aira-chat--expanded' : 'aira-chat'}
    header={expanded ? <header className="aira-chat-header aira-chat-header--page app-page-top" data-background="transparent" data-preview={preview || undefined}>
      {preview && <AppPreviewStatus />}
      <nav className="app-page-nav" aria-label="AIRA 顶部导航">
        <div className="app-page-nav-side">
          <Button ref={modeButton} variant="ghost" className="app-page-icon-button" iconOnly icon="left" aria-label="返回" onClick={returnHome} />
        </div>
        {brand}
        <div className="app-page-nav-side app-page-nav-actions">
          <Button variant="ghost" className="app-page-icon-button" iconOnly icon="shrink" aria-label="弹窗" onClick={() => changeDisplayMode(false)} />
        </div>
      </nav>
    </header> : <div className="aira-chat-header">
      <Button variant="ghost" className="aira-chat-collapse" aria-label="收起" onClick={close}>
        <span aria-hidden="true" />
      </Button>
      {brand}
      <Button ref={modeButton} variant="ghost" className="aira-chat-expand" iconOnly icon="expand"
        aria-label="展开对话" onClick={() => changeDisplayMode(true)} />
    </div>}
    footer={<form ref={observeComposerFooter} className={voiceMode ? 'aira-chat-composer aira-chat-composer--voice' : 'aira-chat-composer'} onSubmit={event => { event.preventDefault(); sendDraft(); }}>
      {voiceMode
        ? <AiraVoiceButton />
        : <Input id={inputId} label="消息" layout="external" multiline hideLabel value={draft} onValueChange={setDraft}
            placeholder="有什么事问 AIRA 吧" autoComplete="off" enterKeyHint="enter"
            onKeyDown={event => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
                event.preventDefault();
                sendDraft();
              }
            }} />}
      {responding
        ? <Button ref={stopButton} shape="round" className="aira-chat-send aira-chat-stop" aria-label="停止生成" onClick={() => {
            setPendingReply(null);
            document.getElementById(inputId)?.focus();
          }}><span aria-hidden="true" /></Button>
        : canSend
          ? <Button type="submit" size="sm" shape="round" className="aira-chat-send" iconOnly icon="aira-chat-send" aria-label="发送" />
        : <Button variant="secondary" shape="round" className="aira-chat-toggle" iconOnly icon={voiceMode ? 'aira-keyboard' : 'aira-chat-mic'}
            aria-label={voiceMode ? '切换到键盘输入' : '切换到按住说话'} onClick={() => setVoiceMode(current => !current)} />}
    </form>}>
    {messages.length === 0 && <section className="aira-chat-suggestions" aria-labelledby={greetingId}>
      <div className="aira-chat-suggestions-heading">
        <h3 id={greetingId}>Hi&nbsp;&nbsp;我是AIRA</h3>
        <Button variant="text" size="sm" icon="refresh" onClick={() => setPromptGroup(current => (current + 1) % promptGroups.length)}>换一批</Button>
        <p>今天你想处理什么？告诉 AIRA，让工作变得更轻松。</p>
      </div>
      <ul className="aira-chat-prompts">
        {promptGroups[promptGroup].map(prompt => <li key={prompt}>
          <Button variant="ghost" onClick={() => {
            focusLog.current = true;
            submitMessage(prompt);
          }}>
            <span>{prompt}</span>
          </Button>
        </li>)}
      </ul>
    </section>}
    <div role="log" aria-label="对话消息" tabIndex={-1} ref={log}>
      <ul className="aira-chat-messages">
        {messages.map((message, index) => <li key={index}
          className={`aira-chat-message aira-chat-message--${message.role}`}
          aria-label={message.role === 'assistant' ? 'AIRA 回复' : '我的消息'}
          ref={!responding && index === messageCount - 1 ? latestMessage : undefined}>
          <p className="aira-chat-bubble">{message.text}</p>
          {message.role === 'assistant' && <div className="aira-chat-message-meta">
            <time dateTime={message.time.toISOString()}>{replyTimeFormat.format(message.time)}</time>
            <Button variant="ghost" size="sm" iconOnly icon="aira-message-copy" aria-label="复制回复" onClick={async () => {
              const copied = await copyText(message.text);
              toast.showToast(copied ? { message: '复制成功' } : { message: '复制失败，请长按回复复制', type: 'error' });
            }} />
            <Button variant="ghost" size="sm" iconOnly
              icon={message.rating === 'like' ? 'aira-message-like-filled' : 'aira-message-like'}
              aria-label="赞" aria-pressed={message.rating === 'like'} onClick={() => rateReply(index, 'like')} />
            <Button variant="ghost" size="sm" iconOnly
              icon={message.rating === 'dislike' ? 'aira-message-dislike-filled' : 'aira-message-dislike'}
              aria-label="踩" aria-pressed={message.rating === 'dislike'} onClick={() => rateReply(index, 'dislike')} />
          </div>}
        </li>)}
        {responding && <li className="aira-chat-message" ref={latestMessage}>
          <span className="aira-chat-think" role="status">
            <Icon name="aira-chat-thinking" size="xs" />
            <span className="aira-chat-think-text">正在思考...</span>
          </span>
        </li>}
      </ul>
    </div>
  </BottomSheet>;
}
