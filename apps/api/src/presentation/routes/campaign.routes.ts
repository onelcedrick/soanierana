import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../infrastructure/database/client';
import { campaigns, milestones, donations } from '../../infrastructure/database/schema/campaign.table';
import { churches } from '../../infrastructure/database/schema/church.table';
import { eq, and, sum, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function campaignRoutes(app: FastifyInstance): Promise<void> {
  
  // GET : Campagne active
  app.get('/campaigns/active', async (req, reply) => {
    try {
      const churchRes = await db.select().from(churches).limit(1);
      if (churchRes.length === 0) return reply.send({ campaign: null, milestones: [], collected: 0, donors: [] });
      
      const churchId = churchRes[0]!.id;
      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.churchId, churchId)).limit(1);
      if (!campaign) return reply.send({ campaign: null, milestones: [], collected: 0, donors: [] });

      const campaignMilestones = await db.select().from(milestones).where(eq(milestones.campaignId, campaign.id)).orderBy(milestones.createdAt);
      
      // Somme uniquement des dons CONFIRMÉS
      const [sumRes] = await db.select({ total: sum(donations.amount) })
        .from(donations)
        .where(and(eq(donations.campaignId, campaign.id), eq(donations.status, 'CONFIRMED')));
      
      // CALCUL DU TOTAL : Dons confirmés + Trésorerie de départ
      const donationsTotal = Number(sumRes?.total || 0);
      const initialAmount = Number(campaign.initialAmount || 0);
      const collected = donationsTotal + initialAmount;

      // Derniers donateurs publics (non anonymes)
      const recentDonations = await db.select().from(donations)
        .where(and(
          eq(donations.campaignId, campaign.id), 
          eq(donations.isAnonymous, false), 
          eq(donations.status, 'CONFIRMED')
        ))
        .orderBy(desc(donations.createdAt))
        .limit(5);

      return reply.send({ campaign, milestones: campaignMilestones, collected, donors: recentDonations });
    } catch (err) {
      req.log.error(err, 'Erreur chargement campagne');
      return reply.send({ campaign: null, milestones: [], collected: 0, donors: [] });
    }
  });

  // PUT : Modifier la campagne (avec le montant initial)
  app.put('/campaigns', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    try {
      const body = z.object({
        churchId: z.string().uuid(),
        title: z.string().min(2),
        description: z.string(),
        goalAmount: z.number().positive(),
        initialAmount: z.number().nonnegative().optional().default(0),
        coverImageUrl: z.string().nullable()
      }).parse(req.body);

      const [existing] = await db.select().from(campaigns).where(eq(campaigns.churchId, body.churchId)).limit(1);

      if (existing) {
        await db.update(campaigns).set({
          title: body.title, 
          description: body.description, 
          goalAmount: body.goalAmount.toString(), 
          initialAmount: body.initialAmount.toString(),
          coverImageUrl: body.coverImageUrl,
          updatedAt: new Date()
        }).where(eq(campaigns.id, existing.id));
        return reply.send({ id: existing.id });
      } else {
        const id = randomUUID();
        await db.insert(campaigns).values({
          id, churchId: body.churchId, title: body.title, description: body.description,
          goalAmount: body.goalAmount.toString(), initialAmount: body.initialAmount.toString(),
          coverImageUrl: body.coverImageUrl, status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date()
        });
        return reply.send({ id });
      }
    } catch (err) {
      req.log.error(err, 'Erreur sauvegarde campagne');
      return reply.status(500).send({ error: 'Erreur lors de la sauvegarde.' });
    }
  });

  // POST : Faire un don
  app.post('/campaigns/donate', async (req, reply) => {
    try {
      const body = z.object({
        campaignId: z.string().uuid(),
        amount: z.number().positive(),
        donorName: z.string().nullable(),
        isAnonymous: z.boolean(),
        paymentMethod: z.string(),
        proofImageUrl: z.string().nullable().optional(),
        referenceCode: z.string().nullable().optional(),
      }).parse(req.body);

      await db.insert(donations).values({
        id: randomUUID(), campaignId: body.campaignId, amount: body.amount.toString(),
        donorName: body.isAnonymous ? null : body.donorName,
        isAnonymous: body.isAnonymous, paymentMethod: body.paymentMethod,
        proofImageUrl: body.proofImageUrl || null, referenceCode: body.referenceCode || null,
        status: 'PENDING', createdAt: new Date()
      });

      return reply.status(201).send({ success: true });
    } catch (err) {
      return reply.status(500).send({ error: 'Erreur lors du don.' });
    }
  });

  // GET : Lister tous les dons (Admin)
  app.get('/campaigns/donations', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const list = await db.select().from(donations).orderBy(desc(donations.createdAt));
    return reply.send(list);
  });

  // PATCH : Valider un don (Admin)
  app.patch('/campaigns/donations/:id/validate', { preHandler: [app.authorize('ADMIN')] }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await db.update(donations).set({ status: 'CONFIRMED' }).where(eq(donations.id, id));
    return reply.send({ success: true });
  });
}
