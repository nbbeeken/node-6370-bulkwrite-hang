import { MongoClient, BSON } from 'mongodb';
import { totalDocumentCount, iterations } from './shared.mjs';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('test_node_6370')

const a = Buffer.alloc(1024 * 8, 0x88);
const makeDocument = (i) => (_, _id) => ({ _id: _id + (i * 1000), a });

try {
  console.log('reset sink...');
  const sink = db.collection('sink');
  await sink.drop().catch(() => null);
  console.log('reset sink... done.');

  console.log('check source...');
  const source = db.collection('source');
  const sourceCount = await source.countDocuments();
  console.log('source has', sourceCount, 'documents...');

  if (sourceCount !== totalDocumentCount) {
    console.log(`reset source...`);
    await source.drop().catch(() => null);

    const { byteLength: documentSize } = BSON.serialize(makeDocument(0)(undefined, 0));
    console.log('Each document is', documentSize, 'bytes');
    console.log('Total insertion amount is', (totalDocumentCount * documentSize) * 1e-9, 'GB');

    console.log('Inserting', 1000, 'documents', iterations, 'times...')
    for (let i = 0; i < iterations; i++) {
      const documents = Array.from({ length: 1000 }, makeDocument(i));
      await source.insertMany(documents);

      const documentCount = documents.at(-1)._id + 1;
      if ((documentCount % (iterations * 100)) === 0) console.log('inserted', documentCount, 'documents');
    }
  }

  console.log('source finally has', await source.countDocuments(), 'documents...');
} finally {
  await client.close();
}
