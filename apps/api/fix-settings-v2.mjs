import pg from 'pg';
import { randomUUID } from 'crypto';
import net from 'net';

net.setDefaultAutoSelectFamily(false); 
const { Client } = pg;
const connectionString = "postgresql://neondb_owner:npg_Hci4Bfxjpr5v@ep-restless-morning-bdids0ar.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log("🔄 Récupération de l'église...");
  const res = await client.query('SELECT id FROM churches LIMIT 1');
  const churchId = res.rows[0].id;

  console.log("🔧 Suppression de l'ancienne table défectueuse...");
  await client.query('DROP TABLE IF EXISTS site_settings CASCADE;');

  console.log("🛠️ Création de la table avec la structure exacte du code local...");
  await client.query(`
    CREATE TABLE site_settings (
      id UUID PRIMARY KEY,
      church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      rotation_strategy VARCHAR(255) NOT NULL DEFAULT 'FAIR_ROTATION',
      rotation_cycle_weeks INTEGER NOT NULL DEFAULT 4,
      weight_participation INTEGER NOT NULL DEFAULT 20,
      weight_recency INTEGER NOT NULL DEFAULT 20,
      weight_assignment INTEGER NOT NULL DEFAULT 20,
      weight_availability INTEGER NOT NULL DEFAULT 20,
      weight_skill INTEGER NOT NULL DEFAULT 20,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);

  console.log("📥 Insertion des paramètres par défaut...");
  await client.query(
    `INSERT INTO site_settings (
      id, church_id, rotation_strategy, rotation_cycle_weeks, 
      weight_participation, weight_recency, weight_assignment, 
      weight_availability, weight_skill, created_at, updated_at
    ) VALUES ($1, $2, 'FAIR_ROTATION', 4, 20, 20, 20, 20, 20, NOW(), NOW())`, 
    [randomUUID(), churchId]
  );

  console.log("✅ Table site_settings recréée et initialisée avec succès !");
  await client.end();
}

main().catch(err => console.error("❌ Erreur :", err.message));
