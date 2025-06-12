import { Scraper } from "agent-twitter-client";
import fs from "fs";
import path from "path";

// Add this function to save scraper session
export async function saveScraperSession(
  scraper: Scraper,
  sessionPath: string
) {
  try {
    const cookies = await scraper.getCookies();
    const sessionData = {
      cookies,
      timestamp: Date.now(),
    };
    fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
    console.log("Scraper session saved successfully");
  } catch (error) {
    console.error("Failed to save scraper session:", error);
  }
}

// Add this function to load scraper session
export async function loadScraperSession(
  scraper: Scraper,
  sessionPath: string
): Promise<boolean> {
  try {
    if (!fs.existsSync(sessionPath)) {
      console.log("No existing scraper session found");
      return false;
    }

    const sessionData = JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
    const { cookies, timestamp } = sessionData;

    // Check if session is not too old (optional - adjust time as needed)
    const sessionAge = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      console.log("Scraper session too old, will create new session");
      return false;
    }

    await scraper.setCookies(cookies);
    console.log("Scraper session loaded successfully");
    return true;
  } catch (error) {
    console.error("Failed to load scraper session:", error);
    return false;
  }
}
