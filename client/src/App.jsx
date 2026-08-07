import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes';

function App() {
  return (
    <>
      <AppRoutes />
      {/* Single global toaster instance — styled to match the design tokens
          in index.css. Individual features call toast.success/.error, they
          never render their own <Toaster>. */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: 'hsl(var(--success))', secondary: 'white' } },
          error: { iconTheme: { primary: 'hsl(var(--destructive))', secondary: 'white' } },
        }}
      />
    </>
  );
}

export default App;
