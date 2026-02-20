// ============================================================================
// Platform Icon — SVG icons for ad platforms
// ============================================================================

import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export default function PlatformIcon({ platform, className }: PlatformIconProps) {
  const baseClass = cn("shrink-0", className);

  switch (platform) {
    case "meta":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" role="img" aria-label="Meta Ads">
          <circle cx="12" cy="12" r="11" fill="#1877F2" />
          <path d="M16.5 12.05h-2.7v8.2h-3.4v-8.2H8.5V9.2h1.9V7.4c0-1.6 1-3.1 3.3-3.1l2.4.01v2.76h-1.7c-.6 0-.8.3-.8.8V9.2h2.5l-.6 2.85z" fill="white" />
        </svg>
      );
    case "google":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" role="img" aria-label="Google Ads">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" role="img" aria-label="TikTok Ads">
          <rect width="24" height="24" rx="4" fill="#010101" />
          <path d="M17.07 10.14a4.51 4.51 0 01-3.06-1.2v5.48a4.18 4.18 0 11-3.59-4.14v2.3a1.93 1.93 0 101.35 1.84V6h2.24a4.51 4.51 0 003.06 4.14z" fill="white" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" role="img" aria-label="LinkedIn Ads">
          <rect width="24" height="24" rx="4" fill="#0A66C2" />
          <path d="M8.34 18.34H5.67v-8.6h2.67v8.6zM7 8.57a1.55 1.55 0 110-3.1 1.55 1.55 0 010 3.1zm11.34 9.77h-2.67v-4.19c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.09-1.6 2.21v4.26h-2.67v-8.6h2.56v1.17h.04a2.81 2.81 0 012.53-1.39c2.7 0 3.2 1.78 3.2 4.1v4.72z" fill="white" />
        </svg>
      );
    case "twitter":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" role="img" aria-label="X (Twitter) Ads">
          <rect width="24" height="24" rx="4" fill="#000" />
          <path d="M13.54 10.73L18.2 5.5h-1.1l-4.05 4.54L9.76 5.5H5.5l4.89 6.87L5.5 18.1h1.1l4.27-4.79 3.37 4.79H18.5l-4.96-7.37zm-1.51 1.7l-.5-.68L7.2 6.32h1.7l3.18 4.39.5.68 4.13 5.7h-1.7l-3.28-4.66z" fill="white" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" role="img" aria-label="WhatsApp">
          <circle cx="12" cy="12" r="11" fill="#25D366" />
          <path d="M17.47 14.38c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" fill="white" />
        </svg>
      );
    default:
      return (
        <div className={cn("rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground", baseClass)}>
          {platform.charAt(0).toUpperCase()}
        </div>
      );
  }
}
