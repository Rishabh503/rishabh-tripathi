import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import rawPortfolioData from "@/data/portfolio.json";
import rawLinksData from "@/data/links.json";

let sqlClient: NeonQueryFunction<false, false> | null = null;
let isInitialized = false;

export function getDb() {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!dbUrl) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = neon(dbUrl);
  }

  return sqlClient;
}

export async function initAndSeedDb() {
  const sql = getDb();
  if (!sql || isInitialized) return;

  try {
    // 1. Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_storage (
        key VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Check if portfolio is seeded
    const portfolioRows = await sql`
      SELECT data FROM portfolio_storage WHERE key = 'portfolio' LIMIT 1;
    `;

    if (portfolioRows.length === 0) {
      await sql`
        INSERT INTO portfolio_storage (key, data, updated_at)
        VALUES ('portfolio', ${JSON.stringify(rawPortfolioData)}::jsonb, NOW())
        ON CONFLICT (key) DO NOTHING;
      `;
      console.log("[NeonDB] Seeded 'portfolio' data successfully.");
    }

    // 3. Check if links are seeded
    const linksRows = await sql`
      SELECT data FROM portfolio_storage WHERE key = 'links' LIMIT 1;
    `;

    if (linksRows.length === 0) {
      await sql`
        INSERT INTO portfolio_storage (key, data, updated_at)
        VALUES ('links', ${JSON.stringify(rawLinksData)}::jsonb, NOW())
        ON CONFLICT (key) DO NOTHING;
      `;
      console.log("[NeonDB] Seeded 'links' data successfully.");
    }

    isInitialized = true;
  } catch (err) {
    console.error("[NeonDB] Init/Seed error:", err);
  }
}

export async function getDbStorageItem<T>(key: string, fallback: T): Promise<T> {
  const sql = getDb();
  if (!sql) return fallback;

  try {
    await initAndSeedDb();
    const rows = await sql`
      SELECT data FROM portfolio_storage WHERE key = ${key} LIMIT 1;
    `;

    if (rows.length > 0 && rows[0].data) {
      return rows[0].data as T;
    }
  } catch (err) {
    console.error(`[NeonDB] Error fetching '${key}':`, err);
  }

  return fallback;
}

export async function setDbStorageItem<T>(key: string, data: T): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;

  try {
    await initAndSeedDb();
    await sql`
      INSERT INTO portfolio_storage (key, data, updated_at)
      VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET data = EXCLUDED.data,
          updated_at = NOW();
    `;
    return true;
  } catch (err) {
    console.error(`[NeonDB] Error saving '${key}':`, err);
    return false;
  }
}
