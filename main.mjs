import { MongoClient } from 'mongodb';
import { iterations } from './shared.mjs';

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const db = client.db('test_node_6370');

  const source = db.collection('source');
  const sink = db.collection('sink');

  const cursor = source.find({}, { batchSize: iterations });
  console.log('finding', iterations, 'documents per batch from source');

  const bulkWrites = [];

  while (!cursor.closed) {
    const documents = []
    while (documents.length < iterations && await cursor.hasNext()) {
      const batch = cursor.readBufferedDocuments(iterations - documents.length);
      for (let i = 0; i < batch.length; i++) {
        documents.push({ insertOne: { document: batch[i] } });
      }
    }

    if (documents.length !== 0) {
      bulkWrites.push(sink.bulkWrite(documents));
      const documentCount = documents.at(-1).insertOne.document._id + 1;
      if ((documentCount % (iterations * 100)) === 0) console.log('moved', documentCount, 'documents to sink');
    }
  }

  console.log('waiting for', bulkWrites.length, 'bulkWrites to complete');
  await Promise.all(bulkWrites);

  console.log('sink has', await sink.countDocuments(), 'documents');
} finally {
  await client.close();
}
