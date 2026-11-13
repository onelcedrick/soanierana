import pg from 'pg';
const { Client } = pg;

// L'URL directe de Neon (sans pooler pour éviter les problèmes de script)
const connectionString = "postgresql://neondb_owner:npg_Hci4Bfxjpr5v@ep-restless-morning-bdids0ar.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function seed() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("✅ Connecté à Neon !");

    // On vérifie s'il y a déjà une église
    const res = await client.query('SELECT id, name FROM churches LIMIT 1');
    
    if (res.rows.length === 0) {
      console.log("⚠️ Aucune église trouvée. Création de l'église par défaut...");
      // On insère une église par défaut (adapte le nom si besoin)
      const insertRes = await client.query(`
        INSERT INTO churches (id, name, city, country, created_at, updated_at) 
        VALUES (gen_random_uuid(), 'Eglise Adventiste Soanierana', 'Antananarivo', 'Madagascar', NOW(), NOW()) 
        RETURNING id, name
      `);
      console.log("🎉 Église créée avec succès :", insertRes.rows[0]);
    } else {
      console.log("✅ Une église existe déjà :", res.rows[0]);
    }
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    console.error("Détail :", err.detail || "Aucun détail");
  } finally {
    await client.end();
  }
}

seed();
