import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient, type Db } from 'mongodb';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME ?? 'CrmPortal';

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

async function connectMongo() {
  try {
    mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });

    await mongoClient.connect();
    db = mongoClient.db(mongoDbName);
    console.log(`MongoDB connection established at ${mongoUri}/${mongoDbName}`);
  } catch (error) {
    console.warn(
      `MongoDB is not reachable at ${mongoUri}. The API will continue in fallback mode.`,
      error,
    );
  }
}

function ensureDb(res: express.Response) {
  if (!db) {
    res.status(503).json({
      message: 'MongoDB is unavailable. Start MongoDB on localhost:27017 to enable data APIs.',
    });
    return false;
  }

  return true;
}

function buildIdentifierFilter(docId: string) {
  const normalizedId = decodeURIComponent(docId).trim();
  return {
    $or: [{ id: normalizedId }, { email: normalizedId }],
  };
}

function normalizePayload(payload: Record<string, unknown>, docId: string) {
  const normalized = { ...payload };

  if (!normalized.id) {
    normalized.id = docId;
  }

  if (!normalized.email && typeof normalized.id === 'string' && normalized.id.includes('@')) {
    normalized.email = normalized.id;
  }

  if (!normalized.createdAt) {
    normalized.createdAt = new Date().toISOString();
  }

  return normalized;
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: db ? mongoDbName : 'unavailable',
    mongoUri,
    message: 'CrmPortal backend is running',
  });
});

app.get('/api/collections', async (_req, res) => {
  if (!ensureDb(res)) return;

  const collections = await db!.listCollections().toArray();
  res.json(collections.map((collection) => collection.name));
});

app.get('/api/collections/:collection', async (req, res) => {
  if (!ensureDb(res)) return;

  const collection = db!.collection(req.params.collection);
  const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
  const cleanDocuments = documents.map((document) => {
    const { _id, ...safeDocument } = document;
    return safeDocument;
  });

  res.json(cleanDocuments);
});

app.put('/api/collections/:collection/:docId', async (req, res) => {
  if (!ensureDb(res)) return;

  const { collection: collectionName, docId } = req.params;
  const collection = db!.collection(collectionName);
  const normalizedPayload = normalizePayload(req.body ?? {}, docId);

  await collection.updateOne(
    buildIdentifierFilter(docId),
    {
      $set: normalizedPayload,
    },
    { upsert: true },
  );

  res.status(200).json({
    collection: collectionName,
    docId,
    status: 'saved',
  });
});

app.delete('/api/collections/:collection/:docId', async (req, res) => {
  if (!ensureDb(res)) return;

  const { collection: collectionName, docId } = req.params;
  const collection = db!.collection(collectionName);

  await collection.deleteOne(buildIdentifierFilter(docId));
  res.status(204).send();
});

app.post('/api/collections/:collection/bulk', async (req, res) => {
  if (!ensureDb(res)) return;

  const { collection: collectionName } = req.params;
  const collection = db!.collection(collectionName);
  const items = Array.isArray(req.body?.items)
    ? (req.body.items as Array<Record<string, unknown>>)
    : [];

  const operations = items.map((item: Record<string, unknown>) => {
    const docId = String(item?.id ?? item?.email ?? `${Date.now()}-${Math.random()}`);
    const normalizedPayload = normalizePayload(item, docId);

    return {
      updateOne: {
        filter: buildIdentifierFilter(docId),
        update: {
          $set: normalizedPayload,
        },
        upsert: true,
      },
    };
  });

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }

  res.status(200).json({
    collection: collectionName,
    count: operations.length,
    status: 'bulk-saved',
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

await connectMongo();

app.listen(port, () => {
  console.log(`CrmPortal backend listening on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await mongoClient?.close();
  process.exit(0);
});
