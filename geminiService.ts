
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
      
      CRITICAL IDENTITY INSTRUCTION:
      The user provided this Google Business Profile URL: ${prefs.gbpLink}
      1. You MUST use the googleSearch tool to find the EXACT name and location of the business at THIS URL.
      2. DO NOT hallucinate common studio names like "The Ink Factory" (Dublin) or "Wellington Quay". 
      3. For the link provided (https://maps.app.goo.gl/4MQfqhe4rrXLqwB68), the business is "The InkSpot Tattoo Sibiu" in Sibiu, Romania. 
      4. If the studio is in Romania, and the user chose "Local" or "Both" languages, the second language MUST be Romanian (not Irish/Gaelic).

      PLATFORM-SPECIFIC FORMATS:
      - Instagram: Photos, Carousels, Reels, Videos, Stories, Guides, Broadcast Channels.
      - Facebook: Text posts, Photos, Photo Albums, Videos, Stories, Carousels, Slideshows, Events, Polls, Links, User-Generated Content.
      - TikTok: Short-form videos, Live videos, In-Feed Ads, TopView Ads, Branded Hashtag Challenges, Branded Effects.
      - GBP: Updates, Offers, Events, Products, Photos, Videos.

      CONTENT PILLARS:
      Use these pillars for categorization: ${prefs.pillars.join(", ")}.
      Preferred formats: ${prefs.formats.join(", ")}.

      GOAL: Create a 30-day content plan (20+ ideas) for: ${prefs.platforms.join(", ")}.
      LANGUAGE: ${prefs.languagePreference === 'Local' ? 'Romanian' : prefs.languagePreference === 'English' ? 'English' : 'BOTH English and Romanian (bilingual posts)'}.
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
                  pillar: { type: Type.STRING },
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
      Develop this social media idea for the studio "${studio.name}".
      Idea: ${idea.title}
      Language: Match the language of the provided title/description exactly. If it is bilingual (English/Romanian), provide both.
      
      Please provide:
      1. A catchy Hook
      2. Main Caption
      3. Visual instructions
      4. 15 relevant hashtags
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to expand content.";
  });
};

export const generateBlogPost = async (idea: ContentIdea, studio: StudioInfo): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const prompt = `
      Transform this social media idea into an SEO blog post for "${studio.name}".
      Topic: ${idea.title}
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
