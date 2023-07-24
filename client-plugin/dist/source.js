(function (funcName, baseObj) {
  funcName = funcName || "docReady";
  baseObj = baseObj || window;
  var readyList = [];
  var readyFired = false;
  var readyEventHandlersInstalled = false;

  function ready() {
    if (!readyFired) {
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        readyList[i].fn.call(window, readyList[i].ctx);
      }
      readyList = [];
    }
  }

  function readyStateChange() {
    if (document.readyState === "complete") {
      ready();
    }
  }

  baseObj[funcName] = function (callback, context) {
    if (typeof callback !== "function") {
      throw new TypeError("callback for docReady(fn) must be a function");
    }

    if (readyFired) {
      setTimeout(function () {
        callback(context);
      }, 1);
      return;
    } else {
      readyList.push({
        fn: callback,
        ctx: context
      });
    }
    // if document already ready to go, schedule the ready function to run
    if (document.readyState === "complete") {
      setTimeout(ready, 1);
    } else if (!readyEventHandlersInstalled) {
      // otherwise if we don't have event handlers installed, install them
      if (document.addEventListener) {
        // first choice is DOMContentLoaded event
        document.addEventListener("DOMContentLoaded", ready, false);
        // backup is window load event
        window.addEventListener("load", ready, false);
      } else {
        // must be IE
        document.attachEvent("onreadystatechange", readyStateChange);
        window.attachEvent("onload", ready);
      }
      readyEventHandlersInstalled = true;
    }
  }
})("docReady", window);
var compElasticSearchDatasource = {
  template: `<el-form label-position="left" inline="" :rules="rules" :model="scopeRow" class="data-source-form" v-if="scopeRow.expand">
    <el-form-item data-v-560f41ff="">
      <span class="title" data-v-560f41ff="">Elasticsearch</span>
    </el-form-item>
    <el-form-item label="URL" class="content" data-v-560f41ff=""  prop="url">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.url }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.url" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item label="Node URL" class="content" data-v-560f41ff="" prop="json_data.url">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.json_data.url }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.json_data.url" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item label="Index" class="content" data-v-560f41ff="" prop="json_data.index">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.json_data.index }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.json_data.index" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item label="User" class="content" v-if="!scopeRow.isEdit" data-v-560f41ff="">
      <span>{{ scopeRow.user }}</span>
    </el-form-item>
    <el-form-item label="Password" class="content" v-if="!scopeRow.isEdit" data-v-560f41ff="">
      <span>{{ scopeRow.password }}</span>
    </el-form-item>
    <el-form-item label="User" class="content" v-if="scopeRow.isEdit" data-v-560f41ff="">
      <el-input v-model="scopeRow.user" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item label="Password" class="content" v-if="scopeRow.isEdit" data-v-560f41ff="">
      <el-input v-model="scopeRow.password" show-password="" type="password" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item label="Connect Json" class="content" v-if="!scopeRow.isEdit" data-v-560f41ff="">
      <el-checkbox v-model="scopeRow.json_data.useConnectJson" data-v-560f41ff="" disabled>Use Connect Json</el-checkbox>
    </el-form-item>
    <el-form-item label="Connect Json" class="content" v-if="scopeRow.isEdit" data-v-560f41ff="">
    <el-checkbox v-model="scopeRow.json_data.useConnectJson" data-v-560f41ff="">Use Connect Json</el-checkbox>
    </el-form-item>
    <el-form-item label="Connect Json" class="content" v-if="!scopeRow.isEdit" data-v-560f41ff="">
      <el-input type="textarea" v-model="connectJson" data-v-560f41ff="" disabled></el-input>
    </el-form-item>
    <el-form-item label="Connect Json" class="" v-if="scopeRow.isEdit" data-v-560f41ff="" prop="json_data.connectJson">
      <el-input type="textarea" v-model="connectJson" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item class="content" data-v-560f41ff="">
      <el-button icon="el-icon-refresh" @click="checkSourceConnection(scopeRow)" data-v-560f41ff=""></el-button>
    </el-form-item>
  </el-form>`,
  name: "compElasticSearchDatasource",
  props: {
    langTrans: {
      type: Function
    },
    msgBox: {
      type: Function
    },
    row: {
      type: Object
    }
  },
  data() {
    return {
      scopeRow: this.row,
      typeIsJson: false,
      rules: {
        url: [{ required: true, message: '请输入活动名称A', trigger: 'blur' }],
        'json_data.url': [{ required: true, message: '请输入活动名称B', trigger: 'blur' }],
        'json_data.index': [{ required: true, message: '请输入活动名称C', trigger: 'blur' }],
        'json_data.connectJson': [
          { validator: this.validatePass, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    connectJson: {
      get () {
        if (this.scopeRow?.json_data?.connectJson) {
          return this.formatAndFillTextarea(this.scopeRow.json_data.connectJson);
        } else {
          return '';
        }
      },
      set (val) {
        // this.scopeRow.json_data.connectJson = this.convertToJSON(val);
        if (this.scopeRow?.json_data) {
          this.scopeRow.json_data.connectJson = this.convertToJSON(val);
        } else {
          this.scopeRow.json_data = {
            connectJson: this.convertToJSON(val)
          }
        }
        console.log(this.scopeRow.json_data.connectJson)
      }
    }
  },
  watch: {
    //   scopeRow (val){
    //       this.$emit('sync-row-data', val)
    //   }
    // connectJson (val) {
    //   console.log('why')
    //   if (this.scopeRow?.json_data) {
    //     this.scopeRow.json_data.connectJson = this.convertToJSON(val);
    //   } else {
    //     this.scopeRow.json_data = {
    //       connectJson: this.convertToJSON(val)
    //     }
    //   }
    // }
  },
  methods: {
    handleClick(row) {
      console.log(row);
    },
    validatePass (rule, value, callback) {
      if (this.typeIsJson) {
        callback(new Error('json format fail'));
      } else {
        callback()
      }
    },
    convertToJSON(value) {
      console.log('convertToJSON', typeof value, value);
      const content = value;
      // 移除內容中的換行符號 \n
      const contentWithoutNewlines = content.replace(/\n/g, '');
      
      // 將內容轉換成 JSON 字串
      if (this.isJSONString(contentWithoutNewlines)) {
        const jsonStr = JSON.stringify(JSON.parse(contentWithoutNewlines));
        // const jsonStr = JSON.parse(contentWithoutNewlines);
        
        console.log('convertToJSON out :', jsonStr);
        this.typeIsJson = true;
        return jsonStr;
      } else {
        console.log('convertToJSON out')
        this.typeIsJson = false;
        return ''
      }
    },
    formatAndFillTextarea (jsonString) {
      const jsonData = JSON.parse(jsonString);
    
      // 將 JSON 字串格式化（第三個參數為縮進空格數，這裡設定為 2）
      const formattedJsonStr = JSON.stringify(jsonData, null, 2);
      console.log(formattedJsonStr);
      return formattedJsonStr;
    },
    isJSONString(str) {
      try {
        const parsedJSON = JSON.parse(str);
        console.log('parsedJSON:', parsedJSON)
        if (typeof parsedJSON === 'object' && parsedJSON !== null) {
          return true;
        }
      } catch (e) {
        // 解析失敗，不是有效的 JSON 字串
      }
      return false;
    },
    borderStyle (condition) {
      if (condition) {
        console.log('connectJson 1*')
        return '1px solid rgb(0,0,0)'
      } else {
        console.log('connectJson 2*')
        return '1px solid rgb(255,0,0)'
      }
    },
    checkSourceConnection(row) {
      var me = this;
      console.log('row', row)
      // fetch(`${row.url}`)
      fetch(`${row.url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
      }).then(response => response.json())
        .then(data => {
          if (data.errCode === 0) {
            me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
          } else {
            me.msgBox({message: data.status, type: 'error', duration: 2000});
          }
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
          me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
        });
      //  var orgId = parseInt(this.$route.params.orgId);
      // if(row && !row.url) {
      //    return false;
      // }
      // if(row && row.access == 'proxy') {
      //   var localhostUrl  = window.location.origin;
      //   var proxyqueryType = '/api/datasource/proxy/connect';
      //   var xhttp = new XMLHttpRequest();
      //   xhttp.onreadystatechange = function() {
      //       if (this.readyState == 4 && this.status == 200) {
      //          respData = JSON.parse(this.response);
      //         if(respData && respData.errCode == 0){
      //             console.log('connect success',this.response);
      //             me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
      //         } else {
      //             me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
      //         }
      //          // Typical action to be performed when the document is ready:
      //          // document.getElementById("demo").innerHTML = xhttp.responseText;
      //       } else {
      //       }
      //   };
      //   xhttp.open("POST", localhostUrl + proxyqueryType, true);
      //   xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      //   xhttp.send(JSON.stringify({'url': row.url, 'org_id':orgId}));
      // } else {
      //   var xhttp = new XMLHttpRequest();
      //   xhttp.onreadystatechange = function() {
      //       if (this.readyState == 4) {
      //          if(this.status == 200){
      //             // console.log('connect success');
      //             me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
      //             // Typical action to be performed when the document is ready:
      //             // document.getElementById("demo").innerHTML = xhttp.responseText;
      //          } else {
      //             me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
      //          }
      //       } else {
      //       }
      //   };
      //   var url = me.updateQueryStringParam(row.url, 'org_id', orgId);
      //   xhttp.open("GET", url, true);
      //   xhttp.send();
      // }
    }
  }
};

docReady(function () {
  var css = `.datasourceBlock {
  text-align: center;
  color: #2c3e50;}
`;
  var head = document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
});