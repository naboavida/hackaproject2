'use strict';

function DataSourcesCtrl($scope, $routeParams, $http){
	console.log("DataSourcesCtrl");

	$scope.pid = $routeParams.pid;

	$scope.CONST_INACTIVE = 'Inactive';
	$scope.CONST_DROPBOX = 'Dropbox';

	$scope.CONST_EIPUBLICFOLDER = 'eipublicfolder';
	$scope.CONST_PRIVATEFOLDER = 'privatefolder';


	$scope.curr_data_source = '';
	$scope.curr_data_source_title = '';

	$scope.curr_dropbox_folder = '';

	$scope.dropbox = {
		"folder" : "Apps/Attachments",
		"client_folder": "oralmed_0591@sendtodropbox.com"
	};


	$scope.filenames = [];


	$scope.dataSources = [
		{"title": "MSAS Data Cube", "value": $scope.CONST_INACTIVE},
		{"title": "REST API", "value": $scope.CONST_INACTIVE},
		{"title": "Dropbox (.xlsx only)", "value": $scope.CONST_DROPBOX}
	];




	$scope.datasources = [];

	$http.get('/metadata/datasources/'+$scope.pid).
		success(function(data, status){
			$scope.datasources = [];
			for(var i=0; i<data.length; i++){
				$scope.datasources.push(data[i].xlsxmapping);
			}
			
		}).
		error(function(data, status){
			$scope.data = data || "Request failed";
		});



	$scope.bootstrapModalDataSources = function(obj){
		console.log("DataSourcesCtrl bootstrapModalDataSources");

		
		$http.get('/api/getProjectIndicators/'+$scope.pid).
			success(function(data, status){
				$scope.kpis_list = data;
				
				$http.get('/metadata/pointsNames/'+$scope.pid).
					success(function(data, status){
						$scope.points_list = data;


						if(obj != null){
							console.log(obj);

							$scope.curr_data_source = obj["curr_data_source"];
							$scope.curr_data_source_title = obj["curr_data_source_title"];
							$scope.curr_dropbox_folder = obj["curr_dropbox_folder"];
							$scope.curr_filename_regex = obj["curr_filename_regex"];
							$scope.curr_filename = obj["curr_filename"];
							$scope.curr_store = ""+obj["curr_store"];
							$scope.kpiMatching = obj["kpiMatching"];
							$scope.datalevels = obj["datalevels"];
							$scope.generaldata = obj["generaldata"];
							$scope.dropbox.folder = obj["folder"];
							$scope.dropbox.client_folder = obj["client_folder"];

							$scope.selectFilename($scope.curr_filename);
						} else {
							$scope.curr_data_source = '';
							$scope.curr_data_source_title = '';
							$scope.curr_dropbox_folder = '';
							$scope.dropbox = {
							"folder" : "Apps/Attachments",
							"client_folder": "oralmed_0591@sendtodropbox.com"
							};
							$scope.filenames = [];
							$scope.curr_filename = '';
							$scope.curr_filename_regex = '';
							$scope.xlsx_file = {};
							$scope.sheet_names = [];
							$scope.loaded_xlsx_file = false;
							var is_loading_xlsx_file = false;
							$scope.load_xlsx_file_message = "Select a file from the list above";
							$scope.show_spinner = false;
							$scope.fetch_file_error = null;
						}
					}).
					error(function(data, status){
						$scope.data = data || "Request failed";
					});
			}).
			error(function(data, status){
				$scope.data = data || "Request failed";
			});

	
		
		

	}


	$scope.setCurrDataSource = function(obj){
		$scope.curr_data_source = obj.value;
		$scope.curr_data_source_title = obj.title;
	}

	$scope.setCurrDropboxFolder = function(folder_name){
		$scope.curr_dropbox_folder = folder_name;
	}


	$scope.readDropboxFolder = function(){
		if($scope.curr_dropbox_folder == $scope.CONST_EIPUBLICFOLDER){

			if($scope.dropbox.folder.charAt(0) != '/'){
				$scope.dropbox.folder = ('/').concat($scope.dropbox.folder);
			}
			if($scope.dropbox.folder.charAt($scope.dropbox.folder.length-1) != '/'){
				$scope.dropbox.folder = $scope.dropbox.folder.concat('/');
			}

			$http.post('/dropboxApi/listPublicFolder/'+$scope.pid, $scope.dropbox).
				success(function(data, status){
					console.log("get dropboxApi/listPublicFolder");
					var filteredNames = data.filter(function(name){
						return (name.lastIndexOf('.xlsx') === (name.length-5));
					});
					$scope.filenames = filteredNames;
				}).
				error(function(data, status){
					$scope.data = data || "Request failed";
				});
		} else {
			// still not supported
		}
	}



	$scope.curr_filename = '';
	$scope.curr_filename_regex = '';

	$scope.xlsx_file = {};
	$scope.sheet_names = [];
	$scope.loaded_xlsx_file = false;
	var is_loading_xlsx_file = false;
	$scope.load_xlsx_file_message = "Select a file from the list above";
	$scope.show_spinner = false;
	$scope.fetch_file_error = null;


	$scope.selectFilename = function(name){
		if(!is_loading_xlsx_file){
			is_loading_xlsx_file = true;

			$scope.curr_filename = name;
			$scope.curr_filename_regex = name;

			$scope.xlsx_file = {};
			$scope.sheet_names = [];
			$scope.loaded_xlsx_file = false;
			$scope.load_xlsx_file_message = "Retrieving file from Dropbox";
			$scope.show_spinner = true;
			$scope.fetch_file_error = null;

			var postObj = {
				"folder": $scope.dropbox.folder,
				"client_folder": $scope.dropbox.client_folder,
				"filename": $scope.curr_filename
			}

			$http.post('/dropboxApi/fetchXlsxFile/'+$scope.pid, postObj).
				success(function(data, status){
					console.log("get dropboxApi/fetchXlsxFile");
					if(data.hasOwnProperty('error')){
						$scope.fetch_file_error = data.error;
					} else {
						$scope.fetch_file_error = null;
						parseXlsxArray(data);
						console.log("parse done");
						console.log($scope.xlsx_file);
					}
					$scope.loaded_xlsx_file = true;
					is_loading_xlsx_file = false;
				}).
				error(function(data, status){
					$scope.data = data || "Request failed";
				});

			
		}
	}



	var parseXlsxArray = function(array){
		$scope.xlsx_file = {};
		$scope.sheet_names = [];

		for(var i=0; i<array.length; i++){
			var sheet = array[i];
			if(!$scope.xlsx_file.hasOwnProperty(sheet.name)){
				$scope.xlsx_file[sheet.name] = sheet;
			} else {
				// TODO: on sheet.name, we need to append a variable suffix like copy x
				// otherwise it will not add the duplicate name sheet
			}
			$scope.sheet_names.push(sheet.name);
		}
	}









	$scope.kpiMatching = {};

	// $scope.readCell = function(title){
	// 	// $scope.kpiMatching[title].value = $scope.kpiMatching[title].sheet + " " + $scope.kpiMatching[title].cell;

	// 	var sheet_name = $scope.kpiMatching[title].sheet;
	// 	var row = extractRow($scope.kpiMatching[title].cell);
	// 	var col = extractCol($scope.kpiMatching[title].cell);

	// 	$scope.kpiMatching[title].value = $scope.xlsx_file[sheet_name].data[row][col];
	// }


	$scope.readCell = function(title, datalevel){
		// $scope.kpiMatching[title].value = $scope.kpiMatching[title].sheet + " " + $scope.kpiMatching[title].cell;

		var sheet_name = $scope.kpiMatching[title][datalevel].sheet;
		var row = extractRow($scope.kpiMatching[title][datalevel].cell);
		var col = extractCol($scope.kpiMatching[title][datalevel].cell);

		$scope.kpiMatching[title][datalevel].value = $scope.xlsx_file[sheet_name].data[row][col];
	}


	var calculateDateFrom1900Epoch = function(val){
		var d = new Date(1899, 11, val);
		d.setMinutes(d.getTimezoneOffset());
		return d;
	}

	$scope.readDatalevelCell = function(datalevelobj, format){
		// $scope.kpiMatching[title].value = $scope.kpiMatching[title].sheet + " " + $scope.kpiMatching[title].cell;

		var sheet_name = datalevelobj.sheet;
		var row = extractRow(datalevelobj.cell);
		var col = extractCol(datalevelobj.cell);

		datalevelobj.value = $scope.xlsx_file[sheet_name].data[row][col];

		if(format == 'date1900'){
			datalevelobj.value = calculateDateFrom1900Epoch(datalevelobj.value);
		}
	}



	var extractDigits = function(str){
		var digits = str.replace(/\D/g, ""),
    		letters = str.replace(/[^a-z]/gi, ""); 
    	return digits;
	}

	var extractLetters = function(str){
		var digits = str.replace(/\D/g, ""),
    		letters = str.replace(/[^a-z]/gi, ""); 
    	return letters;
	}

	// eg U3 -> row: 2 (= 3-1) 
	var extractRow = function(cell){
		// separate letters from digits
		var row = parseInt(extractDigits(cell));
		return row - 1;
	}


	var convertStringToAscii = function(str){
		// str may have more than 1 digit... how to convert column AA to number?

		var aux = str.toUpperCase();

		var sum = 0;

		for(var i=0; i<aux.length; i++){
			sum *= 26;
			sum += (aux.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
		}

		return sum;

		/*
			converter tudo para UPPERCASE
			sum = 0;
			para cada letra
				sum *= 26
				sum += letra[i] - 'A' + 1
			return sum;
		*/
	}


	// eg U3 -> col: 20 (U-A = 85 - 65 = 20 in ascii codes)
	var extractCol = function(cell){
		var col = extractLetters(cell);
		col = convertStringToAscii(col);
		return col - 1;
	}





	$scope.curr_filename_regex_hits = 0;


	var testFnameToMatch = function(fname, regex_name){
		// var queryPattern = regex_name.replace(/\*/g, '\\w');
		var queryPattern = regex_name.replace(/\./g, '\\.');
		queryPattern = queryPattern.replace(/\*/g, '.\*');
		queryPattern = queryPattern.replace(/\(/g, '\\(');
		queryPattern = queryPattern.replace(/\)/g, '\\)');
		var queryRegex = new RegExp(queryPattern, 'i');
		if(fname.match(queryRegex)){
			return true;
		} else {
			return false;
		}
	}

	$scope.$watch('curr_filename_regex', function(newValue, oldValue, scope) {

		if(newValue !== $scope.curr_filename){
			$scope.curr_filename_regex_hits = 0;
			$scope.filenames.map(function(fname){
				if(testFnameToMatch(fname, newValue)){
					$scope.curr_filename_regex_hits++;
				}
			})
		} else {
			$scope.curr_filename_regex_hits = 1;
		}
		
	});


	$scope.curr_store = "";


	var findStoreName = function(arr, pointid){
		for(var i=0; i<arr.length; i++){
			if(arr[i].hasOwnProperty('pointid') && arr[i].pointid == pointid){
				return arr[i].name;
			}
		}
		return 'n/a';
	}


	$scope.addStoreMapping = function(){
		console.log("addStoreMapping");

		var pack = {};
		pack["curr_data_source"] = $scope.curr_data_source;
		pack["curr_data_source_title"] = $scope.curr_data_source_title;
		pack["curr_dropbox_folder"] = $scope.curr_dropbox_folder;
		pack["curr_filename_regex"] = $scope.curr_filename_regex;
		pack["curr_filename"] = $scope.curr_filename;
		pack["curr_store_name"] = findStoreName($scope.points_list, $scope.curr_store);
		pack["curr_store"] = parseInt($scope.curr_store); // using parseInt since curr_store will hold the value of the selected option, which is the pointid
		pack["kpiMatching"] = $scope.kpiMatching;
		pack["datalevels"] = $scope.datalevels;
		pack["generaldata"] = $scope.generaldata;
		pack["folder"] = $scope.dropbox.folder;
		pack["client_folder"] = $scope.dropbox.client_folder;

		console.log(pack);

		$http.post('/dropboxMetaData/storeMapping/'+pack["curr_store"], pack).
			success(function(data, status){
				console.log("post dropboxMetaData/storeMapping");

			}).
			error(function(data, status){
				$scope.data = data || "Request failed";
			});

	}


	$scope.datalevels = [{"datalevel": 'coordinator', "name": 'Coordinator'}, 
						 {"datalevel": 'manager', "name": 'Manager 1'}, 
						 {"datalevel": 'manager', "name": 'Manager 2'}, 
						 {"datalevel": 'manager', "name": 'Manager 3'}, 
						 {"datalevel": 'manager', "name": 'Manager 4'}];





	var getKpiCol = function(kpi_title){
		switch(kpi_title){
			case 'Financiamento':
				return "J";
			case 'Número de Vendas':
				return "H";
			case 'Primeiras Consultas':
				return "D";
			case 'Vendas Efectivas':
				return "M";
			case 'VPP':
				return "Q";
			default:
				return "";
		}
	}
	var getDatalevelRow = function(datalevel_name){
		switch(datalevel_name){
			case 'Manager 1':
				return "10";
			case 'Manager 2':
				return "11";
			case 'Manager 3':
				return "12";
			case 'Manager 4':
				return "13";
			case 'Coordinator':
				return "14";
			default:
				return "";
		}
	}
	var getDatalevelSheet = function(datalevel_name){
		switch(datalevel_name){
			case 'Manager 1':
				return "Gestor 1";
			case 'Manager 2':
				return "Gestor 2";
			case 'Manager 3':
				return "Gestor 3";
			case 'Manager 4':
				return "Gestor 4";
			case 'Coordinator':
				return "Coorden";
			default:
				return "";
		}
	}
	var getKpiDatalevelCell = function(kpi_title, datalevel_name){
		return "" + getKpiCol(kpi_title) + getDatalevelRow(datalevel_name);
	}

	$scope.applyDefaultValues = function(){
		console.log("applyDefaultValues");

		for(var i=0; i<$scope.kpis_list.length; i++){
			var kpi = $scope.kpis_list[i];

			if(!$scope.kpiMatching.hasOwnProperty(kpi.title)){
				$scope.kpiMatching[kpi.title] = {};

				for(var j=0; j<$scope.datalevels.length; j++){
					$scope.kpiMatching[kpi.title][$scope.datalevels[j].name] = {};
				}
			}
		}


		for(var i=0; i<$scope.kpis_list.length; i++){
			var kpi = $scope.kpis_list[i];

				for(var j=0; j<$scope.datalevels.length; j++){
					if(kpi.title == 'Orçamentação'){
						$scope.kpiMatching[kpi.title][$scope.datalevels[j].name].cell = 'S11';
						$scope.kpiMatching[kpi.title][$scope.datalevels[j].name].sheet = getDatalevelSheet($scope.datalevels[j].name);
					} else {
						$scope.kpiMatching[kpi.title][$scope.datalevels[j].name].sheet = 'Projeção Vendas Liq';
						$scope.kpiMatching[kpi.title][$scope.datalevels[j].name].cell = getKpiDatalevelCell(kpi.title, $scope.datalevels[j].name);
					}
				}
		}
	}



	$scope.toDeleteDataSource = function(index){
		$scope.toDeleteDataSourceIndex = index;
		$scope.toDelDataSource = $scope.datasources[index];
	}

	$scope.deleteDataSource = function(){

		$http.delete('/api/deletedatasource/'+$scope.pid+'/'+$scope.toDelDataSource.curr_store).
			success(function(data, status) {
				$scope.datasources.splice($scope.toDeleteDataSourceIndex, 1);
			}).
			error(function (data, status) {
				$scope.data = data || "Request failed";
			});

	}

}