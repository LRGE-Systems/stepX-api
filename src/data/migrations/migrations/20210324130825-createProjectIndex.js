module.exports = {
  async up(db, client) {
    const constraintToCreate = {"activityId":1};
    await db
      .collection("projects")
      .indexes()
      .then(async(indexes) => {
        if (indexes) {
              try {
                await db.collection("projects").createIndex( {"projectId":1}, {background:true})
                
              } catch (error) {
                console.log(error)
              }
            
        
        }
      });

  },

  async down(db, client) {
    const constraintToDelete = ["projectId_1"];
    await db
      .collection("projects")
      .indexes()
      .then((indexes) => {
        if (indexes) {
          indexes.forEach(async (element) => {
            if (element.name && element.name == constraintToDelete) {
              await db
                .collection("projects")
                .dropIndex(constraintToDelete);
            }
          });
        }
      });
  }
};
