


exports.getWeekDay = function(d, offsetDays) {
	d = new Date(d);
	var day = d.getDay(),
		diff = d.getDate() - offsetDays; // go back the number of days provided
	return new Date(d.setDate(diff));
}


exports.getMonday = function(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}


exports.getMondayOffset = function(d, offsetDays) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
      // diff = d.getDate() - day + (day == 0 ? -6:1) - offsetDays; // adjust when day is sunday
  return new Date(d.setDate(diff-offsetDays)); // may cause error, maybe use the commented line above
}


exports.getFirstMonthDayOffset = function(d, offsetMonths){
	d = new Date(d.setMonth( d.getMonth() - offsetMonths ))
	return new Date(d.setDate(1));
}

exports.getTodayMonthOffset = function(d, offsetMonths){
	return new Date(d.setMonth( d.getMonth() - offsetMonths ));
}

exports.getFirstMonthDay = function(d){
	return new Date(d.setDate(1));
}

exports.getFirstYearMonth = function(d){
	var d_aux = new Date(d.setDate(1));
	return new Date(d_aux.setMonth(0));
}


exports.getFirstYearDayOffset = function(d, offsetYears){
	d = new Date(d.setFullYear( d.getFullYear() - offsetYears ));
	d = new Date(d.setMonth(0));
	return new Date(d.setDate(1));
}


exports.getTodayYearOffset = function(d, offsetYears){
	return new Date(d.setFullYear( d.getFullYear() - offsetYears ));
}


exports.getYesterday = function(d){
	return new Date(d.setDate( d.getDate() - 1 ));
}




var invertDateStrToISO = function(str, delim){
	var dd = str.substr(0, 2);
	var mm = str.substr(3, 2);
	var yyyy = str.substr(6);

	return yyyy + delim + mm + delim + dd;
}


exports.getYesterdayFromString = function(str){
	str = invertDateStrToISO(str, '/');
	var d = new Date(str);
	return new Date(d.setDate( d.getDate() - 1 ));
}


exports.getDayFromString = function(str){
	str = invertDateStrToISO(str, '/');
	var d = new Date(str);
	return d.getDate();
}





exports.enforceDateStringYMD = function(str){
	if(str.charAt(2) == '-' || str.charAt(2) == '/'){
		return invertDateStrToISO(str, '-');
	}
	return str;
}



exports.getDateString = function(date, withDelimiters, daymonthyearorder){
	var today = new Date(date);

	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	}
	if(mm<10) {
	    mm='0'+mm
	} 

	var delim = "";

	if(withDelimiters){
		delim = "-"
	}

	if(daymonthyearorder == true){
		return dd + delim + mm + delim + yyyy;
	} else {
		return yyyy + delim + mm + delim + dd;
	}
}
