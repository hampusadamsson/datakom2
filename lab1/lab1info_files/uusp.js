
var uuspHelpUtil = function(jQuery) {

    /*
     * Selects current help content.
     * 
     * context: { 
     *     helpContentSelector: JQuery selector to specify the top level help content (default: '.helpcontent')
     *     selectedClassArray: Array of class attributes for help elements to select
     *     visibleCssClasses: Array of classes to show
     *     nonVisibleCssClasses: Array of classes to hide
     * }
     */
    var select = function(context) {
	var selectedClassArray = context.selectedClassArray,
	helpContentSelector = context.helpContentSelector || '.helpcontent',
	visibleCssClasses = context.visibleCssClasses,
	nonVisibleCssClasses = context.nonVisibleCssClasses,
	jQHelpContent = jQuery(helpContentSelector),
	jQSelected, selector = "";
	for (var i=0, l=selectedClassArray.length; i<l; i++) {
	    selector += "." + selectedClassArray[i] + (i<l-1 ? ", " : "");
	}
	jQSelected = jQHelpContent.find(selector);
	jQHelpContent.children().hide();
	jQSelected.show();
	showAuthorizedItems(context);
    };

    /*
     * Shows help content based on classes to show/hide.
     * 
     * context: { 
     *     helpContentSelector: JQuery selector to specify the top level help content (default: '.helpcontent')
     *     visibleCssClasses: Array of classes to show
     *     nonVisibleCssClasses: Array of classes to hide
     * }
     */
    var showAuthorizedItems = function(context) {
	var helpContentSelector = context.helpContentSelector || '.helpcontent',
	visibleCssClasses = context.visibleCssClasses,
	nonVisibleCssClasses = context.nonVisibleCssClasses,
	jQHelpContent = jQuery(helpContentSelector);
	for (var i=0, l=nonVisibleCssClasses.length; i<l; i++) {
	    jQHelpContent.find('.' + nonVisibleCssClasses[i]).hide();
	}
	for (i=0, l=visibleCssClasses.length; i<l; i++) {
	    jQHelpContent.find('.' + visibleCssClasses[i]).show();
	}
    };

    return {
	select: select,
	show: showAuthorizedItems
    };
}(jQuery);

