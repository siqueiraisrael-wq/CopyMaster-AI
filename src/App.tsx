import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Share2,
  Trash2,
  Tag,
  Link as LinkIcon,
  Layers,
  History,
  Settings,
  Upload,
  Zap,
  Flame,
  Smartphone,
  MessageCircle,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Globe,
  Clock,
  Video,
  Code,
  RefreshCw,
  Calendar,
  GripVertical,
  CheckCircle,
  Film,
  Play,
  Image as ImageIcon,
  Link2,
  Workflow,
  Download
} from 'lucide-react';
import { SavedCopy, ProductInput, AffiliateConfig, OmnichannelPackage, ScheduledItem, VideoScript, N8nConfig } from './types';

const CATEGORIES = [
  '🔥 Achadinhos Virais',
  '🎧 Eletrônicos & Gadgets',
  '🏠 Casa & Cozinha',
  '👗 Moda & Acessórios',
  '💄 Beleza & Skincare',
  '🏋️ Fitness & Esportes',
  '🧸 Brinquedos & Kids',
  '🚗 Auto & Moto'
];

const TIME_SLOTS = [
  { time: '09:00', label: 'Manhã (Abertura)', icon: '🌅' },
  { time: '12:30', label: 'Almoço (Pico)', icon: '🍽️' },
  { time: '16:00', label: 'Tarde (Engajamento)', icon: '☕' },
  { time: '20:00', label: 'Noite (Horário Nobre)', icon: '🌙' }
];

