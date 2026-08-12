import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export default function ChatListItem({ chat, isActive, isOnline }) {
  const url = ROUTES.CHAT_DETAIL.replace(':id', chat._id);
  const other = chat.otherParticipant;
  const hasUnread = chat.unreadCount > 0;

  return (
    <Link
      to={url}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent',
        isActive && 'bg-accent',
      )}
    >
      <div className="relative shrink-0">
        <Avatar>
          <AvatarImage src={other?.avatar?.url} alt={other?.name} />
          <AvatarFallback>{other?.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm', hasUnread ? 'font-semibold' : 'font-medium')}>{other?.name}</p>
        </div>
        <p className={cn('truncate text-xs', hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
          {chat.lastMessage?.hasImage ? '📷 Photo' : chat.lastMessage?.text || 'Say hello 👋'}
        </p>
      </div>

      {hasUnread && (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {chat.unreadCount}
        </span>
      )}
    </Link>
  );
}
