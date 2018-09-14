const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/** 接続URL */
const url = 'mongodb://localhost:27017';

/** DB名 */
const dbName = 'myDB';

/** Create */
const insertDocuments = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection2');
  /** collectionにdocumentを追加 */
  collection.insertMany(
    [{ name: 'Dan', age: 18 }, { name: 'Bob', age: 22 }, { name: 'John', age: 30 }],
    (err, result) => {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      console.log('Inserted 3 documents into the collection');
    },
  );
};

/** Read */
const findDocuments = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection2');
  /** documentを検索（ageが20以上のdocumentのnameを取得） */
  collection
    .find({})
    .project({ name: 1 })
    .toArray((err, docs) => {
      assert.equal(err, null);
      console.log('Found the following records');
      console.log(docs);
    });
};

/** Update */
const updateDocument = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection2');
  /** documentを更新（ageが19以下のdocumentに{ status: false }を追加） */
  collection.updateMany({ age: { $lt: 20 } }, { $set: { status: false } }, (err, result) => {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Updated the document with the field a equal to 2');
  });
};

/** Delete */
const removeDocument = (db) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection2');
  /** documentを削除（statusがfalseのdocuentを削除） */
  collection.deleteMany({ status: false }, (err, result) => {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Removed the document with the field a equal to 3');
  });
};

/** indexes */
const indexCollection = (db, callback) => {
  db.collection('myCollection2').createIndex({ name: 1 }, null, (err, results) => {});
};

(async function() {
  let client;

  try {
    /** DBサーバに接続 */
    client = await MongoClient.connect(
      url,
      { useNewUrlParser: true },
    );
    /** DBを取得 */
    const db = client.db(dbName);

    await insertDocuments(db); // Create
    await indexCollection(db); // Index
    await updateDocument(db); // Update
    await findDocuments(db); // Read
    await removeDocument(db); // Delete
    await findDocuments(db); // Read
  } catch (err) {
    console.log(err.stack);
  }

  /** DBサーバとの接続解除 */
  client.close();
})();
