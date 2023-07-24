(function(global) {
    if(global.scPlugin &&
        global.scPlugin.datasource &&
        global.scPlugin.datasource["elasticsearch-cs"]){
        return;
    }
    commonUtil.createObjFromString(global,'scPlugin.datasource.elasticsearch-cs',{});

var simpleJsonSource = {};

simpleJsonSource.dataBindingUI = function(sourceFormPane, targets) {
	var S = hteditor.getString;
	if (targets && targets[0] && targets[0]['sourceType']) {
		dataBindingUI.addSrouceTypeRow(sourceFormPane, targets[0]['sourceType']);
	}else{
		dataBindingUI.addSrouceTypeRow(sourceFormPane);
	}
	if (targets && targets[0] && targets[0]['formatType']) {
		dataBindingUI.addFormatTypeRow(sourceFormPane, targets[0]['formatType']);
	}else{
		dataBindingUI.addFormatTypeRow(sourceFormPane);
	}
	if (targets && targets[0] && targets[0]['scDataType']) {
		dataBindingUI.addDataTypeRow(sourceFormPane, targets[0]['scDataType']);
	}else{
		dataBindingUI.addDataTypeRow(sourceFormPane);
	}
	if (targets && targets[0] && targets[0]['sourceType']) {
		var targetListComboBox = new ht.widget.ComboBox();

		// scadaNodeComboBox.setValue(source);
		targetListComboBox.setWidth(90);
		targetListComboBox.setDropDownWidth(140);
		targetListComboBox.setEditable(true);
		targetListComboBox.onValueChanged = function() {};
		sourceFormPane.addRow([S('target'), {
			id: 'target',
			label: 'String',
			element: targetListComboBox,
			unfocusable: true
		}], [55, 0.1]);

		dataSourceUtil.sendHttpReqBySourceType(targets[0]['sourceType'], '/search', [], function (response) {
			if (Array.isArray(response) && response.length > 0) {
				var values, labels;
				if (typeof (response[0]) === "string") {
					values = response,
						labels = response;
				} else {
					values = [], labels = [];
					for (var i = 0; i < response.length; i++) {
						values.push(response[i]['text']);
						labels.push(response[i]['text']);
					}
				}
				targetListComboBox.setValues(values);
				targetListComboBox.setLabels(response);
				if (typeof (targets[0]['target']) != "undefined") {
					targetListComboBox.setValue(targets[0]['target']);
				} else {
					targetListComboBox.setValue(values[0]);
				}
			}

			return true;
		});
	}
}

simpleJsonSource.applyDataBindingUI = function(sourceFormPane) {
	var targets = [];
	var paneRows = sourceFormPane.getRows();
	var target = {};
	for (var i = 0; i < paneRows.length; i++) {
		if (paneRows[i]['items']) {
			target[paneRows[i]['items'][1]['id']] = sourceFormPane.v(paneRows[i]['items'][1]['id']);
		}
	}
	targets.push(target);
	return targets;
};

simpleJsonSource.mapToValue = function(aniPropName, formatType, dataResult){
    //special property list
    //table
    if (['table.columns','table.dataSource'].indexOf(aniPropName) > -1) {
        return dataResult;
    }

     if (formatType == 'timeseries') {
        return dataRefreshUtil.refreshTimeSeriesData(dataResult);
    } else if (formatType == 'table') {
        return dataRefreshUtil.refreshTableData(dataResult);
    } else {
        return dataResult
    }
    return dataResult;
};


simpleJsonSource.getValue = function (sourceName, reqTargets, callback, option) {
	var queryType = '/query';
	var proxyqueryType = '/api/datasource/proxy/query';
	var sourceList = dataSourceUtil.getSourceListByOrg();
	var orgId = commonUtil.getParamFromURL('org_id');
	var fileName;
	if (typeof option != 'undefined' && option['fileName']) {
		fileName = option['fileName']
	}

	for (var i = 0; i < sourceList.length; i++) {
		if (sourceName == sourceList[i]['name']) {
			//check plugin type
			var isProxy = sourceList[i].access == "proxy";
			var postUrl  = window.location.origin;
			if (sourceList[i].access == "proxy") {
				postUrl = postUrl + proxyqueryType;
			}else {
				postUrl = sourceList[i].url + queryType;
			}
			var header = {"Content-type":'application/json; charset=UTF-8'}
			if (sourceList[i].basicAuth) {
				header = Object.assign(header, {"Authorization": "Basic " + btoa(sourceList[i].basicAuthUser + ":" + sourceList[i].basicAuthPassword)});
			}
			var withCredentials = false;
			if (sourceList[i].with_credentials || sourceList[i].basic_auth) {
				withCredentials = sourceList[i].with_credentials;
			}
			if (sourceList[i].with_credentials) {
				var token = commonUtil.getCookie("EIToken");
				header = Object.assign(header, {"Authorization": "Bearer " + token});
			}

			var curDate = new Date();
			var pastDate = new Date();
			var rangeObj = {};
			pastDate.setSeconds(curDate.getSeconds() - 300);

			// change variables
			for (var j = 0; j < reqTargets.length; j++){
				if(reqTargets[j]["target"]){
					if (typeof fileName != 'undefined') {
						reqTargets[j]["target"] = dataRefreshUtil.variableSrv.replaceWithTextByFileName(fileName, reqTargets[j]["target"]);
					} else {
						reqTargets[j]["target"] = dataRefreshUtil.variableSrv.replaceWithText(reqTargets[j]["target"]);
					}
				}
			}

			var jsonStr = {
					"range": {
							"from": pastDate,
							"to": curDate
					},
					"rangeRaw": {
							"from": "now-5m",
							"to": "now"
					},
					"maxDataPoints": 400,
					"interval": "1s",
					"intervalMs": 1000,
					'jsondata': sourceList[i].json_data,
					"targets": reqTargets
			};
			if (dataRefreshUtil && dataRefreshUtil.timeRange) {
				if (typeof fileName != 'undefined') {
					rangeObj = dataRefreshUtil.timeRange.currentRangeByFileName(fileName);
				} else {
					rangeObj = dataRefreshUtil.timeRange.currentRange();
				}
				if(rangeObj){
					jsonStr["range"] = rangeObj["range"];
					jsonStr["rangeRaw"] = rangeObj["rangeRaw"];
					jsonStr["interval"] = rangeObj["interval"];
					jsonStr["intervalMs"] = rangeObj["intervalMs"];
					jsonStr["maxDataPoints"] = rangeObj["maxDataPoints"];
				}
			}
			if(sourceList[i].access == "websocket") {
				if (typeof(socketUtil) != 'undefined') {
					jsonStr['sourceList'] = sourceList[i];
					jsonStr['org_id'] = parseInt(orgId);

					var msg = {};
					msg.title = "socket_query";
					msg.from  = "front-end test";
					msg.data  = jsonStr;

					socketUtil.send('data', msg, callback);
				}
			} else {
				var body = '';
				if (isProxy){
					jsonStr['sourceList'] = sourceList[i];
					jsonStr['org_id'] = parseInt(orgId);
					body = JSON.stringify(jsonStr);
				}else if (sourceList[i].access == "direct"){
					jsonStr['org_id'] = parseInt(orgId);
					body = JSON.stringify(jsonStr);
				}
				workerUtil.postmessage({
					method:'httpPost',
					arguments:[postUrl,{
						header:header,
						withCredentials: withCredentials,
						body: body
					}]},
					function(response){
						if (typeof(callback) != "undefined") {
							if (isProxy) {
								var res = JSON.parse(response)
								if (res.errCode == 0) {
									callback(res.data);
								} else {
									return false
								}
							} else {
								if(typeof(response) == 'string'){
									callback(JSON.parse(response));
								}else{
									callback(response);
								}
							}
						}
						return true;
					}
				);
			}
			break;
		}
	}
	return true;
}

simpleJsonSource.setValue = function(sourceName, reqTargets, callback) {
    var sourceInfo = dataSourceUtil.getSourceInfo(sourceName);
	var EIToken = commonUtil.getCookie("EIToken");

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (typeof(callback) != "undefined") {
                if (typeof(this.response) == 'string' && this.response.length > 0) {
                    callback(JSON.parse(this.response));
                } else {
                    callback(this.response);
                }
            }
        }
        return true;
    };

    xhttp.open("POST", sourceInfo['url'] + '/setValue', true);
	xhttp.setRequestHeader("Authorization","Bearer "+EIToken);
	xhttp.timeout = 30000; 
    xhttp.ontimeout = function (e) {};
    if (sourceInfo["basicAuth"]) {
        xhttp.setRequestHeader("Authorization", "Basic " + btoa(sourceInfo['basicAuthUser'] + ":" + sourceInfo['basicAuthPassword']));
    }

    xhttp.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    if (sourceInfo["with_credentials"] || sourceInfo["basicAuth"]) {
        xhttp.withCredentials = sourceInfo["with_credentials"];
    }

    // xhttp.withCredentials = sourceInfo["with_credentials"];
    xhttp.send(JSON.stringify(reqTargets));
    return true;
    
};


simpleJsonSource.closeGraph = function (sourceName, sourceType, reqTargets, sourceObject) {
	console.log('simple json close graph')
}

  global.scPlugin.datasource["elasticsearch-cs"] = simpleJsonSource;
})(this);