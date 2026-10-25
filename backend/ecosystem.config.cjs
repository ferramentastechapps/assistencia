module.exports = {
  apps: [{
    name: 'zapia-backend',
    script: 'dist/server.js',
    cwd: '/opt/zapia/backend',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3011,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
      EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
      CORS_ORIGIN: '*'
    }
  }]
}