const QUICK_TEMPLATES = [
  {
    productName: 'Fone de Ouvido Bluetooth Lenovo LP40 Pro',
    originalPrice: '98,50',
    promoPrice: '32,90',
    coupon: 'LEMOV10',
    category: '🎧 Eletrônicos & Gadgets',
    productLink: 'https://s.shopee.com.br/exemplo123',
    customNotes: 'Bateria de longa duração e som estéreo',
    productImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'
  },
  {
    productName: 'Mini Aspirador de Pó Portátil Sem Fio 3 em 1',
    originalPrice: '149,90',
    promoPrice: '59,90',
    coupon: 'ASPIRADOR20',
    category: '🏠 Casa & Cozinha',
    productLink: 'https://s.shopee.com.br/exemplo456',
    customNotes: 'Sucção forte, ideal para carro e teclado',
    productImageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80'
  },
  {
    productName: 'Garrafa Térmica Aço Inox 1L com Display LED',
    originalPrice: '89,90',
    promoPrice: '39,90',
    coupon: '',
    category: '🔥 Achadinhos Virais',
    productLink: 'https://s.shopee.com.br/exemplo789',
    customNotes: 'Mantém gelado por 24h',
    productImageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'express' | 'generator' | 'omnichannel' | 'video-script' | 'bulk' | 'queue' | 'history' | 'n8n' | 'affiliate'>('express');
  
  // Form state
  const [formData, setFormData] = useState<ProductInput>({
    productName: '',
    originalPrice: '',
    promoPrice: '',
    productLink: '',
    coupon: '',
    category: '🔥 Achadinhos Virais',
    customNotes: '',
    temperature: 0.4,
    productImageUrl: ''
  });

  // Express URL state
  const [expressUrl, setExpressUrl] = useState<string>('');
  const [expressLoading, setExpressLoading] = useState<boolean>(false);

  const [generatedCopy, setGeneratedCopy] = useState<string>('');
  const [omnichannelPackage, setOmnichannelPackage] = useState<OmnichannelPackage | null>(null);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Saved history
  const [history, setHistory] = useState<SavedCopy[]>(() => {
    try {
      const saved = localStorage.getItem('copymaster_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Scheduling Queue state
  const [scheduleQueue, setScheduleQueue] = useState<ScheduledItem[]>(() => {
    try {
      const saved = localStorage.getItem('copymaster_schedule_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recently added item ID for success drop animation
  const [recentSuccessId, setRecentSuccessId] = useState<string | null>(null);

  // n8n Config state
  const [n8nConfig, setN8nConfig] = useState<N8nConfig>(() => {
    try {
      const saved = localStorage.getItem('copymaster_n8n_config');
      return saved ? JSON.parse(saved) : { webhookUrl: '', autoDispatchOnQueue: true };
    } catch {
      return { webhookUrl: '', autoDispatchOnQueue: true };
    }
  });

  // Affiliate config
  const [affiliates, setAffiliates] = useState<AffiliateConfig[]>(() => {
    try {
      const saved = localStorage.getItem('copymaster_affiliates');
      return saved ? JSON.parse(saved) : [
        { networkName: 'Shopee', paramName: 'aff_id', affiliateId: 'SEU_ID_SHOPEE', active: true },
        { networkName: 'AliExpress', paramName: 'pdp_npi', affiliateId: 'SEU_ID_ALI', active: false },
        { networkName: 'Amazon', paramName: 'tag', affiliateId: 'meuafiliado-20', active: false }
      ];
    } catch {
      return [
        { networkName: 'Shopee', paramName: 'aff_id', affiliateId: 'SEU_ID_SHOPEE', active: true }
      ];
    }
  });

  // Bulk generator state
  const [bulkInput, setBulkInput] = useState<string>('');
  const [bulkResults, setBulkResults] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // Search & Filter in history
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Drag and drop state for queue
  const [draggedCopy, setDraggedCopy] = useState<{ productName: string; copyText: string; productImageUrl?: string } | null>(null);

  // Fullscreen gallery lightbox state
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; title: string; price?: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('copymaster_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('copymaster_schedule_queue', JSON.stringify(scheduleQueue));
    } catch (e) {
      console.error(e);
    }
  }, [scheduleQueue]);

  useEffect(() => {
    try {
      localStorage.setItem('copymaster_n8n_config', JSON.stringify(n8nConfig));
    } catch (e) {
      console.error(e);
    }
  }, [n8nConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('copymaster_affiliates', JSON.stringify(affiliates));
    } catch (e) {
      console.error(e);
    }
  }, [affiliates]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const applyAffiliateLink = (link: string) => {
    if (!link) return link;
    const activeAff = affiliates.find(a => a.active);
    if (!activeAff || !activeAff.affiliateId || activeAff.affiliateId.includes('SEU_ID')) {
      return link;
    }
    try {
      const urlObj = new URL(link);
      urlObj.searchParams.set(activeAff.paramName, activeAff.affiliateId);
      return urlObj.toString();
    } catch {
      const sep = link.includes('?') ? '&' : '?';
      return `${link}${sep}${activeAff.paramName}=${activeAff.affiliateId}`;
    }
  };

  const validateProductImageUrl = (imageUrl: string, productUrl: string): string => {
    if (!imageUrl) return '';
    try {
      const prodUrlObj = new URL(productUrl);
      const imgUrlObj = new URL(imageUrl);

      const prodHost = prodUrlObj.hostname.toLowerCase();
      const imgHost = imgUrlObj.hostname.toLowerCase();

      const trustedCDNs = [
        'shopeecdn.com', 'ae01.alicdn.com', 'mlstatic.com', 'amazonaws.com',
        'images-amazon.com', 'media-amazon.com', 'shein.com', 'mercadolibre.com',
        'unsplash.com', 'alicdn.com', 'shopee.com'
      ];

      const isSameOrSubdomain = imgHost.includes(prodHost) || prodHost.includes(imgHost);
      const isTrustedCDN = trustedCDNs.some(cdn => imgHost.includes(cdn));

      if (isSameOrSubdomain || isTrustedCDN) {
        return imageUrl;
      }

      console.warn('Image URL domain mismatch with product seller:', imgHost, 'vs product host:', prodHost);
      return '';
    } catch {
      return '';
    }
  };

  const dispatchToN8nWebhook = async (item: { productName: string; copyText: string; productImageUrl?: string; timeSlot: string }) => {
    if (!n8nConfig.webhookUrl) return;
    try {
      const res = await fetch(n8nConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'copymaster_disparo_fila',
          productName: item.productName,
          copyText: item.copyText,
          productImageUrl: item.productImageUrl || '',
          scheduledTime: new Date().toLocaleDateString('pt-BR') + ' ' + item.timeSlot,
          timeSlot: item.timeSlot,
          timestamp: new Date().toISOString()
        })
      });
      if (res.ok) {
        showToast('Requisição POST enviada ao Webhook n8n!');
      } else {
        console.warn('n8n webhook responded with status:', res.status);
      }
    } catch (err) {
      console.error('Error dispatching to n8n webhook:', err);
      showToast('Erro ao disparar para o Webhook n8n (verifique a URL).');
    }
  };

  const handleExpressGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expressUrl.trim()) {
      setError('Por favor, informe a URL do produto.');
      return;
    }

    setExpressLoading(true);
    setError(null);

    const processedLink = applyAffiliateLink(expressUrl);

    try {
      const res = await fetch('/api/express-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUrl: processedLink })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar anúncio expresso.');

      const validatedImageUrl = validateProductImageUrl(data.productImageUrl, processedLink);

      setFormData({
        productName: data.productName || 'Produto Express',
        originalPrice: data.originalPrice || '',
        promoPrice: data.promoPrice || '',
        productLink: processedLink,
        coupon: data.coupon || '',
        category: data.category && CATEGORIES.includes(data.category) ? data.category : '🔥 Achadinhos Virais',
        customNotes: '',
        temperature: 0.4,
        productImageUrl: validatedImageUrl
      });

      setGeneratedCopy(data.copyText || '');

      const newCopyItem: SavedCopy = {
        id: Date.now().toString(),
        productName: data.productName || 'Produto Express',
        originalPrice: data.originalPrice || '',
        promoPrice: data.promoPrice || '',
        productLink: processedLink,
        coupon: data.coupon || '',
        category: data.category || '🔥 Achadinhos Virais',
        copyText: data.copyText || '',
        productImageUrl: validatedImageUrl,
        createdAt: new Date().toLocaleString('pt-BR'),
        favorite: false,
        clicks: 0
      };

      setHistory(prev => [newCopyItem, ...prev]);
      setActiveTab('generator');
      showToast('Anúncio Expresso validado e gerado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar link do produto.');
    } finally {
      setExpressLoading(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.productName.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    setLoading(true);
    setError(null);

    const processedLink = applyAffiliateLink(formData.productLink);

    try {
      const res = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productLink: processedLink
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar copy.');

      setGeneratedCopy(data.copy);

      const newCopyItem: SavedCopy = {
        id: Date.now().toString(),
        productName: formData.productName,
        originalPrice: formData.originalPrice,
        promoPrice: formData.promoPrice,
        productLink: processedLink,
        coupon: formData.coupon,
        category: formData.category,
        copyText: data.copy,
        productImageUrl: formData.productImageUrl,
        createdAt: new Date().toLocaleString('pt-BR'),
        favorite: false,
        clicks: 0
      };

      setHistory(prev => [newCopyItem, ...prev]);
      showToast('Copy gerada com sucesso e salva no histórico!');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOmnichannel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.productName.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    setLoading(true);
    setError(null);

    const processedLink = applyAffiliateLink(formData.productLink);

    try {
      const res = await fetch('/api/omnichannel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productLink: processedLink
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar pacote omnichannel.');

      setOmnichannelPackage(data);
      showToast('Pacote Omnichannel em JSON gerado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideoScript = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.productName.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    setLoading(true);
    setError(null);

    const processedLink = applyAffiliateLink(formData.productLink);

    try {
      const res = await fetch('/api/video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productLink: processedLink
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar roteiro de vídeo.');

      setVideoScript(data);
      showToast('Roteiro de Vídeo para Reels / TikTok gerado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, productImageUrl: base64 }));
      setExtracting(true);
      setError(null);
      try {
        const res = await fetch('/api/extract-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao analisar imagem.');

        setFormData(prev => ({
          ...prev,
          productName: data.productName || prev.productName,
          originalPrice: data.originalPrice || prev.originalPrice,
          promoPrice: data.promoPrice || prev.promoPrice,
          coupon: data.coupon || prev.coupon,
          category: data.category && CATEGORIES.includes(data.category) ? data.category : prev.category
        }));
        showToast('Foto anexada e dados extraídos com IA!');
      } catch (err: any) {
        setError(err.message || 'Falha ao extrair dados da imagem.');
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setFormData({
      productName: tmpl.productName,
      originalPrice: tmpl.originalPrice,
      promoPrice: tmpl.promoPrice,
      productLink: tmpl.productLink,
      coupon: tmpl.coupon,
      category: tmpl.category,
      customNotes: tmpl.customNotes,
      temperature: 0.4,
      productImageUrl: tmpl.productImageUrl
    });
    showToast(`Template "${tmpl.productName.substring(0, 20)}..." carregado com foto!`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = (text: string, imageUrl?: string) => {
    let message = text;
    if (imageUrl) {
      message = `📸 *Foto do Produto:* ${imageUrl}\n\n${text}`;
    }
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const shareTelegram = (text: string, imageUrl?: string) => {
    let message = text;
    if (imageUrl) {
      message = `📸 ${imageUrl}\n\n${text}`;
    }
    const encoded = encodeURIComponent(message);
    window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
  };

  const addToQueue = (productName: string, copyText: string, timeSlot: string = '18:00', productImageUrl?: string, scheduledDate?: string) => {
    const newItemId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const todayStr = new Date().toISOString().split('T')[0];
    const dateToUse = scheduledDate || todayStr;
    const newItem: ScheduledItem = {
      id: newItemId,
      productName,
      copyText,
      scheduledTime: `${dateToUse} ${timeSlot}`,
      scheduledDate: dateToUse,
      timeSlot,
      status: 'pending',
      platform: 'whatsapp',
      productImageUrl
    };
    setScheduleQueue(prev => [newItem, ...prev]);
    setRecentSuccessId(newItemId);
    setTimeout(() => setRecentSuccessId(null), 2000);

    showToast(`Adicionado à Fila (${dateToUse} às ${timeSlot}) com sucesso! 🚀`);

    if (n8nConfig.webhookUrl && n8nConfig.autoDispatchOnQueue) {
      dispatchToN8nWebhook({ productName, copyText, productImageUrl, timeSlot });
    }
  };

  const updateQueueItemDateTime = (id: string, newDate: string, newTime: string) => {
    setScheduleQueue(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          scheduledDate: newDate,
          timeSlot: newTime,
          scheduledTime: `${newDate} ${newTime}`
        };
      }
      return item;
    }));
    showToast('Data e horário de agendamento atualizados!');
  };

  const handleDragStart = (productName: string, copyText: string, productImageUrl?: string) => {
    setDraggedCopy({ productName, copyText, productImageUrl });
  };

  const handleDropOnSlot = (timeSlot: string) => {
    if (!draggedCopy) return;
    addToQueue(draggedCopy.productName, draggedCopy.copyText, timeSlot, draggedCopy.productImageUrl);
    setDraggedCopy(null);
  };

  const toggleQueueStatus = (id: string) => {
    setScheduleQueue(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'pending' ? 'sent' : 'pending';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const removeQueueItem = (id: string) => {
    setScheduleQueue(prev => prev.filter(item => item.id !== id));
    showToast('Item removido da fila.');
  };

  const exportHistoryCSV = () => {
    if (history.length === 0) {
      showToast('Nenhum item no histórico para exportar.');
      return;
    }
    const headers = ['ID', 'Produto', 'Preço De', 'Preço Por', 'Cupom', 'Categoria', 'Link', 'Data', 'Copy'];
    const rows = history.map(item => [
      item.id,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.originalPrice || ''}"`,
      `"${item.promoPrice || ''}"`,
      `"${item.coupon || ''}"`,
      `"${item.category}"`,
      `"${item.productLink}"`,
      `"${item.createdAt}"`,
      `"${item.copyText.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `copymaster_historico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Histórico exportado em CSV com sucesso!');
  };

  const exportHistoryJSON = () => {
    if (history.length === 0) {
      showToast('Nenhum item no histórico para exportar.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `copymaster_historico_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    showToast('Histórico exportado em JSON com sucesso!');
  };

  const handleBulkGenerate = async () => {
    if (!bulkInput.trim()) return;
    setBulkLoading(true);
    const lines = bulkInput.split('\n').filter(l => l.trim().length > 0);
    const results: string[] = [];

    for (const line of lines) {
      try {
        const parts = line.split('|').map(p => p.trim());
        const pName = parts[0] || line;
        const pOrig = parts[1] || '';
        const pPromo = parts[2] || '';
        const pLink = applyAffiliateLink(parts[3] || '');
        const pCoupon = parts[4] || '';

        const res = await fetch('/api/generate-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: pName,
            originalPrice: pOrig,
            promoPrice: pPromo,
            productLink: pLink,
            coupon: pCoupon,
            category: '🔥 Achadinhos Virais',
            temperature: 0.4
          })
        });
        const data = await res.json();
        if (res.ok && data.copy) {
          results.push(data.copy);
        }
      } catch (err) {
        console.error('Bulk item error:', err);
      }
    }

    setBulkResults(results);
    setBulkLoading(false);
    showToast(`${results.length} copies geradas em lote com sucesso!`);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.copyText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{successToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white flex items-center gap-2">
                CopyMaster <span className="text-xs uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">AI Pro</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Fila de Agendamento Dinâmica & n8n</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('express')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'express'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Criação Expressa ⚡</span>
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('omnichannel')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'omnichannel'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden md:inline">Omnichannel</span>
            </button>
            <button
              onClick={() => setActiveTab('video-script')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'video-script'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-4 h-4" />
              <span className="hidden md:inline">Roteiro Vídeo</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'queue'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Fila</span>
              {scheduleQueue.filter(i => i.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {scheduleQueue.filter(i => i.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('n8n')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'n8n'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Workflow className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline">n8n</span>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'bulk'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">Lote</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Histórico</span>
            </button>
            <button
              onClick={() => setActiveTab('affiliate')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'affiliate'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Config</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* N8N INTEGRATION TAB */}
        {activeTab === 'n8n' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Integração n8n (Webhook Automático)</h2>
                  <p className="text-xs text-slate-400">Envie a copy e a imagem do produto via requisição POST ao salvar na fila.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">URL do Webhook do n8n (POST)</label>
                  <input
                    type="url"
                    value={n8nConfig.webhookUrl}
                    onChange={e => setN8nConfig({ ...n8nConfig, webhookUrl: e.target.value })}
                    placeholder="https://seu-n8n.com/webhook/copymaster-disparos"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">O n8n receberá um JSON contendo `productName`, `copyText`, `productImageUrl` e `timeSlot`.</p>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-semibold text-sm text-white block">Disparo Automático ao Salvar na Fila</span>
                    <span className="text-xs text-slate-400">Envia o POST para o n8n instantaneamente sempre que agendar um item.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={n8nConfig.autoDispatchOnQueue}
                      onChange={e => setN8nConfig({ ...n8nConfig, autoDispatchOnQueue: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Configurações do n8n salvas com sucesso!');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md text-sm"
                  >
                    Salvar Configuração n8n
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n8nConfig.webhookUrl) {
                        alert('Informe a URL do webhook primeiro.');
                        return;
                      }
                      dispatchToN8nWebhook({
                        productName: 'Teste de Conexão n8n',
                        copyText: '🔥 Teste de copy enviado com sucesso via Webhook do n8n!',
                        productImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
                        timeSlot: '18:00'
                      });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-3 rounded-xl font-medium transition-all border border-slate-700"
                  >
                    Testar Webhook ⚡
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPRESS CREATION TAB */}
        {activeTab === 'express' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
                  <Zap className="w-6 h-6 animate-pulse text-amber-400" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">Criação Expressa por Link</h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto">
                  Cole o link de qualquer produto (Shopee, AliExpress, Amazon, Mercado Livre...) e nossa IA analisa o link, extrai a imagem, descobre os preços e cria o anúncio completo instantaneamente! ⚡
                </p>
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleExpressGeneration} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">URL do Produto (Link de Afiliado ou Loja)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 pointer-events-none">
                      <Link2 className="w-5 h-5 text-emerald-400" />
                    </span>
                    <input
                      type="url"
                      required
                      value={expressUrl}
                      onChange={e => setExpressUrl(e.target.value)}
                      placeholder="https://s.shopee.com.br/... ou https://www.amazon.com.br/..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-600 focus:outline-none shadow-inner transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={expressLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                >
                  {expressLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Analisando Link, Imagem e Criando Anúncio com IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-slate-950" />
                      <span>Criar Anúncio Expresso com 1 Clique ⚡</span>
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold text-sm block mb-1">1. Extração Inteligente</span>
                  <span className="text-xs text-slate-400">Identifica nome, preço e desconto.</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold text-sm block mb-1">2. Foto Automática</span>
                  <span className="text-xs text-slate-400">Captura e anexa a imagem do produto.</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold text-sm block mb-1">3. Copy de Vendas</span>
                  <span className="text-xs text-slate-400">Pronta para WhatsApp & Telegram.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Templates Rápidos com Foto
                  </span>
                  <span className="text-xs text-slate-500">Clique para testar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadTemplate(tmpl)}
                      className="text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all text-xs group flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white truncate group-hover:text-emerald-400">{tmpl.productName}</div>
                      </div>
                      <div className="text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-700/50">
                        <span className="text-emerald-400 font-medium">R$ {tmpl.promoPrice}</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">📷 Com Foto</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Foto do Produto (Anexar ou Print)</h3>
                    <p className="text-xs text-slate-400">A foto acompanhará a mensagem no WhatsApp/Telegram</p>
                  </div>
                </div>
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2">
                  {extracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{extracting ? 'Processando...' : 'Enviar Foto'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <form onSubmit={handleGenerate} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" /> Dados do Produto & Foto
                  </h2>
                  <span className="text-xs text-slate-400">Regras de WhatsApp Ativas</span>
                </div>

                {error && (
                  <div className="bg-red-950/50 border border-red-500/50 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Ex: Fone Bluetooth Lenovo LP40 Pro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preço Original (R$)</label>
                    <input
                      type="text"
                      value={formData.originalPrice}
                      onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="98,50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preço Promocional (R$) *</label>
                    <input
                      type="text"
                      required
                      value={formData.promoPrice}
                      onChange={e => setFormData({ ...formData, promoPrice: e.target.value })}
                      placeholder="32,90"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">URL da Foto do Produto (Opcional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={formData.productImageUrl}
                      onChange={e => setFormData({ ...formData, productImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... ou URL da foto"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {formData.productImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex items-center gap-3">
                    <img src={formData.productImageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-emerald-400 block">Foto do Produto Anexada</span>
                      <span className="text-slate-400 truncate block">{formData.productImageUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, productImageUrl: '' })}
                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                    >
                      Remover
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Cupom de Desconto</label>
                    <input
                      type="text"
                      value={formData.coupon}
                      onChange={e => setFormData({ ...formData, coupon: e.target.value })}
                      placeholder="Ex: CUPOM10 (opcional)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Link de Afiliado (Shopee, Ali, Amazon...)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={formData.productLink}
                      onChange={e => setFormData({ ...formData, productLink: e.target.value })}
                      placeholder="https://s.shopee.com.br/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Gerando Copy com Foto...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Gerar Copy com Foto para WhatsApp</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Copy Output & WhatsApp Preview with Photo */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" /> Mensagem Pronta com Foto
                  </h3>
                  {generatedCopy && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(generatedCopy)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border border-slate-700"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {generatedCopy ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-slate-400">Edite a mensagem antes de disparar ou agendar:</label>
                        <button
                          onClick={() => addToQueue(formData.productName || 'Produto', generatedCopy, '18:00', formData.productImageUrl)}
                          className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Enviar para Fila
                        </button>
                      </div>
                      <textarea
                        rows={8}
                        value={generatedCopy}
                        onChange={e => setGeneratedCopy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => shareWhatsApp(generatedCopy, formData.productImageUrl)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar no WhatsApp</span>
                      </button>
                      <button
                        onClick={() => shareTelegram(generatedCopy, formData.productImageUrl)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-600/20"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Enviar no Telegram</span>
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400">
                        <Smartphone className="w-4 h-4 text-emerald-400" /> Pré-visualização Real no Celular (WhatsApp com Foto)
                      </div>
                      <div className="bg-[#0b141a] rounded-2xl p-4 border border-slate-800 shadow-2xl relative overflow-hidden max-w-sm mx-auto space-y-2">
                        {formData.productImageUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-700/50 max-h-48 bg-slate-900">
                            <img src={formData.productImageUrl} alt="Produto" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="bg-[#202c33] rounded-xl p-3 text-xs text-slate-100 font-sans shadow-md border border-slate-700/50 whitespace-pre-wrap leading-relaxed">
                          {generatedCopy}
                        </div>
                        <div className="text-[10px] text-right text-slate-500">18:42 ✓✓</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-3">
                    <Sparkles className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                    <p className="text-sm">Use a <strong className="text-emerald-400">Criação Expressa</strong> para gerar anúncios completos via link automaticamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIDEO SCRIPT GENERATOR TAB */}
        {activeTab === 'video-script' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h2 className="font-bold text-base text-white flex items-center gap-2">
                    <Film className="w-5 h-5 text-emerald-400" /> Gerador de Roteiro para Reels / TikTok
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Crie um roteiro de vídeo magnético com marcações de tempo, transições visuais e gatilhos de conversão.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-950/50 border border-red-500/50 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Ex: Mini Aspirador 3 em 1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preço Original (R$)</label>
                    <input
                      type="text"
                      value={formData.originalPrice}
                      onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="149,90"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preço Promocional (R$) *</label>
                    <input
                      type="text"
                      required
                      value={formData.promoPrice}
                      onChange={e => setFormData({ ...formData, promoPrice: e.target.value })}
                      placeholder="59,90"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cupom de Desconto</label>
                  <input
                    type="text"
                    value={formData.coupon}
                    onChange={e => setFormData({ ...formData, coupon: e.target.value })}
                    placeholder="Ex: ASPIRADOR20"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVideoScript}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                  <span>{loading ? 'Criando Roteiro Viral...' : 'Gerar Roteiro de Vídeo (IA)'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {videoScript ? (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                        {videoScript.platform} • {videoScript.duration}
                      </span>
                      <h3 className="font-bold text-lg text-white mt-2">{videoScript.title}</h3>
                    </div>
                    <button
                      onClick={() => {
                        const formattedText = `ROTEIRO DE VÍDEO: ${videoScript.title}\nPlataforma: ${videoScript.platform} (${videoScript.duration})\nHook: ${videoScript.hook}\n\n` +
                          videoScript.scenes.map(s => `[${s.timestamp}]\nVisual: ${s.visual}\nTransição: ${s.transition}\nTexto na Tela: ${s.textOnScreen}\nLocução: ${s.audioVoiceover}\n`).join('\n') +
                          `\nCTA: ${videoScript.callToAction}\nÁudio Sugerido: ${videoScript.suggestedAudio}`;
                        copyToClipboard(formattedText);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-xs px-3.5 py-2 rounded-xl text-slate-200 font-medium flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" /> Copiar Roteiro Completo
                    </button>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-1">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Hook Matador (Primeiros 3 Segundos):
                    </div>
                    <p className="text-sm text-slate-100 font-medium">"{videoScript.hook}"</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-300">Cenas e Marcações de Tempo:</h4>
                    {videoScript.scenes.map((scene, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded">
                            ⏱ {scene.timestamp}
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            🎬 Transição: {scene.transition}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-900/80 p-3 rounded-lg space-y-1">
                            <span className="text-slate-400 font-semibold block">Visual / Ação na Câmera:</span>
                            <p className="text-slate-200">{scene.visual}</p>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-lg space-y-1">
                            <span className="text-cyan-400 font-semibold block">Texto na Tela (Legenda Dinâmica):</span>
                            <p className="text-slate-200 font-medium">"{scene.textOnScreen}"</p>
                          </div>
                        </div>

                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg text-xs space-y-1">
                          <span className="text-emerald-300 font-semibold block">Locução / Áudio Falado:</span>
                          <p className="text-slate-100 italic">"{scene.audioVoiceover}"</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                      <span className="text-xs text-amber-400 font-semibold block">Chamada para Ação (CTA):</span>
                      <p className="text-xs text-slate-200">{videoScript.callToAction}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                      <span className="text-xs text-pink-400 font-semibold block">Trilha Sonora Sugerida:</span>
                      <p className="text-xs text-slate-200">{videoScript.suggestedAudio}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                  <Film className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                  <h4 className="font-semibold text-slate-300">Nenhum roteiro de vídeo gerado ainda</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Preencha os dados ao lado e clique em <strong className="text-slate-300">"Gerar Roteiro de Vídeo"</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCHEDULING QUEUE TAB */}
        {activeTab === 'queue' && (
          <div className="space-y-8">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" /> Fila de Agendamento de Disparos (Framer Motion)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Arraste ou envie copies geradas para os horários de pico. Animações fluidas de transição e sucesso ao agendar.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-medium">
                  {scheduleQueue.length} itens na fila ({scheduleQueue.filter(i => i.status === 'pending').length} pendentes)
                </span>
                {scheduleQueue.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Deseja limpar toda a fila de agendamento?')) {
                        setScheduleQueue([]);
                        showToast('Fila limpa.');
                      }
                    }}
                    className="bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/30 text-xs px-3 py-1.5 rounded-xl transition-all"
                  >
                    Limpar Fila
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIME_SLOTS.map(slot => {
                const slotItems = scheduleQueue.filter(i => i.timeSlot === slot.time);
                return (
                  <div
                    key={slot.time}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDropOnSlot(slot.time)}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[400px] shadow-lg transition-all hover:border-emerald-500/40 group"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{slot.icon}</span> {slot.label}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono font-semibold mt-0.5">{slot.time}</div>
                      </div>
                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        {slotItems.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <AnimatePresence>
                        {slotItems.length > 0 ? (
                          slotItems.map(item => {
                            const isRecentlyAdded = recentSuccessId === item.id;
                            return (
                              <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  y: 0,
                                  borderColor: isRecentlyAdded ? '#10b981' : '#1e293b',
                                  backgroundColor: isRecentlyAdded ? 'rgba(16, 185, 129, 0.15)' : '#090d16'
                                }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 25 }}
                                className={`border rounded-xl p-3.5 space-y-2.5 shadow-md relative overflow-hidden ${
                                  item.status === 'sent' ? 'border-emerald-500/40 opacity-75 bg-emerald-950/10' : 'border-slate-800'
                                }`}
                              >
                                {isRecentlyAdded && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute top-2 right-2 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg flex items-center justify-center"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </motion.div>
                                )}

                                {item.productImageUrl && (
                                  <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                    <img src={item.productImageUrl} alt="Produto" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-white truncate max-w-[140px]">{item.productName}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => dispatchToN8nWebhook(item)}
                                      title="Disparar POST para o Webhook n8n"
                                      className="p-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 rounded-lg text-xs"
                                    >
                                      <Workflow className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => toggleQueueStatus(item.id)}
                                      title={item.status === 'pending' ? 'Marcar como Disparado' : 'Marcar como Pendente'}
                                      className={`p-1 rounded-lg text-xs ${
                                        item.status === 'sent' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => removeQueueItem(item.id)}
                                      className="p-1 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-lg text-[11px] text-slate-300 font-mono line-clamp-3 leading-relaxed">
                                  {item.copyText}
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    item.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    {item.status === 'sent' ? '✓ Disparado' : '⏳ Pendente'}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => copyToClipboard(item.copyText)}
                                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded"
                                    >
                                      Copiar
                                    </button>
                                    <button
                                      onClick={() => shareWhatsApp(item.copyText, item.productImageUrl)}
                                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded flex items-center gap-1"
                                    >
                                      <Send className="w-3 h-3" /> Wpp
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-slate-800/80 rounded-xl text-slate-600"
                          >
                            <Workflow className="w-6 h-6 mb-2 opacity-40 text-orange-400" />
                            <p className="text-xs">Arraste uma copy do histórico aqui ou clique em "Enviar para Fila"</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {history.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-emerald-400" /> Histórico de Copies Disponíveis para Arrastar (Drag & Drop)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {history.slice(0, 6).map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      draggable
                      onDragStart={() => handleDragStart(item.productName, item.copyText, item.productImageUrl)}
                      className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all space-y-2 group shadow-md"
                    >
                      {item.productImageUrl && (
                        <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                          <img src={item.productImageUrl} alt="Produto" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{item.productName}</span>
                        <span className="text-[10px] text-slate-500">{item.promoPrice ? `R$ ${item.promoPrice}` : ''}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono line-clamp-2">
                        {item.copyText}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <GripVertical className="w-3 h-3" /> Arraste para o horário
                        </span>
                        <button
                          onClick={() => addToQueue(item.productName, item.copyText, '18:00', item.productImageUrl)}
                          className="text-[10px] bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-2.5 py-1 rounded transition-all"
                        >
                          + Agendar 18:00
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* OMNICHANNEL ORCHESTRATOR TAB */}
        {activeTab === 'omnichannel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h2 className="font-bold text-base text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" /> Orquestrador Omnicanal (JSON)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Gere o pacote completo estruturado em JSON para automações no n8n (WhatsApp, Instagram, Facebook e TikTok).
                  </p>
                </div>

                {error && (
                  <div className="bg-red-950/50 border border-red-500/50 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Ex: Fone Bluetooth Lenovo LP40 Pro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preço Original (R$)</label>
                    <input
                      type="text"
                      value={formData.originalPrice}
                      onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="98,50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preço Promocional (R$) *</label>
                    <input
                      type="text"
                      required
                      value={formData.promoPrice}
                      onChange={e => setFormData({ ...formData, promoPrice: e.target.value })}
                      placeholder="32,90"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Link de Afiliado</label>
                  <input
                    type="url"
                    value={formData.productLink}
                    onChange={e => setFormData({ ...formData, productLink: e.target.value })}
                    placeholder="https://s.shopee.com.br/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cupom de Desconto</label>
                  <input
                    type="text"
                    value={formData.coupon}
                    onChange={e => setFormData({ ...formData, coupon: e.target.value })}
                    placeholder="Ex: CUPOM10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateOmnichannel}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                  <span>{loading ? 'Orquestrando Pacote...' : 'Gerar Pacote Omnicanal (JSON)'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {omnichannelPackage ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Horário de Pico Sugerido (IA)</div>
                        <div className="font-bold text-lg text-emerald-300">{omnichannelPackage.agendamento_sugerido}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToQueue(omnichannelPackage.produto, omnichannelPackage.estrategia_por_rede.whatsapp_telegram.copy, omnichannelPackage.agendamento_sugerido, formData.productImageUrl)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Agendar para {omnichannelPackage.agendamento_sugerido}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp & Telegram
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(omnichannelPackage.estrategia_por_rede.whatsapp_telegram.copy)}
                            className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200"
                          >
                            Copiar
                          </button>
                          <button
                            onClick={() => shareWhatsApp(omnichannelPackage.estrategia_por_rede.whatsapp_telegram.copy, formData.productImageUrl)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-1.5 rounded-lg text-white"
                          >
                            Enviar WhatsApp
                          </button>
                        </div>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-300 leading-relaxed">
                        {omnichannelPackage.estrategia_por_rede.whatsapp_telegram.copy}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-pink-400" /> Instagram & Facebook (Feed/Reels)
                        </h4>
                        <button
                          onClick={() => copyToClipboard(omnichannelPackage.estrategia_por_rede.instagram_facebook.legenda_post)}
                          className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200"
                        >
                          Copiar Legenda
                        </button>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-300 leading-relaxed">
                        {omnichannelPackage.estrategia_por_rede.instagram_facebook.legenda_post}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-cyan-400" /> TikTok (Vídeo & Legenda)
                        </h4>
                        <button
                          onClick={() => copyToClipboard(`Hook na Tela:\n${omnichannelPackage.estrategia_por_rede.tiktok.ideia_hook_video}\n\nLegenda:\n${omnichannelPackage.estrategia_por_rede.tiktok.legenda}`)}
                          className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200"
                        >
                          Copiar TikTok
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3 rounded-xl text-xs text-slate-300">
                          <strong className="text-cyan-400 block mb-1">Hook (3s na tela):</strong>
                          {omnichannelPackage.estrategia_por_rede.tiktok.ideia_hook_video}
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl text-xs text-slate-300">
                          <strong className="text-cyan-400 block mb-1">Legenda:</strong>
                          {omnichannelPackage.estrategia_por_rede.tiktok.legenda}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Code className="w-4 h-4 text-amber-400" /> JSON Bruto (Pronto para n8n / Webhook)
                        </h4>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(omnichannelPackage, null, 2))}
                          className="bg-amber-600 hover:bg-amber-500 text-xs px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copiar JSON
                        </button>
                      </div>
                      <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto max-h-60">
                        {JSON.stringify(omnichannelPackage, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                  <Globe className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                  <h4 className="font-semibold text-slate-300">Nenhum pacote omnichannel gerado ainda</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Preencha os dados do produto ao lado e clique em <strong className="text-slate-300">"Gerar Pacote Omnicanal"</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BULK / LOTE TAB */}
        {activeTab === 'bulk' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" /> Gerador de Ofertas em Lote
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Insira vários produtos (um por linha) no formato: <code className="bg-slate-950 px-2 py-0.5 rounded text-emerald-400">Nome | Preço De | Preço Por | Link | Cupom</code>
                </p>
              </div>

              <textarea
                rows={6}
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                placeholder={`Fone Lenovo LP40 | 98,50 | 32,90 | https://s.shopee.com.br/123 | CUPOM10\nMini Aspirador 3em1 | 149,90 | 59,90 | https://s.shopee.com.br/456 |`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={bulkLoading || !bulkInput.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {bulkLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{bulkLoading ? 'Gerando Lote...' : 'Gerar Todas as Copies em Lote'}</span>
              </button>
            </div>

            {bulkResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Resultados Gerados ({bulkResults.length})</h3>
                  <button
                    onClick={() => copyToClipboard(bulkResults.join('\n\n-------------------\n\n'))}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  >
                    Copiar Todas as Copies
                  </button>
                </div>
                {bulkResults.map((res, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative group">
                    <div className="text-xs text-slate-100 font-mono whitespace-pre-wrap leading-relaxed">{res}</div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyToClipboard(res)}
                        className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded text-slate-300"
                      >
                        Copiar
                      </button>
                      <button
                        onClick={() => shareWhatsApp(res, formData.productImageUrl)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-1 rounded text-white"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => addToQueue('Produto em Lote', res, '18:00', formData.productImageUrl)}
                        className="bg-slate-800 hover:bg-emerald-600 text-xs px-3 py-1 rounded text-slate-200 hover:text-white"
                      >
                        + Fila
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar no histórico..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas as Categorias</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {history.length > 0 && (
                  <>
                    <button
                      onClick={exportHistoryCSV}
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>
                    <button
                      onClick={exportHistoryJSON}
                      className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar JSON</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                          setHistory([]);
                          showToast('Histórico limpo.');
                        }
                      }}
                      className="bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/30 text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Tudo</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.map(item => (
                  <div key={item.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                    <div className="space-y-3">
                      {item.productImageUrl && (
                        <div
                          onClick={() => setFullscreenImage({ url: item.productImageUrl!, title: item.productName, price: item.promoPrice })}
                          className="w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer relative group/img shadow-md hover:border-emerald-500/50 transition-all"
                        >
                          <img src={item.productImageUrl} alt="Produto" className="w-full h-full object-cover group-hover/img:scale-105 transition-all duration-300" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-1.5 text-white font-medium text-xs">
                            <Search className="w-4 h-4 text-emerald-400" /> Ampliar Imagem
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{item.productName}</h4>
                      <div className="bg-slate-950 rounded-xl p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap line-clamp-4 leading-relaxed">
                        {item.copyText}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        {item.promoPrice && <span className="text-emerald-400 font-semibold">R$ {item.promoPrice}</span>}
                        {item.coupon && <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded text-[10px]">Cupom: {item.coupon}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToQueue(item.productName, item.copyText, '18:00', item.productImageUrl)}
                          className="bg-slate-800 hover:bg-emerald-600 text-xs px-3 py-1.5 rounded-lg text-slate-200 hover:text-white font-medium flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Fila
                        </button>
                        <button
                          onClick={() => copyToClipboard(item.copyText)}
                          className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 font-medium flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copiar
                        </button>
                        <button
                          onClick={() => shareWhatsApp(item.copyText, item.productImageUrl)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Wpp
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <History className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <h4 className="font-semibold text-slate-300">Nenhuma copy encontrada no histórico</h4>
                <p className="text-xs text-slate-500 mt-1">Gere sua primeira oferta para salvá-la automaticamente.</p>
              </div>
            )}
          </div>
        )}

        {/* AFFILIATE & UTM TAB */}
        {activeTab === 'affiliate' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" /> Configuração de Redes de Afiliados
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure seu ID de afiliado para que ele seja inserido automaticamente em todos os links gerados.
                </p>
              </div>

              <div className="space-y-4">
                {affiliates.map((aff, index) => (
                  <div key={index} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{aff.networkName}</span>
                        {aff.active && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Ativo
                          </span>
                        )}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aff.active}
                          onChange={e => {
                            const updated = affiliates.map((a, i) => ({
                              ...a,
                              active: i === index ? e.target.checked : false
                            }));
                            setAffiliates(updated);
                            showToast(`Rede ${aff.networkName} ${e.target.checked ? 'ativada' : 'desativada'}`);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Parâmetro URL (ex: aff_id, tag)</label>
                        <input
                          type="text"
                          value={aff.paramName}
                          onChange={e => {
                            const val = e.target.value;
                            setAffiliates(prev => prev.map((a, i) => i === index ? { ...a, paramName: val } : a));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Seu ID / Código de Afiliado</label>
                        <input
                          type="text"
                          value={aff.affiliateId}
                          onChange={e => {
                            const val = e.target.value;
                            setAffiliates(prev => prev.map((a, i) => i === index ? { ...a, affiliateId: val } : a));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dica Pro para Afiliados
                </div>
                <p className="text-slate-300">
                  Sempre que você gerar uma copy com foto, o sistema incluirá a imagem para envio em massa no WhatsApp!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fullscreen Image Gallery Lightbox Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base truncate">{fullscreenImage.title}</h3>
                  {fullscreenImage.price && (
                    <span className="text-xs text-emerald-400 font-semibold">Preço Promocional: R$ {fullscreenImage.price}</span>
                  )}
                </div>
                <button
                  onClick={() => setFullscreenImage(null)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-hidden bg-slate-950 flex items-center justify-center p-6">
                <img
                  src={fullscreenImage.url}
                  alt={fullscreenImage.title}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={fullscreenImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium underline"
                >
                  Abrir imagem original em nova aba ↗
                </a>
                <button
                  onClick={() => setFullscreenImage(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-xl transition-all font-medium"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-500">
        <p>CopyMaster AI • Transições Framer Motion & Fila Dinâmica • Conectado ao Google Gemini 3.8 Flash</p>
      </footer>
    </div>
  );
}
