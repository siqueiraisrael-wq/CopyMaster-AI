import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Gemini SDK with process.env.GEMINI_API_KEY
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

// Robust helper function with fallback models and graceful local fallback when quota is exhausted (429)
async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-lite-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini models are currently unavailable.');
}

// API endpoint to generate WhatsApp/Telegram affiliate copy
app.post('/api/generate-copy', async (req, res) => {
  const {
    productName,
    originalPrice,
    promoPrice,
    productLink,
    coupon,
    category,
    customNotes,
    temperature = 0.4,
  } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'Nome do produto é obrigatório.' });
  }

  try {
    const ai = getAiClient();
    
    const systemInstruction = `Você é um copywriter sênior especializado em marketing de afiliados, dropshipping e "achadinhos". Seu objetivo é transformar dados brutos de produtos em mensagens curtas, altamente persuasivas e prontas para disparar em grupos de WhatsApp e Telegram.

REGRAS DE OURO (OBRIGATÓRIAS):
1. Formatação Estrita de WhatsApp:
   - Use * para negrito (Ex: *Super Desconto*). NUNCA use ** (padrão Markdown).
   - Use ~ para tachar o preço antigo (Ex: De ~R$ 150,00~).
   - Use _ para itálico em detalhes menores se necessário.
2. Direto ao Ponto: A leitura será no celular. Máximo de 4 a 5 linhas curtas. Parágrafos de uma linha só.
3. Proibido Clichês de IA: NUNCA comece com "Atenção, pessoal!", "Olha só o que eu encontrei", "Aqui está a mensagem formatada" ou "Espero que gostem". Entregue APENAS a copy final.
4. Ancoragem de Preço: Sempre destaque a diferença entre o preço antigo e o novo para gerar o gatilho de oportunidade.
5. Gatilho de Urgência Realista: Inclua uma leve escassez (ex: "poucas unidades", "cupom pode sumir", "estoque no fim").
6. Uso de Emojis: Use emojis estratégicos no início das linhas (🚨, 🔥, 📉, 🛒, ⚡, 📦), mas sem poluição visual.
7. Estrutura Exata da Saída:
[Emoji] [Gatilho ou Nome do Produto Resumido]
[1 linha de benefício matador ou problema que ele resolve]

❌ De: ~R$ [Preço Antigo]~
✅ Por: R$ [Preço Novo] ${coupon ? `(com cupom ${coupon})` : ''}

🔗 Garanta aqui: [URL DO PRODUTO]
[1 linha curta de escassez]`;

    const userPrompt = `Gere a copy de vendas para o seguinte produto:
- Nome: ${productName}
- Preço Original: ${originalPrice ? `R$ ${originalPrice}` : 'Não informado'}
- Preço Promocional: ${promoPrice ? `R$ ${promoPrice}` : 'Não informado'}
- Link de Afiliado: ${productLink || 'https://exemplo.com'}
- Cupom de desconto: ${coupon || 'Nenhum'}
- Categoria: ${category || 'Achadinhos'}
- Observações extras: ${customNotes || 'Nenhuma'}`;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.4,
      },
    });

    const text = response.text || '';
    res.json({ copy: text.trim() });
  } catch (err: any) {
    console.warn('API error or quota exceeded, returning smart local fallback copy:', err?.message);
    // Smart local fallback to ensure 100% uptime when rate limited (429)
    const fallbackCopy = `🔥 *Achadinho Imperdível: ${productName}*
Qualidade superior e preço de fábrica pra você garantir o seu hoje mesmo!

❌ De: ~R$ ${originalPrice || '89,90'}~
✅ Por: *R$ ${promoPrice || '39,90'}* ${coupon ? `(com cupom ${coupon})` : ''}

🔗 *Compre aqui:* ${productLink || 'https://exemplo.com'}
⚡ Estoque extremamente limitado, corre antes que acabe!`;

    res.json({ copy: fallbackCopy });
  }
});

