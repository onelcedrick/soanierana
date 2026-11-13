import pg from 'pg';
import fs from 'fs';
import path from 'path';
import net from 'net';

net.setDefaultAutoSelectFamily(false);
const { Client } = pg;
const connectionString = "postgresql://neondb_owner:npg_Hci4Bfxjpr5v@ep-restless-morning-bdids0ar.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("🔌 Connecté à Neon. Application des dernières migrations SQL...");

  const drizzleDir = path.join(process.cwd(), 'drizzle');
  const files = fs.readdirSync(drizzleDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(drizzleDir, file), 'utf8');
    try {
      await client.query(sql);
      console.log(`✅ ${file} appliqué.`);
    } catch (err) {
      // On ignore l'erreur si la table existe déjà
      if (err.code === '42P07') { 
        console.log(`ℹ️ ${file} : Table existe déjà.`);
      } else {
        console.log(`⚠️ ${file} : ${err.message}`);
      }
    }
  }
  console.log("🎉 Base de données synchronisée !");
  await client.end();
}
main();
