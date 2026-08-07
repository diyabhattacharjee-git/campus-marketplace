import { Link } from 'react-router-dom';
import { ArrowRight, Gavel, MessageCircle, ShoppingBag, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';

const FEATURES = [
  {
    icon: Gavel,
    title: 'Post a request, not a search',
    description:
      'Need a Casio calculator by Friday under ₹600? Post it once — every matching seller on campus gets notified and competes for your order.',
  },
  {
    icon: TrendingDown,
    title: 'Track price history',
    description:
      'Every listing keeps a full price-change history, so you know whether that laptop is actually a deal or just back at its old price.',
  },
  {
    icon: MessageCircle,
    title: 'Chat, verified',
    description:
      'Every account is verified with a college email before it can list or bid — negotiate directly, in real time, with people from your own campus.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <span className="flex items-center gap-2 font-display text-lg font-semibold">
            <ShoppingBag className="size-5 text-primary" />
            Campus Marketplace
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to={ROUTES.LOGIN}>Log in</Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.SIGNUP}>Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container flex flex-col items-start gap-6 py-20 lg:py-28">
        <Badge variant="secondary" className="border-primary/20 text-primary">
          Now live for your campus
        </Badge>
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight lg:text-6xl">
          Don’t search the marketplace.{' '}
          <span className="text-primary">Let it come bid for you.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Buy and sell books, electronics, and hostel essentials with people on
          your own campus — or post what you need and let sellers compete on
          price, condition, and delivery time.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link to={ROUTES.SIGNUP}>
              Create your account <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to={ROUTES.PRODUCTS}>Browse listings</Link>
          </Button>
        </div>
      </section>

      <section className="container grid gap-6 pb-24 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  );
}
