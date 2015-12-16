/**
* Takes a string as input and tries to interpret it as a date in one of the following formats:
* "yy-MM-dd", "yyyy-MM-dd", "yyMMdd", "yyyyMMdd"
* If string is a valid date it is transformed into a date string in the form yyyy-MM-dd.
* Otherwise the string is returned untransformed
* Input string can have a time too if separated from the date by a space. The time portion
* of the string remains unchanged.
*/
var transformDate = function(dateAndTime) {
	var parts = dateAndTime.split(" ");
	var dateStr = parts[0];
	var timePart = "";
	if (parts.length > 1) {
		timePart = " " + parts[1];
	}
    var format1 = /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/;
	var format2 = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
	var format3 = /^[0-9]{6}$/;
	var format4 = /^[0-9]{8}$/;
	var date = null;
	if (dateStr.match(format1)) {
		date = new Date("20"+dateStr.substring(0,2), (dateStr.substring(3,5)-1), dateStr.substring(6));
	} else if (dateStr.match(format2)) {
		date = new Date(dateStr.substring(0,4), (dateStr.substring(5,7)-1), dateStr.substring(8));
	} else if (dateStr.match(format3)) {
		date = new Date("20"+dateStr.substring(0,2), (dateStr.substring(2,4)-1), dateStr.substr(4));
	} else if (dateStr.match(format4)) {
		date = new Date(dateStr.substring(0,4), (dateStr.substring(4,6)-1), dateStr.substring(6));
	}
	if (date !== null) {
		var dateStr = date.getFullYear() + "-" 
		var month = date.getMonth()+1;
		if (month<10) 
			dateStr += "0" + month + "-";
		else
			dateStr += month + "-";
		if (date.getDate()<10) 
			dateStr += "0" + date.getDate();
		else
			dateStr += date.getDate();
		return dateStr + timePart;
	}
	else {
		return dateAndTime;
	}		
}

var datepickerConfig = { 
	dateFormat: 'yy-mm-dd',
	timeFormat: 'HH:mm',
    alwaysSetTime: false,
    showTime: false,
	firstDay: 1, 
	showOn: 'button',
	buttonImage: '/uusp-webapp/images/calendar.gif',
	buttonImageOnly: true,
	constrainInput: false,
	showWeek: true,
	beforeShow: function(input, inst) {
		var parts = input.value.split(" ");
		if (parts.length>1) {
			inst.timeInput = parts[1];
		}
		else {
			inst.timeInput = undefined;
		}
		jQuery(input).attr("disabled", "disabled");
	},
	onClose: function(dateText, inst) {
		if (inst.timeInput !== undefined && dateText.indexOf(" ")==-1) {
			this.value=dateText + " " + inst.timeInput;
		}
		jQuery(this).removeAttr("disabled");
	}
};


jQuery(document).ready(function() {
    var jQuery = uusp.jQuery;
	jQuery(".uuspDate, .uuspDateNoTime").change(function() {
		var date = transformDate(jQuery(this).val());
		jQuery(this).val(date);
	});
	
	jQuery(".uuspDate:enabled").datetimepicker(datepickerConfig);
	jQuery(".uuspDateNoTime:enabled").datepicker(datepickerConfig);
});
