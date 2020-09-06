$.fn.formRepeater = function( options ) {
    
    var opts = $.extend( {}, $.fn.formRepeater.defaults, options );
    var repeater = this;
    
    $( document ).ready(function() {
        onInit();
    });

    $( document ).on("click", "[add_repeater_element]", function() {
        addRepeaterElement($(this));
        checkControlsVisibility($(this));
        reindexRepeater(repeater);
    });

    $( document ).on("click", "[remove_repeater_element]", function() {
        let removeRepeaterElement = this;
        repeater.find(removeRepeaterElement).closest(".repeater_element").slideUp( "slow", function() {
            repeater.find(removeRepeaterElement).closest(".repeater_element").remove();
            repeater.find('[add_repeater_element]').each(function (index) {
                checkControlsVisibility($(this));
            });
            reindexRepeater(repeater);
        });
    });

    var reindexRepeater = function (repeater) {
        let repeaterInputIndex = 0;
        let repeaterName = $(repeater).attr("repeater_name");
        let repeaterElement = $(repeater).children(".repeater_elements").children(".repeater_element");
        repeaterElement.each(function (index) {
            let repeaterElementInputs = $(this).children(".col-lg").find(opts.inputTags);
            let repeaterElementName = $(this).attr("repeater_el_name");
            repeaterElementInputs.each(function (index) {
                let inputName = getInputName($(this), repeaterName, repeaterElementName, repeaterInputIndex);
                updateInputName($(this), inputName);
            });
            indexInnerRepeaterInputs(repeaterName, $(this), repeaterInputIndex);
            repeaterInputIndex++;
        });

        function getInputName(input, repeaterName, repeaterElementName, repeaterInputIndex)
        {
            let inputName = input.attr("name");
            if (inputName.indexOf("]") > -1) {
                let start = inputName.lastIndexOf("[");
                let end = inputName.lastIndexOf("]");
                inputName = inputName.substring(start + 1, end);
            }
            inputName = repeaterName + "[" + repeaterInputIndex + "][" + repeaterElementName + "][" + inputName + "]";
            return inputName;
        }
    };

    /**
    
    Update input name
    
    */
    var updateInputName = function (input, name)
    {
        $(input).attr("name", name);
    };

    var indexInnerRepeaterInputs = function (parentRepeaterName, repeaterElement, parentRepeaterInputIndex, innerLayers = 0) {
        let repeater = repeaterElement.children(".col-lg").children(".repeater");
        let maxInnerLayers = 10;
        let innerRepeaterInputIndex = 0;
        let repeaterName = $(repeater).attr("repeater_name");
        if (repeater.length > 0 && innerLayers < maxInnerLayers) {
            let repeaterElement = repeater.children(".repeater_elements").children(".repeater_element");
            repeaterElement.each(function (index) {
                let repeaterElementInputs = $(this).children(".col-lg").find(opts.inputTags);
                repeaterElementInputs.each(function (index) {
                    let input = $(this);
                    let inputName = input.attr("name");
                    inputName = getInnerInputName(parentRepeaterName, parentRepeaterInputIndex, repeaterName, innerRepeaterInputIndex, inputName);
                    updateInputName(input, inputName);
                });
                innerRepeaterInputIndex++;
                //indexInnerRepeaterInputs(repeaterName, $(this), repeaterInputIndex, innerLayers + 1);
            });
        }

        function getInnerInputName(parentRepeaterName, parentRepeaterInputIndex, repeaterName, innerRepeaterInputIndex, inputName) {
            if (inputName.indexOf("]") > -1) {
                let start = inputName.lastIndexOf("[");
                let end = inputName.lastIndexOf("]");
                inputName = inputName.substring(start + 1, end);
            }
            inputName = parentRepeaterName + "[" + parentRepeaterInputIndex + "][" + repeaterName + "][" + innerRepeaterInputIndex + "][" + inputName + "]";
            return inputName;
        }
    };

    /*
    
    Actions on initialization
    
    */
    var onInit = function () {
        renderRepeaterFromConfig();
        renderRepeaterElementsWithValues();
        makeRepeaterSortable();
        wrapRepeaterElementsInDiv();
        renderControls();
        repeater.find('[add_repeater_element]').each(function (index) {
            checkControlsVisibility($(this));
        });
        reindexRepeater(repeater);
        hideDefaultRepeaterElements();
    };
    
    /*
    
    Render repeater elements with data from configuration
    
    */
    var renderRepeaterFromConfig = function ()
    {
        // add repeater_name attribute to outer repeater tag
        if (opts.name) {
            repeater.attr("repeater_name", opts.name);
        } else {
            alert("You forgot to add repeater's name field to configuration");
        }
        
        // add max_inner_repeaters attribute to outer repeater tag
        if (opts.max_repeaters) {
            repeater.attr("max_inner_repeaters", opts.max_repeaters);
        }
        
        // render repeater elements
        let repeaterElementsConfig = opts.elements;
        jQuery.each(repeaterElementsConfig, function() {
            renderRepeaterElementFromConfig(this);
        });
            
    };
    
    var renderRepeaterElementsWithValues = function () 
    {
        let elementConfig;
        let elementsFromConfig = opts.values;
        
        $.each(elementsFromConfig, function() {
            elementFromConfig = this;
            let elementName1 = null;
            $.each(elementFromConfig, function(elementName, value) {
                elementConfig = getElementConfigByName(elementName);
                elementName1 = elementName;
            });
            if (!elementConfig) {
                alert("Repeater element with name " + elementName1 + " not exists - remove it from config");
            }
        
            elementValues = eval('this.' + elementName1);
            renderRepeaterElementFromConfig(elementConfig, elementValues);
        });
    };
    
    var getElementConfigByName = function (elementName) {
        let elementConfigs = opts.elements;
        let elementConfig;
        $.each(elementConfigs, function() {
            if (this.name === elementName) {
                elementConfig = this;
            }
        });
        
        return elementConfig;
    };
    
    /*
    
    Render repeater element with data from configuration
    
    */
    var renderRepeaterElementFromConfig = function (elConfig, elValues = null) 
    {
        let elementName;
        let elementMaxRepeaters;
        let elementIcon;
        let elementInputs;
        
        if (elConfig.name) {
            elementName = elConfig.name;
        } else {
            alert("You forgot to set repeater's element name");
        }
        
        if (elConfig.max_repeaters) {
            elementMaxRepeaters = elConfig.max_repeaters;
        } else {
            elementMaxRepeaters = null;
        }
        
        if (elConfig.icon_class) {
            elementIcon = elConfig.icon_class;
        } else {
            elementIcon = null;
        }
        
        if (elConfig.inputs) {
            elementInputs = elConfig.inputs;
        } else {
            alert("You forgot to set repeater's inputs parameter");
        }
        
        // render outer html for repeater element
        let elementHtml = '<div class="row repeater_element" ' +
                            'repeater_el_name="' + elementName + '" '; 
        if (elementIcon) {
            elementHtml += 'repeater_el_icon="' + elementIcon + '" ';
        }
        if (elementMaxRepeaters) {
            elementHtml += 'max_repeaters="' + elementMaxRepeaters + '"';
        }
        elementHtml += '></div>';
        element = $(elementHtml);
            
        // render badge
        let badgeHtml = getBadgeHtml(elementName, opts.badgeClass);
        element.append(badgeHtml);
        // render inputs
        jQuery.each(elementInputs, function(key) {
            let inputValue;
            if (elValues) {
                inputValue = elValues[key];
            }
            let formGroupHtml = getFormGroupHtml(this, inputValue);
            
            element.append(formGroupHtml);
        });
        
        // wrap into col-lg
        element.wrapInner("<div class='col-lg'></div>");
        
        // add remove button
        element.append( '<div class="col-lg-auto"><button type="button" remove_repeater_element class="' + opts.removeBtnClass + '"><i class="far fa-trash-alt"></i></button></div>');
        
        repeater.append(element);
    };
    
    /*
    
    Get badge html
    
    */
    var getBadgeHtml = function (name, spanClass) {
        return '<span class="' + spanClass + '">' + name + '</span>';
    };
    
    /*
    
    Get form group html
    
    */
    var getFormGroupHtml = function (elInputConfig, inputValue = null)
    {
        let formGroup;
        
        // create form group's outer html
        if (elInputConfig.type === "checkbox") {
            formGroup = $("<div class='form-check form-check-inline'>");
        } else {
            formGroup = $("<div class='form-group'></div>");
        }
        
        // add title for input above input
        if (!elInputConfig.labelPosition || elInputConfig.labelPosition === "top") {
            formGroup.append('<span class="form-text text-muted">' + elInputConfig.name + '</span>');
        }
        
        switch (elInputConfig.tag) {
            case "textarea":
                tag = $("<textarea>");
                if (elInputConfig.rows) {
                    tag.attr("rows", elInputConfig.rows);
                }
                tag.val(inputValue);
                break;
            case "select":
                tag = $("<select>");
                if (elInputConfig.opts) {
                    $.each(elInputConfig.opts, function(value, name) {
                        tag.append('<option value="' + value + '">' + name + '</option>');
                    });
                }
                if (elInputConfig.multiple === true) {
                    tag.prop("multiple", true);
                }
                tag.val(inputValue).attr('selected','selected');
                break;
            default:
                tag = $('<input>');
                switch(elInputConfig.type) {
                    case "color":
                        tag.attr("type", "color");                        
                        tag.val(inputValue);
                        break;
                    case "checkbox":
                        tag.attr("type", "checkbox");
                        if (inputValue) {
                            tag.prop('checked', true);
                        }
                        break;
                    case "password":
                        tag.attr("type", "password");
                        tag.val(inputValue);
                        break;
                    case "file":
                        tag.attr("type", "file");
                        break;
                    default:
                        tag.attr("type", "text");
                        tag.val(inputValue);
                }
        }
        
        if (elInputConfig.class) {
            tag.addClass(elInputConfig.class);
        }
        
        if (elInputConfig.name) {
            tag.attr("name", elInputConfig.name);
        }
        
        if (elInputConfig.required === true) {
            tag.prop("required", true);
        }
        
        if (elInputConfig.readonly === true) {
            tag.prop("readonly", true);
        }
        
        if (elInputConfig.maxlength) {
            tag.attr("maxlength", elInputConfig.maxlength);
        }
        
        if (elInputConfig.placeholder) {
            tag.attr("placeholder", elInputConfig.placeholder);
        }
        
        tag.attr("id", elInputConfig.name);
            
        formGroup.append(tag);
        
        // add title for input after 
        if (elInputConfig.labelPosition === "bottom") {
            formGroup.append('<label class="form-text text-muted" for="' + elInputConfig.name + '">' + elInputConfig.name + '</label>');
        }
        
        return formGroup;
    };
    
    /*
    
    Wrap repeater elements in div
    
    */
    var wrapRepeaterElementsInDiv = function ()
    {
        repeater.wrapInner('<div class="repeater_elements"></div>');
    };

    /*
    
    Make repeater elements sortable
    
    */
    var makeRepeaterSortable = function ()
    {
        repeater.find(".repeater_elements").sortable({
            update: function(event, ui) {
                reindexRepeater(repeater);
            },
            cancel: opts.cancelSortableOnTags
        });
    };

    var hideDefaultRepeaterElements = function ()
    {
        let elementsConfig = opts.elements;
        $.each(elementsConfig, function () {
            let defaultRepeaterElements = repeater.children(".repeater_elements").children(".repeater_element[repeater_el_name='" + this.name + "']").first();
            defaultRepeaterElements.hide();
            disableInputs(defaultRepeaterElements);
        });
        
        repeater.each(function (index) {
        });

        function disableInputs(defaultRepeaterElements)
        {
            defaultRepeaterElements.find(opts.inputTags).each(function(){
                $(this).attr("disabled", true);
            });
        }
    };

    /*
    
    Check controls (add repeater buttons) visibility
    
    */
    var checkControlsVisibility = function (addRepeaterButton) {
        let elementName = addRepeaterButton.attr("add_repeater_element");
        let repeaterBlock = addRepeaterButton.closest(".repeater");
        let repeaterElementsBlock = repeaterBlock.children(".repeater_elements");
        let repeaterElement = repeaterElementsBlock.find(".repeater_element[repeater_el_name='" + elementName + "']").first();
        let repeaterElementsCount = addRepeaterButton.parent().find("[add_repeater_element]").length;

        let max = repeaterElement.attr("max_repeaters");
        let maxInners = repeaterBlock.attr("max_inner_repeaters");
        let repeatersCount = repeater.find("[repeater_el_name='" + elementName + "']").length - 1; // -1 because one repeater always is hidden
        let innerRepeatersCount = repeaterElementsBlock.children().length - repeaterElementsCount;
        let addRepeaterElement = repeaterBlock.find("button[add_repeater_element='" + elementName + "']").first();
        
        if (typeof max !== "undefined" && max <= repeatersCount) {
            hideControls(addRepeaterElement)
        } else {
            showControls(addRepeaterElement)
        }

        if (typeof maxInners !== "undefined" && maxInners <= innerRepeatersCount) {
            hideAllControls(repeaterBlock)
        }

        function hideControls(addRepeaterElement) {
            addRepeaterElement.hide();
        }

        function showControls(addRepeaterElement) {
            addRepeaterElement.show();
        }

        function hideAllControls(repeaterBlock) {
            let addRepeaterElements = repeaterBlock.find("button[add_repeater_element]");
            addRepeaterElements.hide();
        }
    }

    /*
    
    Add repeater element
    
    */
    var addRepeaterElement = function (addRepeaterButton) {
        let elementName = addRepeaterButton.attr("add_repeater_element");
        let repeaterElementsBlock = addRepeaterButton.closest(".repeater").children(".repeater_elements");
        let repeaterElement = repeaterElementsBlock.find(".repeater_element[repeater_el_name='" + elementName + "']").first();
        let newRepeaterElement = repeaterElement.clone().insertAfter(repeaterElementsBlock.children(".repeater_element").last()).slideDown("slow");
        undisableRepeaterInputs(newRepeaterElement);
        makeRepeaterSortable();
    }

    var undisableRepeaterInputs = function (newRepeaterElement) {
        newRepeaterElement.children().find(opts.inputTags).each(function(){
            $(this).attr("disabled", false);
        });
    }

    /*
    
    Render controls (add repeater element button)
    
    */
    var renderControls = function () {
        repeater.append('<div class="repeater_controls"></div>');
        let controlsDiv = repeater.children(".repeater_controls");
        
        let repeaterElements = opts.elements;
        let controlsHtml = getControlsHtml(repeaterElements);
        controlsDiv.html( controlsHtml );

        function getControlsHtml(repeaterElements) {
            let controlsHtml = '<div class="row">';
            controlsHtml += '<div class="col-lg-12">';

            $.each(repeaterElements, function () {
                let repeaterElement = this;
                let elementName = repeaterElement.name;
                let iconHtml = getControlsIconHtml(repeaterElement);
                controlsHtml += getControlsButtonHtml(iconHtml, elementName);
            });

            controlsHtml += '</div>';
            controlsHtml += '</div>';

            return controlsHtml;
        }
        function getControlsIconHtml(repeaterElement)
        {
            let html = "";
            if (repeaterElement.icon_class) {
                let elementIcon = repeaterElement.icon_class;
                html = '<i class="' + elementIcon + '" style="margin-right: 3px"></i>';
            }
            return html;
        }
        function getControlsButtonHtml(iconHtml, elementName)
        {
            return '<button type="button" add_repeater_element="' + elementName + '" class="' + opts.addBtnClass + '">' +
                iconHtml + "Add " + elementName +
                '</button>';
        }
    }
    
}; 

$.fn.formRepeater.defaults = {
    inputTags: "input, textarea, select",
    cancelSortableOnTags: "button, option, input, textarea, select",
    removeBtnClass: "btn btn-outline-danger",
    addBtnClass: "btn btn-outline-info btn-square btn-sm mt-1 mr-1",
    badgeClass: "badge badge-secondary",
    values: {}
};
