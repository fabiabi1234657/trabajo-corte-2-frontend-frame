import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crisis Brain API - Ciberseguridad SOC',
      version: '1.0.0',
      description: 'API REST para observar estado de partidas y verificar salud del servidor de crisis.'
    },
    servers: [{ url: 'http://localhost:4000' }]
  },
  apis: ['./src/index.js']
};

export const swaggerSpec = swaggerJsdoc(options);
