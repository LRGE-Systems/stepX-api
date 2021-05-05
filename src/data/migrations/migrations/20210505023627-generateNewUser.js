const bcrypt = require('bcrypt');
module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    await db
                .collection("users").insertOne({  "nome" : "New user", "email" : "email@email.com", "credenciais" : { "permissao" : "Administrator", "senha" : await bcrypt.hash("WorldBank123", 10) } })
    // console.log(await bcrypt.compare("WorldBank123", "$2b$10$BlebWfRN4Zu9u4GX8NxZ4e1pxsrQP2AQLx6Bf5KeArSUTM0D/41.e"))
    // console.log(environment)$2b$10$pzjqNjQfEOcxEe3toeOikepKq75xUkgr/IG2PbFOu5aaBWsWE6Y/i
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
