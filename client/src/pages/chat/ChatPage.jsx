import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, MessageCircle, Send, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ChatListItem from '@/components/chat/ChatListItem';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';

import { chatService } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { id: activeChatId } = useParams();

  const { data: chatsRes, isLoading: chatsLoading } = useQuery({
    queryKey: queryKeys.chats.list,
    queryFn: () => chatService.getChats(),
  });
  const chats = chatsRes?.data.chats || [];

  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  // Presence is app-wide (see server sockets/index.js), so it's cheap to
  // track once here rather than per ChatListItem.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onOnline = ({ userId }) => setOnlineUserIds((prev) => new Set(prev).add(userId));
    const onOffline = ({ userId }) =>
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    socket.on('presence:online', onOnline);
    socket.on('presence:offline', onOffline);
    return () => {
      socket.off('presence:online', onOnline);
      socket.off('presence:offline', onOffline);
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden rounded-xl border border-border bg-card">
      <aside className={cn('w-full shrink-0 border-r border-border sm:w-80', activeChatId && 'hidden sm:block')}>
        <div className="border-b border-border p-4">
          <h1 className="font-display text-lg font-semibold">Messages</h1>
        </div>
        <div className="overflow-y-auto p-2" style={{ height: 'calc(100% - 61px)' }}>
          {chatsLoading && (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          {!chatsLoading && chats.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet — message a seller from a listing to start one.
            </p>
          )}
          {chats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              isActive={chat._id === activeChatId}
              isOnline={onlineUserIds.has(chat.otherParticipant?._id)}
            />
          ))}
        </div>
      </aside>

      <div className={cn('min-w-0 flex-1', !activeChatId && 'hidden sm:flex')}>
        {activeChatId ? (
          <ActiveConversation chatId={activeChatId} isOnline={(id) => onlineUserIds.has(id)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="size-8" />
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveConversation({ chatId, isOnline }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const { data: chatRes } = useQuery({
    queryKey: queryKeys.chats.detail(chatId),
    queryFn: () => chatService.getChatById(chatId),
  });
  const chat = chatRes?.data.chat;

  const { data: messagesRes, isLoading: messagesLoading } = useQuery({
    queryKey: queryKeys.chats.messages(chatId),
    queryFn: () => chatService.getMessages(chatId),
  });

  // Seed local message state from the initial fetch; live updates append
  // via the socket listener below. Kept as local state (not the query
  // cache) because a live-appending list is simpler to reason about than
  // juggling setQueryData for every incoming event.
  useEffect(() => {
    if (messagesRes) setMessages(messagesRes.data.messages);
  }, [messagesRes]);

  const sendMutation = useMutation({
    mutationFn: ({ text: t, image }) => chatService.sendMessage(chatId, { text: t, image }),
    onError: (err) => toast.error(err.message || 'Could not send that message'),
  });

  const markSeenMutation = useMutation({
    mutationFn: () => chatService.markSeen(chatId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list }),
  });

  // Join the socket room for this chat, mark it seen, and clean up on
  // leaving. Runs whenever the active chat changes.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    socket.emit('chat:join', chatId);
    markSeenMutation.mutate();

    const onMessage = ({ message }) => {
      if (message.chat !== chatId && message.chat?._id !== chatId) return;
      setMessages((prev) => [...prev, message]);
      if (message.sender !== currentUserId) {
        markSeenMutation.mutate();
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.list });
    };

    const onTyping = ({ userId, isTyping }) => {
      if (userId === currentUserId) return;
      setOtherTyping(isTyping);
    };

    const onSeen = () => {
      setMessages((prev) => prev.map((m) => (m.sender === currentUserId ? { ...m, seenAt: new Date() } : m)));
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    socket.on('chat:seen', onSeen);

    return () => {
      socket.emit('chat:leave', chatId);
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
      socket.off('chat:seen', onSeen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, otherTyping]);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Typing indicator: emit true on the first keystroke, then emit false
  // automatically after 2s of inactivity (not just on send/clear) — a
  // debounced value alone can't express "stopped typing but didn't clear
  // the box", so this uses an explicit reset-on-each-keystroke timer.
  const handleTextChange = (value) => {
    setText(value);
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      socket.emit('chat:typing', { chatId, isTyping: true });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { chatId, isTyping: false });
      isTypingRef.current = false;
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    sendMutation.mutate({ text: text.trim(), image: imageFile });
    setText('');
    setImageFile(null);
    clearTimeout(typingTimeoutRef.current);
    const socket = getSocket();
    socket?.emit('chat:typing', { chatId, isTyping: false });
    isTypingRef.current = false;
  };

  const other = chat?.otherParticipant;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        {other && (
          <>
            <Avatar>
              <AvatarImage src={other.avatar?.url} alt={other.name} />
              <AvatarFallback>{other.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{other.name}</p>
              <p className="text-xs text-muted-foreground">
                {isOnline(other._id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        )}
        {chat?.listing && (
          <Link
            to={ROUTES.PRODUCT_DETAILS.replace(':id', chat.listing._id)}
            className="ml-auto flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs hover:bg-accent"
          >
            {chat.listing.images?.[0] && (
              <img src={chat.listing.images[0].url} alt="" className="size-6 rounded object-cover" />
            )}
            <span className="max-w-32 truncate">{chat.listing.title}</span>
          </Link>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messagesLoading && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={(message.sender?._id || message.sender) === currentUserId}
          />
        ))}
        {otherTyping && <TypingIndicator />}
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-3">
        {imageFile && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
            <img src={URL.createObjectURL(imageFile)} alt="" className="size-10 rounded object-cover" />
            <span className="flex-1 truncate text-muted-foreground">{imageFile.name}</span>
            <button type="button" onClick={() => setImageFile(null)} aria-label="Remove image">
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach image"
          >
            <ImagePlus className="size-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          <Button type="submit" size="icon" disabled={sendMutation.isPending || (!text.trim() && !imageFile)}>
            {sendMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
