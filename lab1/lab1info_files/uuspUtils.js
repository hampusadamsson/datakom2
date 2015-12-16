// Utility scripts for the portal

function hide(elem){
	elem.style.display='none';
}
function show(elem){
	elem.style.display='inline';
}

function toggleDisplay(elem){
    elem.style.display=(elem.style.display=='none')?'block':'none';
}

// Returns date in form 2007/12/03 13:14:15
function shortDate()
{
	var today = new Date()
	var year = today.getFullYear()
	var month = paddWithLeadingZero(today.getMonth() + 1)
	var date = paddWithLeadingZero(today.getDate())
	var h = paddWithLeadingZero(today.getHours())	
	var m = paddWithLeadingZero(today.getMinutes())
	var s = paddWithLeadingZero(today.getSeconds())
	document.write(year + "/" + month+ "/" + date + " " + h + ":" + m + ":" + s)		
}

function paddWithLeadingZero(integer) 
{
	if (integer < 10) {
	   return "0" + integer
	} else {
	   return integer
	}
}
// OBS: Be careful to use this method in the future, for unknown reasons does not work always on IE8.
function selectAll(id) 
{
	form = document.getElementById(id)
	for (i = 0; i < form.elements.length; i++) {
		elem = form.elements[i]
		if (elem.type == "checkbox" && (elem.className.indexOf('noSelectAll') === -1)) {
			elem.checked = true
		}
	}
	fireEvent(form, "change");
}

function unselectAll(id) 
{     
	form = document.getElementById(id)
	for (i = 0; i < form.elements.length; i++) {
		elem = form.elements[i]
		if (elem.type == "checkbox" && (elem.className.indexOf('noSelectAll') === -1)) {
			elem.checked = false
		}
	}
	fireEvent(form, "change");
}	

function invertSelection(id)
{
	form = document.getElementById(id)
	for (i = 0; i < form.elements.length; i++) {
		elem = form.elements[i]
		if (elem.type == "checkbox" && (elem.className.indexOf('noSelectAll') === -1)) {
			if (elem.checked)
				elem.checked = false
			else 
				elem.checked = true		
		}
	}       
	fireEvent(form, "change");
}


function displayFormElementsOfClass(formId, className, value) {
	form = document.getElementById(formId);
	for (i=0; i < form.elements.length; i++) {
		elem = form.elements[i];
		if (elem.className==className)
			elem.style.display=value;
	}
}

function fireEvent(element,event){
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return element.fireEvent('on'+event,evt)
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}
/**
 * Copy the value from a text-element to a set of selected target text-elements.
 * To use this you must have a checkbox and two text-elements. 
 * The text-elements must both have an identifier:
 * The target text-element must have an id on the form: targetIdPrefixXX
 * The source text-element can have an arbitrary identifier (sourceId)
 * The checkbox must have a name (checkboxName) and have
 * a value that constitute the suffix of the target text-element (XX)
 */
function copyTextToSelectedElem(checkboxName, sourceId, targetIdPrefix, errMsg){
    checkboxes = document.getElementsByName(checkboxName);
    newValue = document.getElementById(sourceId).value;
    checkboxIsSelected = checkboxSelected(checkboxName);
    if(checkboxIsSelected){
	    for (i = 0; i < checkboxes.length; i++) {
	        if (checkboxes[i].type == "checkbox" && checkboxes[i].checked) {
	            document.getElementById(targetIdPrefix+checkboxes[i].value).value = newValue;
	        }
	    }
    }else if(errMsg){
    	alert(errMsg);
    }
}

/**
 * Copy the value from a select-element to a set of selected target select-elements.
 * To use this you must have a checkbox and two select-elements. 
 * The select-elements must both have an identifier:
 * The target select-element must have an id on the form: targetIdPrefixXX
 * The source select-element can have an arbitrary identifier (sourceId)
 * The checkbox must have a name (checkboxName) and have
 * a value that constitute the suffix of the targer select-element (XX)
 */
function copySelectToSelectedElem(checkboxName, sourceId, targetIdPrefix, errMsg){
    checkboxes = document.getElementsByName(checkboxName);
    newIndex = document.getElementById(sourceId).selectedIndex;
    checkboxIsSelected = checkboxSelected(checkboxName);
    if(checkboxIsSelected){
	    for (i = 0; i < checkboxes.length; i++) {
	        if (checkboxes[i].type == "checkbox" && checkboxes[i].checked) {
	            document.getElementById(targetIdPrefix+checkboxes[i].value).selectedIndex = newIndex;
	        }
	    }    
    }else if(errMsg){
    	alert(errMsg);
    }
}      
 