var StringUtil = {
    trim : function(str){
	    return str.replace( /^[\s\u00A0]+|[\s\u00A0]+$/g, '' );
    },

    /*
     * Compares its two arguments for order.
	 * Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, 
	 * or greater than the second. Compares the characters in the strings lexicographically 
     * (using the Swedish alphabet order)
     */     
    comparator : function(a,b){
    	var aIsBlank = (a == '');
    	var bIsBlank = (b == '');
        
    	if(bIsBlank && !aIsBlank ) return -1;
        else if(aIsBlank && !bIsBlank) return 1;
        else if(aIsBlank && bIsBlank) return 0;
        
        var result=0;
        var aValue = a.toUpperCase();
        var bValue = b.toUpperCase();
        
        result = StringUtil.compareSv(aValue, bValue);

    	if(result == 0){
            result = StringUtil.compareSv(a, b);
    	}
    	
        return result;
    },
    
    /*
     * Compares its two arguments for order.
	 * Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, 
	 * or greater than the second. Compares the characters in the strings lexicographically 
     * (using the Swedish alphabet order) but if a digit is found at the same position in the strings,
     * the numerical parts are extracted and compared numerically.
     * 
     * For example, this is the order in which these strings would be sorted using this function as comparator:
     * "3", "a", "a9B", "a9b", "a20", "a20b", "a00020b", "a20bcdef", "b", "c4cc", "c5cc", "cc4c"  
     */
    comparatorRespectingNumbers : function(a, b){   	
    	/*
    	 * Recursive help function comparing two strings, a and b. It works in the same way as 
    	 * comparatorRespectingNumbers except that if there is a mix of upper case and 
    	 * lower case, all upper case characters will be considered to come before all lower case characters.
    	 */
    	var compareSvRespectingNumbers = function(a, b){
        	if (a.length === 0 && b.length === 0){
        		return 0;
        	} else if (a.length === 0){
        		return -1;
        	} else if (b.length === 0){
        		return 1;
        	}
        	// test if the first character in a and b are digits
        	if (StringUtil.isInteger(a.charAt(0)) && StringUtil.isInteger(b.charAt(0))){
        		var aNum = StringUtil.getNumericPart(a);
        		var bNum = StringUtil.getNumericPart(b);
        		var aZeros = StringUtil.getNumberOfLeadingZeros(a);
        		var bZeros = StringUtil.getNumberOfLeadingZeros(b);
        		// remove the leading zeros
        		var aNumWithoutZeros = aNum.substring(aZeros);
        		var bNumWithoutZeros = bNum.substring(bZeros);
        		// if either aNum or bNum consists of only zeros, we're done
        		if (aNumWithoutZeros.length === 0 && bNumWithoutZeros.length != 0) {
        			return -1;
        		} else if (aNumWithoutZeros.length != 0 && bNumWithoutZeros.length === 0) {
        			return 1;
        		} 
        		// if the numeric parts (except the leading zeros) are the same 
        		if (aNumWithoutZeros === bNumWithoutZeros){
        			// if equal number of leading zeros, recurse to test the rest of the strings
        			if (aZeros === bZeros) {
        				return compareSvRespectingNumbers(a.substring(aNum.length), 
        					b.substring(bNum.length));
        			} else {
        				// different number of leading zeros - least zeros should come first
        				return (aZeros < bZeros ?  -1 : 1);
        			}
        		} 
        		// the numeric parts are not the same, compare them and return a result
        		var aInt = parseInt(aNumWithoutZeros);
        		var bInt = parseInt(bNumWithoutZeros);
        		return (aInt < bInt ? -1 : 1);
        	}
        	
        	// It's not the case that the first character in a and in b are both numbers
        	// compare the first character in a and b
        	var res = StringUtil.compareValueSv(a.charAt(0)) - StringUtil.compareValueSv(b.charAt(0));
        	if (res === 0){
        		// the first character is the same in a and b, recurse to test the rest of the strings
        		return compareSvRespectingNumbers(a.substring(1), b.substring(1));
        	} else {
        		// the first character in a and b are not the same, return a result
        		return (res < 1 ? -1 : 1);
        	}
        }
    	
        var result = 0;
        var upperA = a.toUpperCase();
        var upperB = b.toUpperCase();
        
        result = compareSvRespectingNumbers(upperA, upperB);
    	if (result === 0){
            result = compareSvRespectingNumbers(a, b);
    	}
    	
        return result;    	
    },
    
    /*
     * Commpares two string according to the swedish alphabet order.
     * If there is a tie when sorting the strings, then the shortest string 
     * comes before the longer string.
     * 
     * This method is needed since comparing strings by default uses 
     * unicode values when comparing the characters and this order 
     * does not comply with the swedish alphabet order.
     * 
     * Returns -1 if string 'a' comes before string 'b', 
     *          1 if string 'a' comes after string 'b',
     *          0 if strings are equal
     */
    compareSv : function(a,b){
    	var result = 0;
        var minLength = a.length < b.length ? a.length : b.length;
        for(var i=0; i<minLength; i++){
        	result = StringUtil.compareValueSv(a.charAt(i)) - StringUtil.compareValueSv(b.charAt(i));
        	if(result != 0){
                break;
        	}
        }
        result = (result == 0) ? a.length - b.length: result;
        return result;
    },    
    
    /*
     * Returns true if the given string consists only of digits, false otherwise.
     * 
     * Examples:
     * These calls will return true: isInteger("7"); isInteger("002398");
     * These calls will return false: isInteger(""); isInteger("7a"); isInteger("7 2"); isInteger("7.2"); 
     */
    isInteger : function(s){
    	var intRegex = /^\d+$/;  // regular expression matching a sequence of one or more digits.
    	return intRegex.test(s);
    }, 
    
    /*
     * Returns the longest possible leading part of the given string that consists of digits.
     * 
     * Examples:
     * getNumericPart("72abc") returns "72"
     * getNumericPart(" 72abc") returns ""
     * getNumericPart("abc72") returns ""
     */
    getNumericPart : function(s){
    	for (var i = 0; i < s.length && StringUtil.isInteger(s.charAt(i)); i++);
    	return s.substring(0, i);
    },
    
    /*
     * Returns the number of leading zeros (zeros at the beginning) in the given string s.
     * 
     * Examples:
     * getNumberOfLeadingZeros("00072") returns 3
     * getNumberOfLeadingZeros("00abc") returns 2
     * getNumberOfLeadingZeros(" 00072") returns 0
     * getNumberOfLeadingZeros("720") returns 0
     * getNumberOfLeadingZeros("abc0000") returns 0
     */
    getNumberOfLeadingZeros : function(s){
    	var i;
    	for (i = 0; i < s.length && s.charAt(i) === "0"; i++);
    	return i;
    },
    
    /*
     * Get a comparable value for a character (first char in a string)
     * according to the swedish alphabet order.
     */
    compareValueSv : function(ch){
        var charValue = ch.charCodeAt(0);
        // é -> e
        if(charValue === 233) return 101;
        // É -> E
        if(charValue === 201) return 69;
        // ä
        if(charValue == 228) return 229;
        // å
        if(charValue == 229) return 228;
        // Å
        if(charValue == 197) return 196;
        // Ä
        if(charValue == 196) return 197;
        return charValue;
    }
};

var ArrayUtil = {
    contains : function(array, obj){
        for(var i=0; i<array.length; i++){
            if(array[i]===obj) return true;
        }
        return false;
    }
};

var ResourceUtil ={
    exists : function(key){
        var keyParts = key.split(".");
        var path = "window.resources";
        for(var i=0; i<keyParts.length; i++){
            path = path+"."+keyParts[i];
            if(!eval(path)){
                return false;
            }
        }
        return true;
    },
    get : function(key){
        if(ResourceUtil.exists(key)){
            return eval("window.resources."+key);
        }
        return key;
    }
};

