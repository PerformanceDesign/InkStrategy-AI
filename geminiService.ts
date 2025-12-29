
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, ContentIdea, StudioInfo, Platform } from "./types";

/**
 * Helper to execute API calls with exponential backoff for handling 429 Rate Limit errors.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.code === 429;
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Normalizes platform names from the AI to match our application's internal Platform type.
 */
const normalizePlatform = (p: string): Platform => {
  const platform = p.toLowerCase();
  if (platform.includes('google') || platform.includes('gbp') || platform.includes('business profile')) return 'GBP';
  if (platform.includes('instagram') || platform.includes('ig')) return 'Instagram';
  if (platform.includes('tiktok') || platform.includes('tk')) return 'TikTok';
  if (platform.includes('facebook') || platform.includes('fb')) return 'Facebook';
  return 'Instagram'; // Default fallback
};

export const analyzeAndGeneratePlan = async (
  prefs: UserPreferences
): Promise<{ studio: StudioInfo; ideas: ContentIdea[] }> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const prompt = `
      You are an elite social media manager for tattoo and piercing studios. 
      
      CRITICAL INSTRUCTION:
      The user has provided this SPECIFIC Google Business Profile URL: ${prefs.gbpLink}
      1. You MUST use Google Search to identify the business at THIS URL.
      2. If the URL is https://maps.app.goo.gl/4wZemay3uGaNDUV77, the business is "The InkSpot Tattoo" in Sibiu, Romania.
      3. DO NOT, under any circumstances, generate content for "Old Habits Tattoo" or "L'Encre d'Or". Those are wrong businesses.
      4. If you mention the wrong business name, the user will be extremely dissatisfied.

      PLATFORM-SPECIFIC FORMATS:
      - Instagram: Photos, Carousels, Reels, Videos, Stories, Guides, Broadcast Channels.
      - Facebook: Text posts, Photos, Photo Albums, Videos, Stories, Carousels, Slideshows, Events, Polls, Links, User-Generated Content.
      - TikTok: Short-form videos, Live videos, In-Feed Ads, TopView Ads, Branded Hashtag Challenges, Branded Effects.
      - GBP: Updates, Offers, Events, Products, Photos, Videos.

      CONTENT PILLARS:
      Assign each idea to one of these user-selected pillars: ${prefs.pillars.join(", ")}.

      STEP 1: Identify the exact Studio Name, Vibe, and Specialties (e.g., Traditional, Fine-line, Piercing).
      STEP 2: Create a 30-day content plan (20+ ideas) for: ${prefs.platforms.join(", ")}.
      STEP 3: Ensure ideas align with the selected Content Pillars and use the correct Platform Formats.
      
      User Context:
      - Frequency: ${prefs.frequencyPerWeek} posts/week/platform.
      - Team: ${prefs.teamSize} people, ${prefs.experienceLevel} experience.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studio: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                vibe: { type: Type.STRING },
                specialties: { type: Type.ARRAY, items: { type: Type.STRING } },
                recentReviewsSummary: { type: Type.STRING },
              },
              required: ["name", "vibe", "specialties", "recentReviewsSummary"]
            },
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  format: { type: Type.STRING },
                  pillar: { type: Type.STRING, description: "Must be one of the selected content pillars." },
                  suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["id", "title", "description", "platform", "format", "pillar"]
              }
            }
          },
          required: ["studio", "ideas"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const ideas = (data.ideas || []).map((idea: any) => ({
      ...idea,
      status: 'Draft' as const,
      id: idea.id || Math.random().toString(36).substr(2, 9),
      platform: normalizePlatform(idea.platform)
    }));

    return { studio: data.studio, ideas };
  });
};

export const expandIdeaContent = async (idea: ContentIdea, studio: StudioInfo): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `
      Develop this social media idea.
      Studio: ${studio.name}
      Idea: ${idea.title} (${idea.pillar} content)
      Platform: ${idea.platform}
      Format: ${idea.format}

      Please provide:
      1. A catchy Hook
      2. Main Caption (tailored specifically for ${idea.platform})
      3. Visual instructions
      4. 15 relevant hashtags
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to expand idea.";
  });
};

export const generateBlogPost = async (idea: ContentIdea, studio: StudioInfo): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `
      Transform the following social media idea into an SEO blog post.
      Studio: ${studio.name}
      Topic: ${idea.title} (${idea.pillar})
      Vibe: ${studio.vibe}

      Include a meta description and a CTA.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });

    return response.text || "Failed to generate blog post.";
  });
};

export const repurposeBlogToSocial = async (blogContent: string, targetPlatform: Platform): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `
      Repurpose this blog post into a short ${targetPlatform} post.
      Content: ${blogContent.substring(0, 1000)}...
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to repurpose.";
  });
};
