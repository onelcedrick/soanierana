import fs from 'fs';
import path from 'path';
import pg from 'pg';
import net from 'net'; // 👈 Import ajouté

// 💡 On force Node.js à utiliser IPv4 pour éviter les timeouts IPv6
net.setDefaultAutoSelectFamily(false);

const { Client } = pg;

// On utilise l'URL sans channel_binding pour éviter les conflits de driver
const connectionString = "postgresql://neondb_owner:npg_Hci4Bfxjpr5v@ep-restless-morning-bdids0ar.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({ connectionString });
  try {
    console.log("🔌 Connexion à Neon en cours (mode IPv4)...");
    await client.connect();
    console.log("✅ Connecté à Neon !");

    const drizzleDir = path.join(process.cwd(), 'drizzle');
    const files = fs.readdirSync(drizzleDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📂 ${files.length} fichiers SQL trouvés.`);

    for (const file of files) {
      console.log(`\n⏳ Application de ${file}...`);
      const sql = fs.readFileSync(path.join(drizzleDir, file), 'utf8');
      
      try {
        await client.query(sql);
        console.log(`   ✅ Succès.`);
      } catch (fileErr) {
        console.error(`   ❌ ÉCHEC sur le fichier ${file}`);
        console.error(`   Message :`, fileErr.message);
        console.error(`   Détail :`, fileErr.detail || "Aucun détail");
        throw new Error("Arrêt du processus à cause d'une erreur SQL.");
      }
    }
    
    console.log("\n🎉 Toutes les tables ont été créées sur Neon !");
  } catch (err) {
    console.error("\n❌ Erreur fatale :", err);
  } finally {
    await client.end();
  }
}

run();
