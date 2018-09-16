const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/** 接続URL */
const url = 'mongodb://localhost:27017';

/** DB名 */
const dbName = 'myDB';

/** Create */
function insertDocuments(db, callback) {
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
      /** 結果を引数に指定してコールバック関数を実行 */
      callback(result);
    },
  );
}

/** Read */
function findDocuments(db, callback) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを検索（documentのnameを全件取得） */
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
      /** 結果を引数に指定してコールバック関数を実行 */
      callback(docs);
    });
}

/** Update */
function updateDocument(db, callback) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを更新（ageが19以下のdocumentに{ status: false }を追加） */
  collection.updateMany({ age: { $lt: 20 } }, { $set: { status: false } }, (err, result) => {
    // アサーションテスト
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    /** 成功した旨をコンソールに出力 */
    console.log('Updated the document with the field a equal to 2');
    /** 結果を引数に指定してコールバック関数を実行 */
    callback(result);
  });
}

/** Delete */
function removeDocument(db, callback) {
  /** collectionを取得 */
  const collection = db.collection('myCollection');
  /** documentを削除（statusがfalseのdocuentを削除） */
  collection.deleteMany({ status: false }, (err, result) => {
    // アサーションテスト
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    /** 成功した旨をコンソールに出力 */
    console.log('Removed the document with the field a equal to 3');
    /** 結果を引数に指定してコールバック関数を実行 */
    callback(result);
  });
}

/** indexes */
function indexCollection(db, callback) {
  db.collection('myCollection').createIndex({ name: -1 }, null, (err, results) => {
    /** 結果をコンソールに出力 */
    console.log(results);
    /** コールバック関数を実行 */
    callback();
  });
}

/** 　DBサーバに接続 */
MongoClient.connect(
  url,
  { useNewUrlParser: true },
  (err, client) => {
    /** errがnullではなかったら処理を停止 */
    assert.equal(null, err);
    /** 成功した旨をコンソールに出力 */
    console.log('Connected successfully to server');

    /** DBを取得 */
    const db = client.db(dbName);

    /** Create */
    insertDocuments(db, () => {
      /** Update */
      updateDocument(db, () => {
        /** Read */
        findDocuments(db, () => {
          /** Delete */
          removeDocument(db, () => {
            /** Read */
            findDocuments(db, () => {
              /** index **/
              indexCollection(db, () => {
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