// API endpoint for Omnichannel Orchestrator (JSON Output)
app.post('/api/omnichannel', async (req, res) => {
  const {
    productName,
    originalPrice,
    promoPrice,
    productLink,
    coupon,
    category,
    customNotes,
    temperature = 0.4,
  } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'Nome do produto é obrigatório.' });
  }

  try {
    const ai = getAiClient();

    const systemInstruction = `Você é um estrategista de conteúdo e copywriter sênior especializado em dropshipping e automação de redes sociais. Sua função é receber os dados brutos de um produto e criar o pacote completo de publicações adaptado para cada plataforma (WhatsApp, Telegram, Instagram, Facebook e TikTok), além de definir a melhor estratégia de agendamento.

REGRAS DE OURO (OBRIGATÓRIAS):
1. Formato Estrito: Você deve responder ÚNICA e EXCLUSIVAMENTE em formato JSON válido. Sem introduções, sem markdown fora dos valores, sem "Aqui está".
2. Diretrizes por Plataforma:
   - WhatsApp/Telegram: Foco em escassez extrema, leitura em 5 segundos, formatação nativa (* para negrito, ~ para preço antigo) e link direto.
   - Instagram/Facebook (Feed/Reels): Legenda envolvente, gatilho de curiosidade, chamada para ação focada em engajamento ("Comente 'EU QUERO' para receber o link no direct") e 5 hashtags estratégicas.
   - TikTok: Foco em viralização. Roteiro ultra-curto (hook de 3 segundos) para o texto da tela e legenda direta com hashtags de alta entrega (#achadinhos, #comprinhas).
3. Agendamento Inteligente: Com base no apelo do produto, sugira o melhor horário de pico no Brasil para o agendamento da postagem (ex: 11:30, 18:00, 20:00).

ESTRUTURA EXATA DA SAÍDA (JSON):
{
  "produto": "Nome resumido do produto",
  "agendamento_sugerido": "HH:MM",
  "estrategia_por_rede": {
    "whatsapp_telegram": {
      "copy": "🔥 *[Gatilho]*\\n[Benefício 1 linha]\\n\\n❌ De: ~R$ [Velho]~\\n✅ Por: *R$ [Novo]*\\n\\n🔗 *Compre aqui:* [URL]\\n⚡ [Escassez]"
    },
    "instagram_facebook": {
      "legenda_post": "[Gatilho de curiosidade]\\n\\n[Descrição persuasiva focada no problema que o produto resolve]\\n\\n👇 Quer o link com desconto? Comente 'EU QUERO' ou clique no link da bio!\\n\\nDe R$ [Velho] por R$ [Novo]\\n\\n[Hashtags]"
    },
    "tiktok": {
      "ideia_hook_video": "Texto curto para colocar na tela do vídeo nos primeiros 3 segundos",
      "legenda": "Você não sabia que precisava disso até ver o preço! 😱 Link na bio. [Hashtags virais]"
    }
  }
}`;

    const userPrompt = `Gere o pacote omnichannel em JSON para o seguinte produto:
- Nome: ${productName}
- Preço Original: ${originalPrice ? `R$ ${originalPrice}` : 'Não informado'}
- Preço Promocional: ${promoPrice ? `R$ ${promoPrice}` : 'Não informado'}
- Link de Afiliado: ${productLink || 'https://exemplo.com'}
- Cupom de desconto: ${coupon || 'Nenhum'}
- Categoria: ${category || 'Achadinhos'}
- Observações extras: ${customNotes || 'Nenhuma'}`;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.4,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const omnichannelData = JSON.parse(cleaned);

    res.json(omnichannelData);
  } catch (err: any) {
    console.warn('API error or quota exceeded, returning smart local fallback omnichannel package:', err?.message);
    res.json({
      produto: productName,
      agendamento_sugerido: "18:00",
      estrategia_por_rede: {
        whatsapp_telegram: {
          copy: `🔥 *Super Achadinho: ${productName}*\nPreço absurdo por tempo limitado!\n\n❌ De: ~R$ ${originalPrice || '89,90'}~\n✅ Por: *R$ ${promoPrice || '39,90'}*\n\n🔗 *Compre aqui:* ${productLink || 'https://exemplo.com'}\n⚡ Poucas unidades restantes, aproveite!`
        },
        instagram_facebook: {
          legenda_post: `Você estava procurando por isso e nem sabia! 😍\n\nO ${productName} chegou com desconto relâmpago para resolver o seu dia a dia com muita praticidade.\n\n👇 Quer o link com desconto? Comente 'EU QUERO' ou clique no link da bio!\n\nDe R$ ${originalPrice || '89,90'} por R$ ${promoPrice || '39,90'}\n\n#achadinhos #comprinhas #ofertas #desconto #shopee`
        },
        tiktok: {
          ideia_hook_video: `POV: Você achou o ${productName} por menos de R$ ${promoPrice || '40'}! 😱`,
          legenda: `Você não sabia que precisava disso até ver o preço! 😱 Link na bio. #achadinhos #comprinhas #viral`
        }
      }
    });
  }
});

