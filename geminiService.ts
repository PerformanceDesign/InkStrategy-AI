
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
      You are an expert social media strategist for the tattoo and piercing industry.
      
      STEP 1: IDENTIFY THE BUSINESS
      The user provided this Google Business Profile link: ${prefs.gbpLink}
      - Use Google Search to find exactly WHICH business is at this URL.
      - Identify the Business Name, the City, and the Country.
      - CRITICAL: If the search results show "The InkSpot Tattoo" in Sibiu, Romania, then use that. DO NOT hallucinate "Old Habits Tattoo" or "L'Encre d'Or". Use ONLY the data found for this specific link.
      - If you cannot find a specific name, describe the search results instead of making up a name.

      STEP 2: RESEARCH
      Search for:
      - The studio's specialties (Traditional, Fine Line, Piercing, etc.)
      - Artist names mentioned in reviews or on their site.
      - The overall "vibe" described by customers.
      - Specific local landmarks or neighborhoods near the studio to mention in local SEO (GBP) posts.

      STEP 3: GENERATE 30-DAY CONTENT PLAN
      Create a plan based on these user preferences:
      - Platforms: ${prefs.platforms.join(", ")}
      - Posting Frequency: ${prefs.frequencyPerWeek} posts per week per platform.
      - Preferred Content: ${prefs.formats.join(", ")}
      - Team Context: ${prefs.teamSize} people, ${prefs.experienceLevel} level, roles: ${prefs.teamRoles}

      OUTPUT SPECIFICATIONS:
      - Produce 20+ specific, high-quality content ideas.
      - Return the data in the specified JSON format.
      - Ensure the "platform" field is EXACTLY one of: "Facebook", "Instagram", "TikTok", or "GBP".
      - Ensure the "studio.name" field correctly reflects the business found at the URL.
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
                  suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["id", "title", "description", "platform", "format"]
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
      Develop this social media idea for a ${idea.platform} post.
      Studio: ${studio.name} (Vibe: ${studio.vibe})
      Idea: ${idea.title}
      Details: ${idea.description}
      Format: ${idea.format}

      Please provide:
      1. A catchy Hook
      2. Main Caption (tailored specifically for ${idea.platform} and referencing the studio name: ${studio.name})
      3. Visual description for the artist/photographer
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
      Transform the following social media idea into a full, SEO-optimized blog article (approx 600-800 words) for a tattoo/piercing studio website.
      Studio: ${studio.name}
      Topic: ${idea.title}
      Context: ${idea.description}
      Vibe: ${studio.vibe}

      Include a meta description and a CTA. Mention the studio name "${studio.name}" naturally throughout the text.
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
      Take this blog post and repurpose it into a short, engaging ${targetPlatform} post.
      Blog Content: ${blogContent.substring(0, 1000)}...

      Keep the core message but adjust tone and length for ${targetPlatform}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to repurpose.";
  });
};
