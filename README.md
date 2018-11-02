Tejat
=====

A Server-side JavaScript Framework.

簡介
------------

這一個專案目前仍在開發與設計當中，原本構思的內容是要將 MonogoDB 的一些操作方式從 JS 程式
控制改成以 API 的方式操作，並且設計成一個可外掛式模組，如此一來就能讓我的一些專案可以根據
需求很方便的直接掛上這個模組，然後快速擁有一個可以直接使用的 MonogoDB API，而不需要撰寫
許多程式。

簡單來說就是一個懶人 MongoDB API 框架。

後來覺得這個框架似乎可以做到更多的事情，而且能簡化不少的程式撰寫，所以逐漸朝向一個網站伺服器
框架的方向前進，只不過我還處在要採用 ES7 還是先用 ES6，目前是傾向 ES7。

提醒一下路過不小心看到的路人們，這個框架許多部分還在開發，目前僅有 MongoDB API 的規劃功能。
其他與網站有關的部分目前都還在開發中。

然後還請各位路過的先進提供意見，我將萬分感謝。

安裝
-----

    git clone https://github.com/single9/Tejat.git
    cd Tejat
    npm install

> Node 版本建議採用 7.x 以上

使用
-----

啟動伺服器：

    node index.js

這個程式會在啟動時主動去搜尋 `modules` 資料夾中檔案，並根據檔案名稱新增一個路由到 Express
之中。所以說，你只需要參考 `modules/test.js` 這個檔案就能夠快速的為不同的 collection 設
記一個專屬於它的 API。

**modules/test.js**

```js
/**
* Module dependencies.
* @ignore
*/

const Framework = require("../libs/framework");

var test = new Framework({
  // 定義 Schema
  schemas: {
    hi: {
      values: {
        type: Array,
        unique: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    },
    alpha: {
      username: {
        type: Array,
        required: true,
        unique: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // 自定義方法
  methods: {
    test: function (req, res) {
      res.json(true);
      return this;
    }
  },

  // 自定義路由
  routes: {
    "/test": ["get", "test"]
  }

});

module.exports = test;
```

### schemas

這部分參考 moongose 關於 [Schema](http://mongoosejs.com/docs/guide.html) 的說明。

    schemas: {
      schema_name: {
        schema_prop_1: {
          ....
        },
        schema_prop_2: {
          ....
        }
      },
      ...
    }

### methods

可自行增加額外所需的方法。

    methods: {
      function_name: function(arg) {
        // Something todo.
      },
      ...
    }


### routes

除框架內的基本路由外，亦可自行設定新的路由。

    routes: {
      "/user": [
        {method: "HTTP method", fnName: "method name"}
      ]
    }

此外，你還可以在路由進入之前或之後加 middleware。

#### before

    beforeRoutes: [
      {path: 'path', fnName: 'method name'}
    ],

#### after

    afterRoutes: [
      {path: 'path', fnName: 'method name'}
    ],

path 不特別設定則如同 `app.route.use(middleware)`

使用範例
------

### 新增

POST http://localhost:3000/test

    {
      "schema":"hi",
      "values": {
        "str": "hello!"
      }
    }

RESPONSE

    {
      "status": true,
      "response": {
        "__v": 0,
        "str": "hello!",
        "_id": "58da0ada1577ce26c3d19832",
        "date": "2017-03-28T07:03:54.709Z"
      }
    }

### 查詢

GET http://localhost:3000/test/hi

RESPONSE

    {
      "status": true,
      "response": [
        {
          "_id": "58da0ada1577ce26c3d19832",
          "str": "hello!",
          "__v": 0,
          "date": "2017-03-28T07:03:54.709Z"
        },
        {
          "_id": "58da0b4d1577ce26c3d19833",
          "str": "Yes",
          "__v": 0,
          "date": "2017-03-28T07:05:49.289Z"
        }
      ]
    }

GET http://localhost:3000/test/hi?_id=58da0ada1577ce26c3d19832

RESPONSE

    {
      "status": true,
      "response": [
        {
          "_id": "58da0ada1577ce26c3d19832",
          "str": "hello!",
          "__v": 0,
          "date": "2017-03-28T07:03:54.709Z"
        }
      ]
    }

GET http://localhost:3000/test/hi?str=hello!

RESPONSE

    {
      "status": true,
      "response": [
        {
          "_id": "58da0ada1577ce26c3d19832",
          "str": "hello!",
          "__v": 0,
          "date": "2017-03-28T07:03:54.709Z"
        }
      ]
    }


### 修改

PUT http://localhost:3000/test/

    {
      "schema":"hi",
      "id": "58da0ada1577ce26c3d19832",
      "values": {
        "str": "yeeeeee"
      }
    }

RESPONSE

    {
      "status": true,
      "response": {
        "n": 0,
        "nModified": 0,
        "ok": 1
      }
    }

### 刪除

DELETE http://localhost:3000/test/

    {
      "schema":"hi",
      "id": "58da0ada1577ce26c3d19832"
    }

RESPONSE

    {
      "status": true,
      "response": {
        "n": 1,
        "ok": 1
      }
    }

預設路由
------

{Module Name} = 模組名稱，範例為 test。

### GET {Module Name}/{Schema Name}?{Querry String}

查詢資料。

**{Schema Name}**

即你所命名的 Schema Name，範例有兩個，一為 hi，二為 alpha。

**{Querry String}**

根據你訂的 Schema 內容來增減。

其他：

- limit: 限制回傳數量