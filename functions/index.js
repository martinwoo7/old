const functions = require("firebase-functions");
const admin = require('firebase-admin')
admin.initializeApp({ projectId: "demo-project"})

exports.addPost = functions.https.onRequest(async (req, res) => {
    console.log(req.query)
    const content = req.query.text;
    const type = req.query.type;
    let verb
    switch (type) {
        case 0:
            verb = "shouted"
            break;
        case 1:
            verb = "posted a picture"
            break;
        case 2:
            verb = "shared a video"
            break;
        case 3:
            verb = "asked a question"
            break;
    }
    console.log(verb)
    const writeResult = await admin.firestore().collection('posts').add({
        comment: 0,
        content: content,
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: "0KEMESEKB9txlIyTctbca3KU4EP2",
        likes: 1,
        name: 'Jimmy',
        type: type,
        temp: type,
        verb: verb,
        video: null,
        images: null,
        tags: []
    })
    res.json({ result: `Post with ID: ${writeResult.id} added.` })
})


exports.calculate = functions.firestore.document('/posts/{documentId}')
    .onCreate((snap, context) => {
        const { comment, createdAt, likes } = snap.data()
        const epoch = new Date(1970, 1, 1)

        const epochSeconds = (date) => {
            const td = date.getTime() - epoch.getTime()
            const days = td / (100 * 60 * 60 * 24)
            const seconds = td / (100 * 60)
            return days * 86400 + seconds + td
        }

        const order = Math.log(Math.max(likes, 1), 10);
        const sign = likes > 0 ? 1 : likes < 0 ? -1 : 0;
        const seconds = epochSeconds(createdAt.toDate()) - 1134028003        
        const score = Math.round(sign * order + seconds / 45000, 7)
        functions.logger.log('Score  of ', context.params.documentId, ' is: ', score);
        return snap.ref.set({ score }, { merge: true });

    })

exports.updateScore = functions.firestore.document('/posts/{documentId}')
    .onUpdate((change, context) => {
        const { comment,  likes } = change.after.data();
        const { createdAt } = change.before.data()

        const epoch = new Date(1970, 1, 1)

        const epochSeconds = (date) => {
            const td = date.getTime() - epoch.getTime()
            const days = td / (100 * 60 * 60 * 24)
            const seconds = td / (100 * 60)
            return days * 86400 + seconds + td
        }

        const order = Math.log(Math.max(likes, 1), 10);
        const sign = likes > 0 ? 1 : likes < 0 ? -1 : 0;
        const seconds = epochSeconds(createdAt.toDate()) - 1134028003        
        const score = Math.round(sign * order + seconds / 45000, 7)
        functions.logger.log('New score  of ', context.params.documentId, ' is: ', score);

       return change.after.ref.set({
        score: score
       }, { merge: true })

    })

