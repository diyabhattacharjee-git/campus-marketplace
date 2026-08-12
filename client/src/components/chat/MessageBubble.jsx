import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
          isOwn ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground',
        )}
      >
        {message.image?.url && (
          <img
            src={message.image.url}
            alt="Shared attachment"
            className="mb-1.5 max-h-64 w-full rounded-lg object-cover"
          />
        )}
        {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {formatTime(message.createdAt)}
          {isOwn && (message.seenAt ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
        </div>
      </div>
    </div>
  );
}