function checkboxSelected(name){
    checkboxes = document.getElementsByName(name);
    for (i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == "checkbox" && checkboxes[i].checked) {
            return true;
        }
    }
    return false;
}
/** -----------------------------------
  BeforeUnload event handler, prevents the page from loosing unsaved data when navigating to antoher page before data is saved.
  Howto use: 
    - Call setBunload(true) to prevent the page to be unloaded if unsaved data exists (done once for each page).
    - Call newInput() to indicate that unsaved data exists, typically by 
      a change event handler (same as setting unSavedData=true).
    - Set unSavedData=false to indicate that data has been saved and that 
      the page does not need to be guarded, typically by a submit event handler (if submit button is used) or
      by a click event handler (if form.submit() is issued programmatically)
        
---------------------------------------*/
var unSavedData = false;
var unloadMsg = "Du har \u00e4ndringar som \u00e4nnu inte har sparats!\n" +
                 "V\u00e4lj Avbryt och sedan Spara om du vill spara dina \u00e4ndringar.";

function doBeforeUnload() {
   if(!unSavedData) return; // Let the page unload

   if(window.event){
      window.event.returnValue = unloadMsg; // IE
   }else{
      return unloadMsg; // FX
   }
}

function setBunload(on, msg){
	unloadMsg=msg;
    if(on){
        if(window.body){
            window.body.onbeforeunload = doBeforeUnload; // IE
        }else{
            window.onbeforeunload = doBeforeUnload; // FX 
        }
        window.onclick = doBeforeUnload;
    }    
}

function newInput() {
    unSavedData = true;
}

function safeUnload(){
    unSavedData = false;
}
    
//----------------------------------------

function getHTTPObject() { 
	if (typeof XMLHttpRequest != 'undefined') { 
		return new XMLHttpRequest(); 
	} 
	try { 
		return new ActiveXObject("Msxml2.XMLHTTP"); 
	} catch (e) { 
		try { 
			return new ActiveXObject("Microsoft.XMLHTTP"); } 
		catch (e) {} 
	} return false; 
}


function keepAlive(timeout, url) {
	var http = getHTTPObject(); 
	http.open("GET", url, true); 
	http.send(null);
	setKeepAlive(timeout, url); 
}


function setKeepAlive(timeout, url) {
	setTimeout("keepAlive("+timeout+", '"+url+"')", timeout*1000);	
}


/*
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};


/**
* Takes a string as input and tries to interpret it as a date in one of the following formats:
* "yy-MM-dd", "yyyy-MM-dd", "yyMMdd", "yyyyMMdd" 
* If string is a valid date. A date object is returned. Otherwise null is returned.
*/
function parseDate(dateStr) {
    var format1 = /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/;
	var format2 = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
	var format3 = /^[0-9]{6}$/;
	var format4 = /^[0-9]{8}$/;
	if (dateStr.match(format1)) {
		return new Date("20"+dateStr.substring(0,2), (dateStr.substring(3,5)-1), dateStr.substring(6));
	} else if (dateStr.match(format2)) {
			return new Date(dateStr.substring(0,4), (dateStr.substring(5,7)-1), dateStr.substring(8));
	} else if (dateStr.match(format3)) {
		return new Date("20"+dateStr.substring(0,2), (dateStr.substring(2,4)-1), dateStr.substr(4));
	} else if (dateStr.match(format4)) {
		return new Date(dateStr.substring(0,4), (dateStr.substring(4,6)-1), dateStr.substring(6));
	} else
		return null;
}

/**
* Takes a date object as input and return a string on the form
* "yyyy-MM-dd" 
*/
function formatDate(date) {
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
	return dateStr;
}

/**
 * Sets a cookie
 */
function setCookie(name,value,date,host) {
	if (date == -1) {
		var expires = "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
	} else if (typeof date === 'number') {
		var d = new Date();
		d.setTime(+d + date * 864e+5);
		var expires = "; expires="+d.toGMTString();
	} else if (date) {
		var expires = "; expires="+date.toGMTString();
	}
	
	if (host) {
		var domain = "; domain="+host;
	} else {
		var domain = "";
	}
	
	document.cookie = name+"="+value+expires+"; path=/" + domain;
}

/**
 * Gets a cookie
 */
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)===' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

/**
 * Deletes a cookie
 */
function deleteCookie(name,host) {
	if (getCookie(name)) {
		setCookie(name,"",-1,host);
	}
}

/**
 * Will convert bytes into one of the following 
 * 'Bytes', 'KB', 'MB', 'GB', 'TB' based on size of input. 
 * Will also append metric unit to end of string. 
 */
function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Byte';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
