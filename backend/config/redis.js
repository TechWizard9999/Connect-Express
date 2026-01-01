const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URI || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 2) return new Error('Retry limit reached');
      return 100;
    }
  }
});

client.on('error', (err) => console.log('Redis Client Error', err.message));


(async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {

  }
})();

module.exports = client;