var ProgressUtil = function(jQuery){
	
    var empty = function(expr) {
        if ((typeof(expr) === "undefined")
          || (expr === undefined)
          || (expr === null)
          || (expr === "")){
        	return true;
        }else if (typeof(expr) === "object") {
        	if(!empty(expr.length) && expr.length > 0){
        		return false;
        	}
        	if(!empty(expr.size) && expr.size() > 0){
        		return false;
        	}
        	for( prop in expr){
        		if(expr.hasOwnProperty(prop)){
        			return false
        		}
        	}
        	return true;
        }
        return false;
    };

	var inputHidden = function(cls, name){
		if(name){
			return "<input type='hidden' class='"+cls+"' name='"+name+"'/>";
		}else{
			return "<input type='hidden' class='"+cls+"'/>";
		}
	};

	var createSelectField = function(name, cssClass, opts, optDisplayValues){
		var selector = "<select class='"+cssClass+"' name='"+name+"'>";
			for(var i in opts){
				var optValue = opts[i]; 
				var optDisplayValue = empty(optDisplayValues) ? optValue : optDisplayValues[i]; 
				selector += "<option value='"+optValue+"'>";
				selector += optDisplayValue;
				selector += "</option>";
			}
			selector += "</select>"
		return selector;
	};
	
	//---------------------------------------------------------------------
	// Creates an inline editor for a progress criteria cell
	// Requirements:
	// - Each section of a progress criteria must be 
	//   annotated with a class: stateText, 
	//   supplementedText, annotationText
	// - Must exist an element, annotated with class
	//   inputNameSuffix, that contains the name suffix
	//   of each input field that will be generated 
	//---------------------------------------------------------------------
	var createCriteriaInlineEditor = function(params){
		var containerObject = params.containerObject;
		var points = params.points;
		var states = params.states;
		var stateValueToText = params.stateValueToText;
		var stateTextToValue = params.stateTextToValue;
		var stateValueToImage = params.stateValueToImage;
		var maxAllowedChars = params.maxTextInputLength;
		var STATE_NONE = 0;
		//-------------------------------------------
		// DOM
		//-------------------------------------------
		var initEditor = function(){
			if(containerObject.find(".progressCriteriaEditor").length > 0){
				return;
			}
			var nameSuffix = "-"+containerObject.find(".inputNameSuffix:first").text();
			containerObject.append("<div class='progressCriteriaEditor'></div>");
			var editorObject = containerObject.find(".progressCriteriaEditor")
				.hide()
				.append(createSelectField("state"+nameSuffix, "stateField", states, stateValueToText));

			if(isCriteriaPointsEnabled()){
				editorObject.append("<br>")
				.append(createSelectField("points"+nameSuffix, "pointsField", points.values))
				.append(points.label);
			}

			if(isSupplementedEnabled()){
				editorObject.append("<br>")
					.append("<input type='checkbox' name='supplemented"+nameSuffix+"' class='supplementedField noSelectAll' title='"+params.supplemented.toolTip+"' value='supplemented'>")
					.append(params.supplemented.label)
			}

			editorObject.append("<br>")
				.append("<textarea name='annotation"+nameSuffix+"' class='annotationField' maxlength='" + maxAllowedChars + "'></textarea>")
				.append("<div class='maxCounter'></div>");

			jQuery.each(["orig-state", "orig-points", "orig-supplemented", "orig-annotation"],
			 	function(idx, prefix){
			 		var cls=prefix+"Value";
			 		var name=prefix+nameSuffix;
					containerObject.append(inputHidden(cls,name));					
			});
			updateEditorFieldsWithTextValues();
			
			if (jQuery(containerObject).hasClass("pointsUpdateDisabled")) {
				jQuery(containerObject).find("select[class='pointsField']").attr("disabled", "disabled");
				var title = jQuery("#disabledInfo").html();
				jQuery(containerObject).find("select[class='pointsField']").attr("title", title);
				var pointsHiddenValue = pointsFieldObject().find('option:selected').val();
				editorObject.append("<input type='hidden' name='points" + nameSuffix + "' value='" + pointsHiddenValue +"'/>");
			}			

			if (jQuery(containerObject).hasClass("statusUpdateDisabled")) {
				jQuery(containerObject).find("select[class='stateField']").attr("disabled", "disabled");
				var title = jQuery("#disabledInfo").html();
				jQuery(containerObject).find("select[class='stateField']").attr("title", title);
				var stateHiddenValue = stateFieldObject().find('option:selected').val();
				editorObject.append("<input type='hidden' name='state" + nameSuffix + "' value='" + stateHiddenValue +"'/>");
			}			
		};
		
		//-------------------------------------------
		// Visual objects
		//-------------------------------------------
		var stateTextObject = function(){ return containerObject.find(".stateText:first");};
		var supplementedTextObject = function(){return containerObject.find(".supplementedText:first");};
		var annotationTextdObject = function(){return containerObject.find(".annotationText:first");};
		var pointsTextObject = function(){return containerObject.find(".pointsText:first");};
		var stateImg = function(){ return containerObject.find(".stateImage:first");};
		
		var stateFossilValueObject        = function(){return containerObject.find(".orig-stateValue:first");};
		var supplementedFossilValueObject = function(){return containerObject.find(".orig-supplementedValue:first");};
		var annotationFossilValueObject   = function(){return containerObject.find(".orig-annotationValue:first");};
		var pointsFossilValueObject       = function(){return containerObject.find(".orig-pointsValue:first");};
	
		var stateFieldObject        = function(){return containerObject.find(".stateField:first");};
		var supplementedFieldObject = function(){return containerObject.find(".supplementedField:first");};
		var supplementedDivObject = function(){return containerObject.find(".supplemented:first");};
		var annotationFieldObject   = function(){return containerObject.find(".annotationField:first");};
		var annotationDivObject   = function(){return containerObject.find(".annotation:first");};
		var pointsFieldObject       = function(){return containerObject.find(".pointsField:first");};
	
		var pointsNodeObject = function(){return containerObject.find(".pointsNode:first");};
		var isSupplementedEnabled   = function(){return (supplementedTextObject().length > 0);};
		var isCriteriaPointsEnabled = function(){return !empty(points.values) && points.values.length > 1;};
		var isAnnotationFieldObjectSet =  annotationFieldObject().val() && annotationFieldObject().val().length > 0 ;
		
		//-------------------------------------------
		// Modifiers
		//-------------------------------------------
		
		var updateTextWithEditorFieldValues=function(){
			var stateValue = stateFieldObject().find('option:selected').val();
			stateTextObject().text(stateValueToText[stateValue]);
			if (stateValue != STATE_NONE) {
				stateImg().attr("src", "/uusp-webapp/themes/uusp/images/" + stateValueToImage[stateValue]);
				stateImg().removeAttr("style");  
			} else {
				stateImg().attr("style", "display:none");
			}
			
			if(isCriteriaPointsEnabled()){
				var pointsValue = pointsFieldObject().find('option:selected').val();
				pointsTextObject().text(pointsValue);
				if(empty(pointsValue)){
					pointsNodeObject().addClass("hide");
				}else{
					pointsNodeObject().removeClass("hide");				
				}
			}
			
			if(isSupplementedEnabled()){
				var supplementedChecked = supplementedFieldObject().prop("checked");
				supplementedTextObject().toggle(supplementedChecked);
				if (supplementedChecked) {
					supplementedDivObject().removeClass("hide");
				}
			}
			
			annotationTextdObject().text(annotationFieldObject().val());
			var annotationFieldSet = annotationFieldObject().val() && annotationFieldObject().val().length > 1;
			if (annotationFieldSet) {
				annotationDivObject().removeClass("hide");
			}
			
			// Check if editor has unsaved data
			var dirty = stateFossilValueObject().val() !== stateValue;
			if(isCriteriaPointsEnabled()){
				dirty = dirty || pointsFossilValueObject().val() !== pointsValue;
			}			
			if(isSupplementedEnabled()){
				dirty = dirty || ((supplementedFieldObject().prop("checked")) !== (supplementedFossilValueObject().val().length > 0));
			}
			dirty = dirty || annotationFossilValueObject().val() !== annotationFieldObject().val(); 
			containerObject.toggleClass("editorHasUnsavedData", dirty);
		};
		
		var updateEditorFieldsWithTextValues=function(){
			var stateValue = stateTextToValue[jQuery.trim(stateTextObject().text())];
			var pointsValue = pointsTextObject().text();
			var annotationValue = annotationTextdObject().text();
			
			// Update field objects
			updateSelectField(stateFieldObject(), stateValue);
			updateSelectField(pointsFieldObject(), pointsValue);
			
			if(isSupplementedEnabled()){
				var supplementedValue = supplementedTextObject().is(":visible")?"supplemented":"";
				supplementedFieldObject().attr("checked", supplementedValue === "supplemented");
			}
			annotationFieldObject().val(annotationValue);
			
			// Update fossil value objects
			stateFossilValueObject().val(stateValue);
			pointsFossilValueObject().val(pointsValue);
			supplementedFossilValueObject().val(supplementedValue);
			annotationFossilValueObject().val(annotationValue);
		};
	
		var updateStateEditorField = function(stateValue){
			stateFieldObject().find("option[value="+stateValue+"]").attr("selected", "selected");
		};
		
		var updateSelectField = function(fieldObject, value){
			if(!empty(value)){
				fieldObject.find("option[value="+value+"]").attr("selected", "selected");
			}
		};
		
		//-------------------------------------------
		// Behaviours
		//-------------------------------------------
		var openEditor = function(event){
			containerObject.find(".progressCriteriaEditor").show(0, function(){
				containerObject.find(".progressCriteriaText").hide(0, function(){
					containerObject.unbind("click");
					containerObject.addClass("openInlineEditor");
					
					var target = jQuery(event.target);
					if(target.is(".annotationText")){
						annotationFieldObject().focus();
					}else if(target.is(".supplementedText")){
						supplementedFieldObject().focus();
					}else{
						stateFieldObject().focus();
					}
					
					jQuery("textarea").maxlength({max: maxAllowedChars,feedbackText: '{c}/{m}',feedbackTarget: jQuery('.maxCounter')});
				});
			});
		};
		var closeEditor = function(){
			containerObject.find(".progressCriteriaText:hidden").show(0, function(){
				containerObject.find(".progressCriteriaEditor").hide(0, function(){
					updateTextWithEditorFieldValues();
					containerObject.bind("click", openEditor);
					containerObject.removeClass("openInlineEditor");
				});
			});
		};
		
		//-------------------------------------------
		// "API"
		//-------------------------------------------
		containerObject.data("open", function(event){
			openEditor(event);
		});
		
		containerObject.data("close", function(){
			closeEditor();
		});
		
		containerObject.data("updateStateByIndex", function(stateValue){
			initEditor();
			updateStateEditorField(stateValue);
			updateTextWithEditorFieldValues();
		});
		//-------------------------------------------
		// Initialize and switch to editor
		//-------------------------------------------
		initEditor();
	};
	
	//---------------------------------------------------------------------
	// Creates an inline text editor.
	// The generated editor contains a text object (the text element containing
	// the text to be edit), a field object (the input-field element) and
	// a fossil object (a hidden field with the original text value).
	// The editor is "opend" (field object and the fossil object are added
	// to the container element) by clicking on the container element.
	// Clicking outside the container element will "close" the editor
	// and uppdate the text object with the value of the field object.
	//   
	// Arguments:
	// - containerObject: a jQuery-object of the element containing the 
	// text-element.
	// Requirements:
	// - The element containing the text must be annotated (through the 
	//   class attribute) with "textObject" and "fieldName<name>", where
	//   <name> is the name the input field generated.
	//
	//---------------------------------------------------------------------
	var createTextInlineEditor = function(containerObject,params){
		//-------------------------------------------
		// DOM
		//-------------------------------------------
		var initEditor = function(){
			if(containerObject.find(".progressAnnotationEditor").length > 0){
				return;
			}
			containerObject.append("<div class='progressAnnotationEditor'></div>");
			containerObject.find(".progressAnnotationEditor:first")
				.hide()
				.append(inputHidden("orig-annotationValue"))
				.append("<textarea class='textInlineEditor' maxlength='" + params.maxTextInputLength + "'></textarea>")
				.append("<div class='maxCounter'></div>");
		
	
			jQuery(textObject().attr("class").split(" ")).each(function(idx, className){
				if(!className.indexOf("fieldName")){
					fieldName = className.substr(9, className.length);
					fieldObject().attr("name", fieldName);
				}
			});
			updateEditorFieldWithTextValue();
	    };
	    
		//-------------------------------------------
		// Visual objects
		//-------------------------------------------
		var textObject = function(){return containerObject.find(".textObject:first");};
		var fieldObject = function(){return containerObject.find("textarea:first");};
		var fossilObject = function(){return containerObject.find(".orig-annotationValue:first");};
		
		//-------------------------------------------
		// Modifiers
		//-------------------------------------------
		var updateTextWithEditorFieldValue=function(){
			textObject().text(jQuery.trim(fieldObject().val()));
			containerObject.toggleClass("editorHasUnsavedData", textObject().text() !== fossilObject().val());
		};
	
		var updateEditorFieldWithTextValue=function(){
			var textValue = jQuery.trim(textObject().text());
			fieldObject().val(textValue);
			fossilObject().val(textValue);
		};
	
		//-------------------------------------------
		// Behaviours
		//-------------------------------------------
		var openEditor = function(event){
			containerObject.find(".progressAnnotationEditor:first").show(0, function(){
				containerObject.find(".progressAnnotationText:first").hide(0, function(){
					containerObject.unbind("click");
					containerObject.addClass("openInlineEditor");
					fieldObject().focus();
					
					jQuery("textarea").maxlength({max: params.maxTextInputLength,feedbackText: '{c}/{m}',feedbackTarget: jQuery('.maxCounter')});
				});
			});
		};
	
		var closeEditor = function(){
			containerObject.find(".progressAnnotationText:first").show(0, function(){
				containerObject.find(".progressAnnotationEditor:first").hide(0, function(){
					updateTextWithEditorFieldValue();
					containerObject.bind("click", openEditor);
					containerObject.removeClass("openInlineEditor");
				});
			});
		};
		
		//-------------------------------------------
		// "API"
		//-------------------------------------------
		containerObject.data("close", function(){
			closeEditor();
		});
		containerObject.data("open", function(event){
			openEditor(event);
		});
	
		//-------------------------------------------
		// Initialize and switch to editor
		//-------------------------------------------
		initEditor();
	};
	
	var initProgressMatrixView = function(params){
		//---------------------------------------
		// Event handlers
		//---------------------------------------

		jQuery(window).bind('beforeunload', function(event) {
			if(jQuery(".editorHasUnsavedData").length > 0){
				event.returnValue = params.unloadMsg // IE fix
				return unloadMsg;	
			}
		});				
		
		jQuery("#progressForm").submit(function(){
			jQuery(window).unbind('beforeunload');
		});

 		jQuery(document).click(function(event){
			var target = event.target;
			jQuery(".openInlineEditor").each(function(idx, editorElem){
				if(editorElem !== target
					&& !jQuery.contains(editorElem, target)){
					jQuery(editorElem).data("close")();
				}
			});
		});
				
		jQuery(".progressCriteriaInlineEditable").on("click",function(event){
			var self = jQuery(this);
			if(self.is(".openInlineEditor")){
				return;
			}
			createCriteriaInlineEditor(jQuery.extend({containerObject:self}, params));
			self.data("open")(event);
		});
		
		jQuery(".textFieldInlineEditable").on("click", function(event){
			var self = jQuery(this);
			if(self.is(".openInlineEditor")){
				return;
			}
			createTextInlineEditor(self,params);
			self.data("open")(event);
		});
		
		jQuery(".inlineEditorOpener").on("click", function(event){
			event.preventDefault();
		});

        jQuery("#updateSelectedCriterion button").on("click", function(){
            var templateId=jQuery("#updateSelectedCriterion select:first").val();
            var stateIdx=jQuery("#updateSelectedCriterion select:last").attr("selectedIndex");
            jQuery("#progressTable input:checkbox:checked").each(function(){
                jQuery("#progressTable .template-"+templateId+"-"+this.value)
                	.filter(".progressCriteriaInlineEditable")
                	.each(function(idx, criteriaElem){
                		var criteriaObject = jQuery(criteriaElem);
						createCriteriaInlineEditor(jQuery.extend({containerObject:criteriaObject}, params));
						criteriaObject.data("updateStateByIndex")(stateIdx);
                	});
            });
        });
		
	};
	
	return {
		initProgressMatrixView : initProgressMatrixView,
		createCriteriaInlineEditor: createCriteriaInlineEditor
	};
}(jQuery);



