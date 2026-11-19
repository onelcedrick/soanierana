import type { FastifyInstance } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';

export async function cloudinaryRoutes(app: FastifyInstance): Promise<void> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  app.post('/cloudinary/sign', { preHandler: [app.authenticate] }, async (req, reply) => {
    // On récupère le dossier envoyé par le frontend (par défaut 'church_app')
    const body = z.object({
      folder: z.string().optional().default('church_app')
    }).parse(req.body);

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // On signe avec LE BON dossier
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: body.folder },
      process.env.CLOUDINARY_API_SECRET as string
    );

    return reply.send({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  });
}
