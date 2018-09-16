const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/** 接続URL */
const url = 'mongodb://localhost:27017';

/** DB名 */
const dbName = 'myDB';

/** Create */
function insertDocuments(db) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** collectionにdocumentを追加 */
  collection.insertMany(
    [{ name: 'Dan', age: 18 }, { name: 'Bob', age: 22 }, { name: 'John', age: 30 }],
    (err, result) => {
      // アサーションテスト
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      /** 成功した旨をコンソールに出力 */
      console.log('Inserted 3 documents into the collection');
    },
  );
}

/** Read */
function findDocuments(db) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを検索（ageが20以上のdocumentのnameを取得） */
  collection
    .find({})
    .project({ name: 1 })
    .toArray((err, docs) => {
      // アサーションテスト
      assert.equal(err, null);
      /** 成功した旨をコンソールに出力 */
      console.log('Found the following records');
      /** 検索結果をコンソールに出力 */
      console.log(docs);
    });
}

/** Update */
function updateDocument(db) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを更新（ageが19以下のdocumentに{ status: false }を追加） */
  collection.updateMany({ age: { $lt: 20 } }, { $set: { status: false } }, (err, result) => {
    // アサーションテスト
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    /** 成功した旨をコンソールに出力 */
    console.log('Updated the document with the field a equal to 2');
  });
}

/** Delete */
function removeDocument(db) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを削除（statusがfalseのdocuentを削除） */
  collection.deleteMany({ status: false }, (err, result) => {
    // アサーションテスト
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    /** 成功した旨をコンソールに出力 */
    console.log('Removed the document with the field a equal to 3');
  });
}

/** indexes */
function indexCollection(db) {
  db.collection('myCollection').createIndex({ name: 1 }, null, (err, results) => {
    /** 結果をコンソールに出力 */
    console.log(results);
  });
}

/** 即時関数をasync functionとして定義 */
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

    /** CRUDを行う関数をawitで待機させる */
    await insertDocuments(db); // Create
    await updateDocument(db); // Update
    await findDocuments(db); // Read
    await removeDocument(db); // Delete
    await findDocuments(db); // Read
  } catch (err) {
    /** DBサーバ接続に失敗した時の処理 */
    console.log(err.stack);
  }

  /** DBサーバとの接続解除 */
  client.close();
})();
