module.exports = {
  async up(db, client) {
    const constraintToCreate = [{"activityId":1},{"inProgress":1},{"stepName":1}];
    await db
      .collection("activity_steps")
      .indexes()
      .then(async(indexes) => {
        if (indexes) {
          constraintToCreate.forEach(async constraint =>{
            try {
              await db.collection("activity_steps").createIndex( constraint, {background:true})
              
            } catch (error) {
              console.log(error)
            }
          })
              await db.collection("activity_steps").createIndex( {"activityId":1}, {background:true})
        
        }
      });

  },

  async down(db, client) {
    const constraintToDelete = ["activityId_1","inProgress_1","stepName_1"];
    await db
      .collection("activity_steps")
      .indexes()
      .then((indexes) => {
        if (indexes) {
          indexes.forEach(async (element) => {
            if (element.name && element.name == constraintToDelete) {
              await db
                .collection("activity_steps")
                .dropIndex(constraintToDelete);
            }
          });
        }
      });
  }
};
