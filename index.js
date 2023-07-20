const express = require('express');
var cors = require('cors')
let config = require('./config.json');
const {
  Client
} = require('@elastic/elasticsearch');
const https = require('https');

var app = express();
app.use(cors())
app.use(express.json());

const port = config.port || 3500;

// 獲取索引的 Mapping
async function getIndexMapping(index) {
  try {
    const response = await client.indices.getMapping({
      index: index,
    });
    return response;
  } catch (err) {
    console.error('獲取 Mapping 時出現錯誤：', err);
    return null;
  }
}

// 列出索引中所有字段
async function listAllFields(index) {
  const mapping = await getIndexMapping(index);
  if (mapping && mapping[index] && mapping[index].mappings) {
    const properties = mapping[index].mappings.properties;
    // const fields = Object.keys(properties);
    // console.log('索引中所有字段：', fields);
    // 將物件轉換成目標格式的陣列
    const convertedArray = Object.entries(properties).map(([key, value]) => ({
      text: key,
      type: value.type,
    }));
    return convertedArray;
  } else {
    console.log('找不到索引或 Mapping。');
    return null;
  }
}

async function getData(req, res) {
  const data = req.body;
  const jsonData = JSON.parse(data.jsondata);
  const r = {};
  r.errCode = 0;
  r.data = [];

  const connectOption = {
    node: jsonData.url
  }

  const client = new Client(connectOption);

  for (let c = 0; c < data.targets.length; c++) {
    const item = {
      target: data.targets[c].target,
      type: data.targets[c].type,
    };
    try {
      const response = await client.search({
        index: index,
        body: query,
      });
      if (esponse?.hits?.hits) {
        const dataObjects = response.hits.hits
        // response.hits.hits
        if (data.targets[c].type === 'table') {
          // 列出索引中所有字段
          const fields = await listAllFields(index);
          item.columns = fields;
          item.rows = []
          const convertedArray = dataObjects.map((obj) => {
            const val = fields.map((field) => {
              const fieldName = field.text;
              return obj._source[fieldName] ?? '';
            });
            return val;
          });
          item.rows = convertedArray;
        }
        if (data.targets[c].type === 'timeseries') {
          item.datapoints = [];
        }
      }
    } catch (err) {
      console.error('搜索數據時出現錯誤：', err);
    }
    r.data.push(item);
  }
  res.json(r.data);
  res.end();
}

app.all('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/query', getData)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})