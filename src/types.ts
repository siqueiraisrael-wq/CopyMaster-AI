export interface SavedCopy {
  id: string;
  productName: string;
  originalPrice: string;
  promoPrice: string;
  productLink: string;
  coupon: string;
  category: string;
  copyText: string;
  productImageUrl?: string;
  createdAt: string;
  favorite: boolean;
  clicks: number;
}

export interface OmnichannelPackage {
  produto: string;
  agendamento_sugerido: string;
  estrategia_por_rede: {
    whatsapp_telegram: {
      copy: string;
    };
    instagram_facebook: {
      legenda_post: string;
    };
    tiktok: {
      ideia_hook_video: string;
      legenda: string;
    };
  };
}

export interface ScheduledItem {
  id: string;
  productName: string;
  copyText: string;
  scheduledTime: string;
  scheduledDate: string;
  timeSlot: string; // e.g., '09:00', '12:30', '18:00', '20:30'
  status: 'pending' | 'sent';
  platform: 'whatsapp' | 'telegram' | 'instagram' | 'tiktok';
  productImageUrl?: string;
}

export interface VideoScriptScene {
  timestamp: string;
  visual: string;
  transition: string;
  textOnScreen: string;
  audioVoiceover: string;
}

export interface VideoScript {
  title: string;
  duration: string;
  platform: string;
  hook: string;
  scenes: VideoScriptScene[];
  callToAction: string;
  suggestedAudio: string;
}

export interface AffiliateConfig {
  networkName: string;
  paramName: string;
  affiliateId: string;
  active: boolean;
}

export interface N8nConfig {
  webhookUrl: string;
  autoDispatchOnQueue: boolean;
}

export interface ProductInput {
  productName: string;
  originalPrice: string;
  promoPrice: string;
  productLink: string;
  coupon: string;
  category: string;
  customNotes: string;
  temperature: number;
  productImageUrl: string;
}
