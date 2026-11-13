import pg from 'pg';
import { randomUUID } from 'crypto';
import net from 'net';

net.setDefaultAutoSelectFamily(false); 
const { Client } = pg;
const connectionString = "postgresql://neondb_owner:npg_Hci4Bfxjpr5v@ep-restless-morning-bdids0ar.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log("🔧 Correction de la table site_settings...");
  // On ajoute les colonnes manquantes si elles n'existent pas
  await client.query(`
    ALTER TABLE site_settings 
    ADD COLUMN IF NOT EXISTS rotation_cycle_weeks INTEGER DEFAULT 4,
    ADD COLUMN IF NOT EXISTS weight_participation INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS weight_recency INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS weight_assignment INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS weight_availability INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS weight_skill INTEGER DEFAULT 20;
  `);
  console.log("✅ Colonnes ajoutées.");

  const res = await client.query('SELECT id FROM churches LIMIT 1');
  const churchId = res.rows[0].id;

  // Vérifier si des settings existent déjà
  const check = await client.query('SELECT id FROM site_settings WHERE church_id = $1', [churchId]);
  
  if (check.rows.length === 0) {
    console.log('Insertion des paramètres par défaut...');
    await client.query(
      `INSERT INTO site_settings (id, church_id, rotation_strategy, rotation_cycle_weeks, weight_participation, weight_recency, weight_assignment, weight_availability, weight_skill, created_at, updated_at) 
       VALUES ($1, $2, 'FAIR_ROTATION', 4, 20, 20, 20, 20, 20, NOW(), NOW())`, 
      [randomUUID(), churchId]
    );
    console.log('✅ Paramètres par défaut créés !');
  } else {
    console.log('✅ Les paramètres existent déjà.');
  }

  await client.end();
}

main().catch(err => console.error("❌ Erreur :", err.message));
