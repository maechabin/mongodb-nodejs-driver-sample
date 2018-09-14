const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/** 接続URL */
const url = 'mongodb://localhost:27017';

/** DB名 */
const dbName = 'myDB';

/** Create */
const insertDocuments = (db, callback) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** collectionにdocumentを追加 */
  collection.insertMany(
    [{ name: 'Dan', age: 18 }, { name: 'Bob', age: 22 }, { name: 'John', age: 30 }],
    (err, result) => {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      console.log('Inserted 3 documents into the collection');
      /** 結果をコールバック関数に渡す */
      callback(result);
    },
  );
};

/** Read */
const findDocuments = (db, callback) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを検索（ageが20以上のdocumentのnameを取得） */
  collection
    .find({})
    .project({ name: 1 })
    .toArray((err, docs) => {
      assert.equal(err, null);
      console.log('Found the following records');
      console.log(docs);
      callback(docs);
    });
};

/** Update */
const updateDocument = (db, callback) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを更新（ageが19以下のdocumentに{ status: false }を追加） */
  collection.updateMany({ age: { $lt: 20 } }, { $set: { status: false } }, (err, result) => {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Updated the document with the field a equal to 2');
    callback(result);
  });
};

/** Delete */
const removeDocument = (db, callback) => {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを削除（statusがfalseのdocuentを削除） */
  collection.deleteMany({ status: false }, (err, result) => {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log('Removed the document with the field a equal to 3');
    callback(result);
  });
};

/** indexes */
const indexCollection = (db, callback) => {
  db.collection('myCollection').createIndex({ name: 1 }, null, (err, results) => {
    callback();
  });
};

/** 　DBサーバに接続 */
MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  assert.equal(null, err);
  console.log('Connected successfully to server');

  /** DBを取得 */
  const db = client.db(dbName);

  insertDocuments(db, () => { // Create
    indexCollection(db, () => { // Index
      updateDocument(db, () => { // Update
        findDocuments(db, () => { // Read
          removeDocument(db, () => { // Delete
            findDocuments(db, () => { // Read
              /** DBサーバとの接続解除 */
              client.close();
            });
          });
        });
      });
    });
  });
},
);
