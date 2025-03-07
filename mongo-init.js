const rootUser = "admin"
const rootPassword = 'admin'


db = db.getSiblingDB('admin');

// Create root user if not exists
if (!db.getUser('admin')) {
  db.createUser({
    user: rootUser,
    pwd: rootPassword,  
    roles: [
      { role: 'root', db: 'admin' }
    ]
  });
}

// Create databases and collections
db = db.getSiblingDB('msytt_post');
db.createCollection('posts');

db = db.getSiblingDB('msytt_identity');
db.createCollection('users');

db = db.getSiblingDB('msytt_media');
db.createCollection('media');

db = db.getSiblingDB('msytt_search');
db.createCollection('searches');