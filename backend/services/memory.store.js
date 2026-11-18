// In-memory data used when MongoDB is not configured or not reachable.
// Everything lives only while the server runs: users are lost and train times are re-generated on restart.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { stations } = require('../data');
const { generateTrains } = require('./seeder.service');

const stationList = [...new Map(stations.map(s => [s.code, s])).values()]
  .sort((a, b) => a.name.localeCompare(b.name));
const trains = generateTrains();
const users = new Map(); // email -> { _id, name, email, password(hash) }

function trainsThrough(code) {
  return trains.filter(t => t.stops.some(s => s.stationCode === code));
}

function findUserByEmail(email) {
  return users.get(String(email).trim().toLowerCase()) || null;
}

async function createUser({ name, email, password }) {
  const user = {
    _id: crypto.randomUUID(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    password: await bcrypt.hash(password, 10)
  };
  users.set(user.email, user);
  return user;
}

function comparePassword(user, candidatePassword) {
  return bcrypt.compare(candidatePassword, user.password);
}

module.exports = { stationList, trains, trainsThrough, findUserByEmail, createUser, comparePassword };
