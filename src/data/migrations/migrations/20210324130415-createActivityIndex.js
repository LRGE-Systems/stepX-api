module.exports = {
  async up(db, client) {
    const constraintToCreate = [{"activityId":1}, {"agencyId":1},{"projectId":1}];
    await db
      .collection("activities")
      .indexes()
      .then(async(indexes) => {
        if (indexes) {
              constraintToCreate.forEach(async constraint =>{
                try {
                  await db.collection("activities").createIndex( constraint, {background:true})
                  
                } catch (error) {
                  console.log(error)
                }
              })
            
        
        }
      });

  },

  async down(db, client) {
    const constraintToDelete = ["activityId_1","agencyId_1","projectId_1"];
    await db
      .collection("activities")
      .indexes()
      .then((indexes) => {
        if (indexes) {
          indexes.forEach(async (element) => {
            if (element.name && element.name == constraintToDelete) {
              await db
                .collection("activities")
                .dropIndex(constraintToDelete);
            }
          });
        }
      });
  }
};