(function(jQuery){

    var $ = jQuery;

    /*
     * Clickable
     * Provides the visual features of a clickable item.
     * Requires: CSS-classes 'clickable' and 'hover'
     */
	jQuery.fn.clickable = function(){
    	jQuery(this).addClass('clickable').hover(function() {
                jQuery(this).addClass('hover');
            }, function() {
                jQuery(this).removeClass('hover');
            });
    	return jQuery(this);
    };

    /*
     * Striped
     * Provides the 'stripe' event for tables.
     * Requires: CSS-classes 'even' and 'odd'
     */
    jQuery.fn.striped = function(){
       var $table = jQuery(this);
       $table.bind('stripe', function(){
          $table.find('tbody tr:visible:odd').removeClass('even').addClass('odd');
          $table.find('tbody tr:visible:even').removeClass('odd').addClass('even');
       });
       return jQuery(this);
    };

    /*
     * Filterabel
     * Provides filtering capability to a table.
     * Only rows where the filtering column contains the selected keyword will be visible. 
     * Contents of columns where column header contains class 'filter-column' are made available   
     * for filtering through a filter selector. 
     * Options: 
     * containerId (optional) - place filter selector in this container, 
     * if no containerid is provided the filter selector is placed before the table.
     * multipleSelect (optional) - 
     *     enable - allow the selection of multiple keywords     
     *     size - how many lines should be visible in the filter selector 
     * Requires: If no container id is provided the filter selector is placed before
     * the table inside a label-element, the associated text should be made available 
     * through the ResourceUtil using the key 'filterable.select'.
     */
    jQuery.fn.filterable = function(options){
       var $table = jQuery(this);
       var defaults = {
           containerId : null,
           multipleSelect:{
    	       enabled:false,
               size:4
           }
       };
       var opts = jQuery.extend(true,{}, defaults, options);
       
       $table.find('th').each(function (column) {
         if (jQuery(this).is('.filter-column')) {
            var keywords = {};
            $table.find('tbody tr td')
                  .filter(':nth-child(' + (column + 1) + ')')
                  .each(function() {
                var keyword = StringUtil.trim(jQuery(this).text());
                keywords[keyword] = keyword;
            });

            var filters = new Array();
            jQuery.each(keywords, function(index, keyword) {
            	filters.push(keyword);
            });
            if(filters.length <= 1){
            	jQuery('#'+opts.containerId).hide();
            	return jQuery(this);
            }
            filters.sort(StringUtil.comparatorRespectingNumbers);

            var filterSelector = jQuery('<select></select>').addClass('filters');
            if(opts.multipleSelect.enabled){
               filterSelector.attr('multiple', 'true')
                             .attr('size', opts.multipleSelect.size)
                             .attr('vertical-align', 'top');
            }
            jQuery('<option></option>').text(ResourceUtil.get("filterable.selectAllOption", "All"))
                                       .attr('value', ' ')
                                       .attr('selected', 'true')
                                       .appendTo(filterSelector);
            
            jQuery.each(filters, function(index, filter) {
               jQuery('<option></option>')
               	.text(!filter ? ResourceUtil.get("filterable.selectEmpty", "") : filter)
               	.attr('value',filter)
                .appendTo(filterSelector);
            });
            
            filterSelector.change(function(){
                jQuery('body').css('cursor', 'progress');
                var $filters = jQuery(this);
                var selectedValues = $filters.val();
                $table.find('tbody tr').each(function() {
	                var thisValue = StringUtil.trim(jQuery('td', this).filter(':nth-child(' + (column + 1) + ')').text());
	                if(selectedValues == null
                        || selectedValues === thisValue
                        || selectedValues == ' '
		                || ((typeof(selectedValues) == 'object')
			                &&(selectedValues.length == 0
                                || ArrayUtil.contains(selectedValues, ' ')
		                        || ArrayUtil.contains(selectedValues, thisValue)))) {
                        jQuery(this).show().removeClass('filtered');
                    }else if (jQuery('th',this).length == 0) {
                        jQuery(this).hide().addClass('filtered');
                    }
                });
                $table.trigger('sort');
                jQuery('body').css('cursor', 'auto');
            });

            if(opts.containerId != null && jQuery('#'+opts.containerId).length > 0){
            	jQuery('#'+opts.containerId).append(filterSelector);
            }else{
                jQuery('<label/>').text(ResourceUtil.get('filterable.select'))
                                  .append(filterSelector)
                                  .insertBefore($table);
            }
         };
       });
       return jQuery(this);
    };

    /*
     * Paginated
     * Provides a paginated view of table content
     */
    jQuery.fn.paginated = function(){
       var currentPage = 0;
       var numPerPage = 10;
      
       var $table = jQuery(this);
      
       $table.bind('repaginate', function() {
         $table.find('tbody tr').show().end()
           .find('tbody tr:lt('+currentPage * numPerPage+')')
             .hide()
           .end()
           .find('tbody tr:gt('+((currentPage + 1) * numPerPage - 1) + ')' )
           .hide()
           .end();
       });
    
       var numRows = $table.find('tbody tr').length;
       var numPages = Math.ceil(numRows / numPerPage);
    
       var $pager = jQuery('<div class="pager"></div>');
       for (var page = 0; page < numPages; page++) {
         jQuery('<span class="page-number">' + (page + 1) + '</span>')
          .bind('click', {'newPage': page}, function(event) {
            currentPage = event.data['newPage'];
            $table.trigger('repaginate');
            jQuery(this).addClass('active').siblings().removeClass('active');
          })
          .appendTo($pager).addClass('clickable');
       }
       $pager.find('span.page-number:first').addClass('active');
       $pager.insertBefore($table);
       $table.trigger('repaginate');
       return jQuery(this);
    };

    /*
     * Extendable
     * Provides the capability to add empty columns to a table.
     * The number of new columns is read from an input-field (added before the table)
     */
    jQuery.fn.extendable = function(){
       var $table = jQuery(this);
       var input = jQuery('<input/>')
           .attr('type', 'text')
           .attr('size', '2')
           .attr('maxLength', '2')
           .bind('keyup', function(){
          var inputValue = StringUtil.trim(jQuery(this).val());
          if(isFinite(inputValue)){
	     var expandingLength=parseInt(inputValue);
             jQuery('.extended').remove();
             for(var i=0; i<expandingLength; i++){
	        jQuery('<th/>')
                   .addClass('extended')
	           .append(jQuery('<textarea/>')
                      .attr('rows','2')
		      .attr('cols', '2'))
                   .appendTo($table.find('thead tr'));
	       jQuery('<td/>')
                   .addClass('extended')
                   .appendTo($table.find('tbody tr'));
             }
          }
     
       });
       jQuery('<div/>')
          .addClass('extenderInput')
          .append(jQuery('<label/>')
          .text(ResourceUtil.get('extendable.columnsInput'))
          .append(input))
          .insertBefore($table);

       return jQuery(this);
    };

    /*
     * Sortable
     * Provides the capability of sorting a table by the content in selected columns.
     * A column is made sortable by applying one the following classes to the TH-tag:
     * sort-alpha - sorts all rows by the lexical content of this column 
     * sort-alpha-visible - sorts all visible rows by the lexical content of this column
     * sort-numeric - sort all rows by the numerical content of this column
     * sort-date - sort all rows by the date content of this column
     * Usage: Add class "sortable" to the TABLE-tag and sort criteria class
     * to TH-tags. 
     * Note: Use THEAD- and TBODY-tags to prevent the header to be sorted
     * as a regular row
     * Requires: this plugin uses the clickable-plugin 
     */
    jQuery.fn.sortable = function(){
       var $table = jQuery(this);
       $table.toggleDirection=true;
       $table.newDirection = 1;
       $table.lastSortColumn = 0;
    
       $table.find('th').each(function(column) {
         var findSortKey;
         if (jQuery(this).is('.sort-alpha')) {
             findSortKey = function($cell) {
                 return StringUtil.trim($cell.find('.sort-key').text().toUpperCase()
                     +' ' 
                     + StringUtil.trim($cell.text().toUpperCase()));
             };
          }else if (jQuery(this).is('.sort-alpha-visible')) {
             findSortKey = function($cell) {
                 return StringUtil.trim($cell.find('.sort-key:visible').text().toUpperCase() 
                     +' '  
                     + $cell.find(':visible').text().toUpperCase());
             };
          }else if (jQuery(this).is('.sort-numeric')) {
             findSortKey = function($cell) {
                 var key = parseFloat($cell.text().replace(/^[^d.]*/, ''));
                 return isNaN(key) ? 0 : key;
             };
          }else if (jQuery(this).is('.sort-date')) {
             findSortKey = function($cell) {
                 return Date.parse('1 ' + $cell.text());
             };
          }
           if (findSortKey) {
        	 jQuery(this).clickable()
             .click(function() {
               jQuery('body').css('cursor', 'progress');
               $table.lastSortColumn = column;
               if($table.toggleDirection){
                  $table.newDirection = 1;
                  if (jQuery(this).is('.sorted-asc')) {
                     $table.newDirection = -1;
                  }
                  $table.find('th').removeClass('sorted-asc');
                  $table.find('th').removeClass('sorted-desc');
                  var $sortHead = $table.find('th').filter(':nth-child('+(column + 1) + ')');
                  if ($table.newDirection == 1) {
                     $sortHead.addClass('sorted-asc');
                  } else {
                     $sortHead.addClass('sorted-desc');
                  }
               }
               $table.find('td').removeClass('sorted')
               .filter(':nth-child(' + (column + 1) + ')').addClass('sorted');
   
   
               var rows = $table.find("tbody > tr").get();
    
               jQuery.each(rows, function(index, row) {
                 row.sortKey = findSortKey(jQuery(row).children('td').eq(column));
               });

               rows.sort(function(a, b) {
                 if(b.sortKey == '') return -1;
                 if(a.sortKey == '') return 1;
                 return StringUtil.comparator(a.sortKey, b.sortKey) * $table.newDirection;
               });
               jQuery.each(rows, function(index, row) {
                 $table.children('tbody').append(row);
               });
   
               $table.trigger('stripe');
               $table.trigger('repaginate');
               jQuery('body').css('cursor', 'auto');
              })};
           });
   
          $table.bind('sort', function(){       
              $table.toggleDirection=false;
              $table.find('th').eq($table.lastSortColumn).trigger('click');
              $table.toggleDirection=true;
          });
          $table.find('th').eq($table.lastSortColumn).trigger('click');
          return jQuery(this);
    };
	
	/*
	Copyright (c) 2010 Ca-Phun Ung, http://yelotofu.com/

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/
	jQuery.fn.inlineEdit = function(options) {
        
            return jQuery.each(this, function() {
        
                // define self container
                var self = jQuery(this);
        
                // create a value property to keep track of current value
                //self.value = self.text();
				self.data("value", self.text());
        		/*if(self.data("value") == null || self.data("value") == "") {
					self.data("value", "&nbsp;&nbsp;&nbsp;&nbsp;");
				}*/
				
				// save the background image
				self.data("savedBackgroundImage", self.css("background-image"));
				
                // bind the click event to the current element, in this example it's span.editable
                self.bind('click', function() {

                    self
                        // populate current element with an input element and add the current value to it
                        .html('<input type="text" value="'+ self.data("value") +'">')
                        // remove the background image
                        .css("background-image", "none")
                        // select this newly created input element
                        .find('input')
                            // bind the blur event and make it save back the value to the original span area
                            // there by replacing our dynamically generated input element
                            .bind('blur', function(event) {
                              /*  self.value = jQuery(this).val();
                                self.text(self.value);*/
								self.data("value", jQuery(this).val());
								self.text(self.data("value")); 
								// if there is no text, put the background image back
								if (self.data("value").trim() === "") {
									self.css("background-image", self.data("savedBackgroundImage"));
								}
                            })
                            // give the newly created input element focus
                            .focus();
                            
                });
            });
        };
})(jQuery);

jQuery(document).ready(function() {
  jQuery('table.striped').each(function() {
     jQuery(this).striped();
  });
  jQuery('table.filterable').each(function() {
     jQuery(this).filterable();
  });
  jQuery('table.paginated').each(function() {
     jQuery(this).paginated();
  });
  jQuery('table.extendable').each(function(){
     jQuery(this).extendable();
  });
  jQuery('table.sortable').each(function() {
     jQuery(this).sortable();
  });
});
