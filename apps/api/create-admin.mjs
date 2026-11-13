import pg from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import net from 'net';

net.setDefaultAutoSelectFamily(false); 
const { Client } = pg;
const connectionString = "postgresql://neondb_owner:npg_Hci4Bfxjpr5v@ep-restless-morning-bdids0ar.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  // On récupère l'ID de l'église qu'on vient de créer
  const res = await client.query('SELECT id FROM churches LIMIT 1');
  const churchId = res.rows[0].id;

  // Création de l'admin
  const hash = await bcrypt.hash('Admin1234!', 10);
  await client.query(
    'INSERT INTO users (id, church_id, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())', 
    [randomUUID(), churchId, 'admin@soanierana.com', hash, 'ADMIN']
  );
  
  console.log('\n🎉 Compte admin cree avec succes !');
  console.log('📧 Email : admin@soanierana.com');
  console.log('🔑 Mot de passe : Admin1234!');
  await client.end();
}

main().catch(err => console.error("❌ Erreur :", err.message));
