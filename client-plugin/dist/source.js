
(function(funcName, baseObj) {
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
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }

        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            readyList.push({fn: callback, ctx: context});
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
var compElasticSearchDatasource={
    template:`<el-form label-position="left" inline="" class="data-source-form" v-if="scopeRow.expand">
    <el-form-item data-v-560f41ff="">
      <span class="title" data-v-560f41ff="">Elasticsearch</span>
    </el-form-item>
    <el-form-item label="URL" class="content" data-v-560f41ff="">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.url }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.url" data-v-560f41ff=""></el-input>
    </el-form-item>
    <el-form-item label="Index" class="content" data-v-560f41ff="">
      <span v-if="!scopeRow.isEdit" data-v-560f41ff="">{{ scopeRow.index }}</span>
      <el-input v-if="scopeRow.isEdit" size="small" v-model="scopeRow.index" data-v-560f41ff=""></el-input>
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
    <el-row data-v-560f41ff="">
      <el-button icon="el-icon-refresh" @click="checkSourceConnection(scopeRow)" data-v-560f41ff=""></el-button>
    </el-row>
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
      scopeRow: this.row
    }
  },
  watch:{
    //   scopeRow (val){
    //       this.$emit('sync-row-data', val)
    //   }
  },
  methods: {
    handleClick(row) {
      console.log(row);
    },
    checkSourceConnection(row) {
       var me = this;
       var orgId = parseInt(this.$route.params.orgId);
      if(row && !row.url) {
         return false;
      }
      if(row && row.access == 'proxy') {
        var localhostUrl  = window.location.origin;
        var proxyqueryType = '/api/datasource/proxy/connect';
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               respData = JSON.parse(this.response);
              if(respData && respData.errCode == 0){
                  console.log('connect success',this.response);
                  me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
              } else {
                  me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
              }
               // Typical action to be performed when the document is ready:
               // document.getElementById("demo").innerHTML = xhttp.responseText;
            } else {
            }
        };
        xhttp.open("POST", localhostUrl + proxyqueryType, true);
        xhttp.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
        xhttp.send(JSON.stringify({'url': row.url, 'org_id':orgId}));
      } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
               if(this.status == 200){
                  // console.log('connect success');
                  me.msgBox({message: me.langTrans('dataSource.message.connectSuccess'), type: 'success', duration: 2000});
                  // Typical action to be performed when the document is ready:
                  // document.getElementById("demo").innerHTML = xhttp.responseText;
               } else {
                  me.msgBox({message: me.langTrans('dataSource.message.connectFail'), type: 'error', duration: 2000});
               }
            } else {
            }
        };
        var url = me.updateQueryStringParam(row.url, 'org_id', orgId);
        xhttp.open("GET", url, true);
        xhttp.send();
      }
    }
  }
}
;

docReady(function(){
    var css = `.datasourceBlock {
  text-align: center;
  color: #2c3e50;}
`;
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if(style.styleSheet){
        style.styleSheet.cssText = css;
    }else{
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
});