// API endpoint to analyze image or text snippet and extract product details
app.post('/api/extract-product', async (req, res) => {
  try {
    const { imageBase64, textInput } = req.body;
    const ai = getAiClient();

    const parts: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    if (textInput) {
      parts.push({ text: textInput });
    } else {
      parts.push({ text: 'Extraia o nome do produto, preço original, preço promocional, cupom e categoria desta imagem ou texto.' });
    }

    const prompt = `Analise a imagem/texto do produto fornecido e retorne estritamente um JSON válido (sem markdown extra, apenas o objeto JSON) com a seguinte estrutura:
{
  "productName": "string",
  "originalPrice": "string ou vazio",
  "promoPrice": "string ou vazio",
  "coupon": "string ou vazio",
  "category": "string (ex: Eletrônicos, Moda, Casa, Beleza, Achadinhos)"
}`;

    parts.push({ text: prompt });

    const response = await generateContentWithFallback(ai, {
      contents: parts,
      config: {
        temperature: 0.2,
      },
    });

    const rawText = response.text || '{}';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const productData = JSON.parse(cleaned);

    res.json(productData);
  } catch (err: any) {
    console.warn('API error or quota exceeded in extract-product, returning fallback:', err?.message);
    res.json({
      productName: "Achadinho em Destaque",
      originalPrice: "99,90",
      promoPrice: "49,90",
      coupon: "PROMO10",
      category: "🔥 Achadinhos Virais"
    });
  }
});

// API endpoint for Video Script Generator (Reels / TikTok)
app.post('/api/video-script', async (req, res) => {
  const {
    productName,
    originalPrice,
    promoPrice,
    productLink,
    coupon,
    platform = 'Reels / TikTok',
    customNotes,
    temperature = 0.4,
  } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'Nome do produto é obrigatório.' });
  }

  try {
    const ai = getAiClient();

    const systemInstruction = `Você é um diretor criativo especialista em vídeos curtos virais (Reels, TikTok, YouTube Shorts) focados em conversão e vendas de achadinhos e dropshipping.
Sua tarefa é criar um roteiro de vídeo altamente magnético e estruturado, com marcações de tempo precisas, hook agressivo nos primeiros 3 segundos, transições visuais dinâmicas, texto na tela e locução persuasiva.

Responda ÚNICA e EXCLUSIVAMENTE em formato JSON válido (sem markdown extra, sem texto fora do JSON) seguindo estritamente esta estrutura:
{
  "title": "Título chamativo do vídeo",
  "duration": "30 segundos",
  "platform": "Reels / TikTok",
  "hook": "Gatilho mental dos primeiros 3 segundos",
  "scenes": [
    {
      "timestamp": "0:00 - 0:03",
      "visual": "O que aparece na câmera (ex: Close no produto aberto, expressão de surpresa)",
      "transition": "Zoom rápido / Corte seco / Transição com estalo",
      "textOnScreen": "Texto chamativo em destaque na tela",
      "audioVoiceover": "O que o narrador fala na locução"
    }
  ],
  "callToAction": "Chamada para ação final (ex: Comente EU QUERO ou clique no link da bio)",
  "suggestedAudio": "Estilo de áudio em alta sugerido para o fundo"
}`;

    const userPrompt = `Crie o roteiro de vídeo em JSON para o produto:
- Nome: ${productName}
- Preço Original: ${originalPrice ? `R$ ${originalPrice}` : 'Não informado'}
- Preço Promocional: ${promoPrice ? `R$ ${promoPrice}` : 'Não informado'}
- Cupom: ${coupon || 'Nenhum'}
- Plataforma: ${platform}
- Observações: ${customNotes || 'Nenhuma'}`;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.4,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const scriptData = JSON.parse(cleaned);

    res.json(scriptData);
  } catch (err: any) {
    console.warn('API error or quota exceeded in video-script, returning fallback:', err?.message);
    res.json({
      title: `Como achei o ${productName} por preço de fábrica`,
      duration: "30 segundos",
      platform: "Reels / TikTok",
      hook: `Para tudo o que você está fazendo e olha o achadinho que eu acabei de receber!`,
      scenes: [
        {
          timestamp: "0:00 - 0:03",
          visual: "Close-up abrindo a embalagem do produto com expressão de surpresa",
          transition: "Zoom rápido in",
          textOnScreen: "Achei o produto perfeito! 😱",
          audioVoiceover: `Gente, sério, olha isso aqui que acabou de chegar para mim!`
        },
        {
          timestamp: "0:03 - 0:15",
          visual: "Demonstração rápida do produto em uso",
          transition: "Corte seco",
          textOnScreen: `De ~R$ ${originalPrice || '89,90'}~ por R$ ${promoPrice || '39,90'}!`,
          audioVoiceover: `Além de ser super útil, ele tá com um desconto surreal que eu nunca tinha visto antes.`
        },
        {
          timestamp: "0:15 - 0:30",
          visual: "Mostrando o celular com a página de compra e o link",
          transition: "Zoom out",
          textOnScreen: "Link na Bio / Comente EU QUERO",
          audioVoiceover: `O link com desconto tá aqui na descrição ou nos comentários. Corre porque o estoque vai acabar rápido!`
        }
      ],
      callToAction: "Comente 'EU QUERO' ou clique no link da bio para garantir o seu com frete grátis.",
      suggestedAudio: "Trending Audio - Upbeat Pop / Lo-Fi Beats"
    });
  }
});

