import 'dotenv/config';
import { db, pool } from '../src/infrastructure/database/client';
import { programs, tasks } from '../src/infrastructure/database/schema';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

async function seed() {
  const churches = await db.query.churches.findMany();
  if (churches.length === 0) {
    console.error('Aucune eglise trouvee. Creez-en une d abord.');
    process.exit(1);
  }
  const churchId = churches[0]!.id;

  const programsData = [
    {
      name: 'Larobia',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 3,
      tasks: [
        { name: 'Mitarika', req: 1 },
        { name: 'Boky', req: 1 },
      ],
    },
    {
      name: 'Zoma',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 5,
      tasks: [
        { name: 'Mitarika', req: 1 },
        { name: 'Fampaherezana', req: 1 },
      ],
    },
    {
      name: 'Fidirana',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 5,
      tasks: [
        { name: 'Mitarika', req: 1 },
        { name: 'Boky', req: 1 },
      ],
    },
    {
      name: 'Sekoly Sabata',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 6,
      tasks: [
        { name: 'Mitarika', req: 1 },
        { name: 'Mamintina lesona', req: 1 },
      ],
    },
    {
      name: 'Folo Minitra',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 6,
      tasks: [
        { name: 'Mitarika', req: 1 },
        { name: 'Manao 10 min', req: 1 },
      ],
    },
    {
      name: 'Sabata Culte',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 6,
      tasks: [
        { name: 'Mitarika', req: 1 },
        { name: 'Vakiteny', req: 1 },
        { name: 'Vavaka mandohalika', req: 1 },
        { name: 'Toriteny ankizy', req: 1 },
        { name: 'Toriteny lehibe', req: 1 },
      ],
    },
    {
      name: 'Tolakandro',
      frequency: 'WEEKLY' as const,
      dayOfWeek: 6,
      tasks: [
        { name: 'Mitarika tolakandro', req: 1 },
        { name: 'Vatsy', req: 1 },
        { name: 'Fotopinoana', req: 1 },
      ],
    },
  ];

  for (const p of programsData) {
    // Verifier si le programme existe deja
    const existing = await db.select().from(programs).where(eq(programs.name, p.name)).limit(1);
    if (existing.length > 0) {
      console.log(`Programme deja existant : ${p.name}`);
      continue;
    }

    const programId = randomUUID();
    await db.insert(programs).values({
      id: programId,
      churchId,
      name: p.name,
      frequency: p.frequency,
      dayOfWeek: p.dayOfWeek,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const t of p.tasks) {
      await db.insert(tasks).values({
        id: randomUUID(),
        programId,
        name: t.name,
        requiredPeople: t.req,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`Programme cree avec succes : ${p.name} (${p.tasks.length} taches)`);
  }

  await pool.end();
  process.exit(0);
}

seed();
