import type { FastifyInstance } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';

export async function cloudinaryRoutes(app: FastifyInstance): Promise<void> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Route pour générer une signature d'upload sécurisée
  app.post('/cloudinary/sign', { preHandler: [app.authenticate] }, async (req, reply) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'church_app' },
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