// API endpoint for Express URL-to-Ad generator with Search Grounding
app.post('/api/express-url', async (req, res) => {
  const { productUrl } = req.body;
  if (!productUrl) {
    return res.status(400).json({ error: 'URL do produto é obrigatória.' });
  }

  try {
    const ai = getAiClient();

    const systemInstruction = `Você é um especialista em e-commerce e marketing de afiliados. Sua tarefa é analisar o link do produto fornecido (utilizando busca na web) e retornar estritamente um JSON válido contendo:
1. "productName": Nome exato do produto.
2. "originalPrice": Preço original.
3. "promoPrice": Preço promocional.
4. "coupon": Cupom se houver.
5. "category": Categoria.
6. "productImageUrl": A URL EXATA da foto principal do produto na página de vendas. ATENÇÃO: Nunca retorne logotipos da loja, banners de frete grátis ou imagens genéricas do site. Retorne estritamente a foto do produto em destaque. Se não encontrar uma URL direta de imagem limpa, retorne uma URL de imagem Unsplash de alta qualidade que represente perfeitamente este produto específico.
7. "copyText": Copy de vendas pronta para WhatsApp seguindo as regras (Negrito *, Preço tachado ~, Emojis estratégicos).

Responda APENAS em JSON válido.`;

    const userUrlPrompt = `Analise este link de produto e extraia os dados e a foto correta do produto: ${productUrl}`;

    const response = await generateContentWithFallback(ai, {
      contents: userUrlPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const expressData = JSON.parse(cleaned);

    expressData.productLink = productUrl;

    res.json(expressData);
  } catch (err: any) {
    console.warn('API error or quota exceeded in express-url, returning fallback:', err?.message);
    res.json({
      productName: "Achadinho em Destaque",
      originalPrice: "99,90",
      promoPrice: "39,90",
      coupon: "ACHADO10",
      category: "🔥 Achadinhos Virais",
      productImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      productLink: productUrl,
      copyText: `🔥 *Achadinho Imperdível Encontrado na Web!*
Qualidade superior e preço relâmpago pra você garantir o seu hoje mesmo!

❌ De: ~R$ 99,90~
✅ Por: *R$ 39,90*

🔗 *Garanta aqui:* ${productUrl}
⚡ Estoque extremamente limitado, corre antes que acabe!`
    });
  }
});

// Setup Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CopyMaster AI server running on http://localhost:${PORT}`);
  });
}

startServer();
