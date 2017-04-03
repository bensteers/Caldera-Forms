/*! GENERATED SOURCE FILE caldera-forms - v1.5.1-b-1 - 2017-04-03 *//**
 * API Client for Caldera Forms API for a single form
 *
 * @since 1.5.0
 *
 * @param routes URLs for endpoints, should have URL for /entries and /forms
 * @param perPage How many items to return for page
 * @param formId Form ID
 * @param tokens Either WordPress REST API authentication nonce as string, or object with index nonce and token (token is Caldera Forms Entry Token)
 * @param $ jQuery
 *
 * @returns {{getForm: getForm, getEntries: getEntries, paginatedEntryURL: paginatedEntryURL, setPerPage: setPerPage}}
 *
 * @constructor
 */
function CFAPI( routes, perPage, formId, tokens,  $ ) {
    var nonce, token;
    if( 'object' == typeof  tokens ){
        nonce = typeof  tokens.nonce == 'string' ?  tokens.nonce : false;
        token = typeof  tokens.nonce == 'string' ?  tokens.token : false;
    }else{
        nonce = tokens;
    }

    function addHeaders( xhr ){
        xhr.setRequestHeader( 'X-CF-ENTRY-TOKEN', token );
        xhr.setRequestHeader( 'X-WP-Nonce', nonce );
    }

    return {
        getForm: function () {
            return $.ajax({
                url: routes.form + formId,
                method: 'GET',
                beforeSend: function ( xhr ) {
                    addHeaders( xhr );
                }
            }).success(function (r) {
                return r;
            }).error(function (r) {
                console.log(r);
            });
        },
        getEntries: function ( page ) {
            return $.ajax({
                url: this.paginatedEntryURL(formId, page, perPage ),
                method: 'GET',
                beforeSend: function ( xhr ) {
                    addHeaders( xhr );
                }
            } ).success(function (r) {
                return r;
            }).error(function (r) {
                console.log(r);
            });
        },
        paginatedEntryURL: function (formId, page ) {
            var params = $.param({
                page: page,
                per_page: perPage
            });

            return routes.entries + formId + '?' + params
        },
        setPerPage : function( newPerPage ) {
            perPage = newPerPage;
        },
        getPerPage :function () {
            return perPage;
        },
        savePerPage: function(){
            return $.ajax({
                url: routes.entrySettings,
                method: 'POST',
                dataType: 'json',
                beforeSend: function ( xhr ) {
                    addHeaders( xhr );
                },
                data:{
                    per_page: perPage
                }
            }).success( function( r ){
                return r.per_page;
            }).error( function( r ){
                console.log(r);
            })

        }
    }
}


/**
 * Form API for use in editor
 *
 * @since 1.5.1
 *
 * @param routes
 * @param formId
 * @param nonce
 * @param $
 * @returns {{getForm: getForm, saveForm: saveForm}}
 * @constructor
 */
function CFFormEditorAPI( routes, formId, nonce, $ ) {
    function addHeaders(xhr) {
        xhr.setRequestHeader('X-WP-Nonce', nonce);
    }
    return {
        getForm: function () {
            return $.ajax({
                url: routes.form + formId + '?full=true',
                method: 'GET',
                beforeSend: function (xhr) {
                    addHeaders(xhr);
                }
            }).success(function (r) {
                return r;
            }).error(function (r) {
                console.log(r);
            });
        },
        saveForm: function () {
            //placeholder
        }
    }
}
/**
 * A factory for a form state containers
 *
 * Can be used constructed with CFAPI() or other data. Designed to provide data to our VueJS entry viewer, but is framework agnostic.
 *
 * @since 1.50
 *
 * @param formId The ID of the form
 * @param allFields All fields of this form
 * @param listFields The fields of this form with "Show In Entry List" checked
 *
 * @returns {{state: {formId: *, allFields: *, listFields: *}, setFormId: setFormId, setAllFields: setAllFields, setListFields: setListFields, getAllFields: getAllFields}}
 *
 * @constructor
 */
function CFFormStoreFactory(formId, allFields, listFields) {
    return {
        state: {
            formId: formId,
            allFields: allFields,
            listFields: listFields
        },
        setFormId: function (newValue) {
            this.state.formId = newValue
        },
        setAllFields: function (newValue) {
            this.state.allFields = newValue
        },
        setListFields: function (newValue) {
            this.state.listFields = newValue
        },
        getAllFields: function () {
            return this.state.allFields;
        }
    };
}

/**
 * A factory for creating a state container for a paginated collection of entries
 *
 * Can be used constructed with CFAPI() or other data. Designed to provide data to our VueJS entry viewer, but is framework agnostic.
 *
 * @since 1.50
 *
 * @param formId The ID of form entries are from
 * @param entries The entry collection
 *
 * @returns {{state: {formId: *, entries: *, total: number, totalPages: number}, setEntries: setEntries, setTotal: setTotal, setTotalPages: setTotalPages, getTotalPages: getTotalPages, getEntry: getEntry, getFieldFromEntry: getFieldFromEntry}}
 *
 * @constructor
 */
function CFEntriesStoreFactory(formId, entries) {
    return {
        state: {
            formId: formId,
            entries: entries,
            total: 0,
            totalPages: 0,
            page: 0
        },
        setEntries: function (entries) {
            this.state.entries = entries;
        },
        setTotal: function (total) {
            this.state.total = total;
        },
        getTotal: function () {
            return this.state.total;
        },
        setTotalPages: function (totalPages) {
            this.state.totalPages = totalPages;
        },
        getTotalPages: function () {
            return this.state.totalPages;
        },
        setPage: function (page) {
            this.state.page = page;
        },
        getPage: function () {
            return this.state.page;
        },
        getEntry: function (id) {
            if ('object' == typeof this.state.entries[id]) {
                return this.state.entries[id];
            }
            return false;
        },
        getFieldFromEntry: function (entry, fieldId) {
            if ('object' == typeof entry.fields[fieldId]) {
                return entry.fields[fieldId];
            }
            return false;
        }
    }
}

/**
 * A factory for creating a form store for use in form  editor
 *
 * @since 1.5.1
 *
 * @param form
 * @returns {{getFields: getFields, getField: getField, getFieldType: getFieldType, addField: addField, updateField: updateField, getConditionals: getConditionals, getConditional: getConditional, getProcessors: getProcessors, getProcessor: getProcessor}}
 * @constructor
 */
function CFFormEditStore(form) {
    var fieldKeys = [
        'ID',
        'type',
        'label',
        'slug',
        'config',
        'caption',
        'custom_class',
        'default',
        'conditions',
        'hide_label'
    ];

    /**
     * Set a field config
     *
     * form.fields shouldn't be changed anywhere else. This is the one place to do so it can emit an event, when we get to that sort of thing.
     *
     * @since 1.5.1
     *
     * @param fieldId Field ID
     * @param config New field config
     */
    function setField(fieldId, config) {
        form.fields[fieldId] = config;
    }

    /**
     * Repair calculation group if needed
     *
     * @since 1.5.1
     * @param calc
     * @returns {*}
     */
    function validateCalc( calc ){
        if( 'object' != typeof  calc ){
            return false;
        }

        for (var i in calc) {
            if (calc[i].hasOwnProperty('lines')) {
                i = parseInt(i);
                for (var ii in calc[i].lines) {
                    ii = parseInt(ii);
                    if (0 == ii) {
                        calc[i].lines[ii].operator = '';
                    } else if (undefined === calc[i].lines[ii].operator || '' == calc[i].lines[ii].operator) {
                        calc[i].lines[ii].operator = '+';
                    }
                    if( undefined === calc[i].lines[ii].field ){
                        calc[i].lines[ii].field = '';
                    }
                }

            }
        }

        return calc;
    }


    /**
     * Create a field congig
     *
     * @since 1.5.1
     *
     * @param fieldId
     * @param type
     * @returns {{ID: *, type: *, config: {}, hide_label: boolean}}
     */
    function fieldFactory(fieldId, type) {
        var field = {
            ID: fieldId,
            type: type,
            config: {},
            hide_label: false,
        };

        fieldKeys.forEach(function (index) {
            if (!field.hasOwnProperty(index)) {
                field[index] = '';
            }
        });

        return field;
    }

    /**
     * Create a new option
     *
     * @sine 1.5.1
     *
     * @returns {{}}
     */
    function optionFactory() {
        return {
            label: '',
            value: '',
            default: false
        };

    }

    /**
     * Create a new calculation line
     *
     * @since 1.5.1
     *
     * @param lineGroup
     * @param lineId
     * @returns {{operator: string, field: string, 'line-group': *, line: *}}
     */
    function calcLineFactory(lineGroup, lineId) {
        return {
            operator: '',
            field: '',
            'line-group': lineGroup,
            line: lineId
        };
    }

    /**
     * Create a new calculation operator group
     *
     * @since 1.5.1
     *
     * @param lineGroup
     * @param opId
     * @returns {{operator: string, 'op-id': *, 'line-group': *}}
     */
    function calcOpGroupFactory(lineGroup, opId) {
        return {
            operator: "+",
            'op-id': opId,
            'line-group': lineGroup
        };
    }

    /**
     * Check if object has a key
     *
     * @since 1.5.1
     *
     * @param object
     * @param key
     * @returns {boolean}
     */
    function has(object, key) {
        return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Check if object is empty
     *
     * Will return true (IE empty) if not object
     * @since 1.5.1
     *
     *
     * @param object
     * @returns {boolean}
     */
    function emptyObject(object) {
        if ( 'object' == typeof  object) {
            return Object.keys(object).length === 0 && object.constructor === Object;
        }
        return true;

    }

    /**
     * Check if a value is numeric
     *
     * @since 1.5.1.
     * @param n
     * @returns {boolean}
     */
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     * Search on array or object by item key and return highest
     *
     * @since 1.5.1
     *
     * @param obj
     * @param index
     * @returns {*}
     */
    function maxItem(obj, index) {

        var apexVal = 0,
            apexItem,
            changed = false;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].hasOwnProperty(index)) {
                var x = obj[i][index];
                if (isNumber(obj[i][index]) && ( !changed || obj[i][index] > apexVal )) {
                    apexVal = obj[i][index];
                    apexItem = obj[i];
                    changed = true;
                }
            }
        }

        return apexItem;
    }




    return {
        /**
         * Get all fields of form
         *
         * @returns {*}
         */
        getFields: function () {
            return form.fields;
        },
        /**
         * Get a field of a form
         *
         *  @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        getField: function (fieldId) {
            if (form.fields.hasOwnProperty(fieldId)) {
                if (!form.fields[fieldId].hasOwnProperty('config')) {
                    var field = form.fields[fieldId];
                    field.config = {};
                    setField(fieldId, field);
                    return this.getField(fieldId);
                }
                return form.fields[fieldId];
            }

            return {}
        },
        /**
         * Get field type by field ID
         *
         *  @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        getFieldType: function (fieldId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                return field.type;
            }
            return false;
        },
        /**
         * Add a field to collection
         *
         *  @since 1.5.1
         *
         * @param fieldId
         * @param fieldType
         * @returns {*|{}}
         */
        addField: function (fieldId, fieldType) {
            setField(fieldId, fieldFactory(fieldId, fieldType));
            return this.getField(fieldId);
        },
        /**
         * Update field in collection
         *
         * This is the primary, public way to update a field. Special handling for options is available.
         * Developer Note: don't change form.fields here, use setField() for that always.
         *
         *  @since 1.5.1
         *
         * @param fieldId
         * @param key
         * @param data
         * @returns {*}
         */
        updateField: function (fieldId, key, data) {
            var field = this.getField(fieldId);
            if (!emptyObject(field) && undefined != key) {

                if (-1 < fieldKeys.indexOf(key)) {
                    field[key] = data;
                    setField(fieldId, field);
                    return this.getField(fieldId);
                } else if ('placeholder' == key || 'default' == key) {
                    field.config[key] = data;
                    setField(fieldId, field);
                    return this.getField(fieldId);
                } else if ('option-value' == key || 'option-value' == key || 'option' == key) {
                    throw new Error('Invalid field key to update. Use this.UpdateFieldOptions');
                } else {
                    field.config[key] = data;
                    setField(fieldId, field);
                    return this.getField(fieldId);
                }

            }
            return false;
        },
        /**
         * Add an option label or value to a field
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param type
         * @param opt
         * @param value
         * @returns {*}
         */
        updateFieldOption: function (fieldId, type, opt, value) {
            var field = this.getField(fieldId);
            if (!emptyObject(field) && ( 'value' == type || 'label' == type || 'default' == type )) {
                if (!field.config.hasOwnProperty('option')) {
                    field.config['option'] = {};
                }
                if (!field.config.option.hasOwnProperty(opt)) {
                    field.config.option[opt] = optionFactory(opt);
                }
                if (type == 'default') {
                    field.config.default = opt;
                }
                field.config.option[opt][type] = value;
                setField(fieldId, field);
                return this.getField(fieldId);
            }

            return false;
        },
        /**
         * Replace all options of a field
         *
         * @since 1.5.1.
         *
         * @param fieldId
         * @param options
         * @returns {*}
         */
        updateFieldOptions: function (fieldId, options) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                field.config.option = options;
                setField(fieldId, field);
                return this.getField(fieldId);
            }

            return false;
        },
        /**
         * Add a new option to a select field
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param value
         * @param label
         * @returns {*}
         */
        addFieldOption: function (fieldId, value, label) {
            var option = optionFactory();
            if (value) {
                option.value = value;
            }
            if (label) {
                option.label = label;
            }
            var opt = "opt" + parseInt(( Math.random() ) * 0x100000);

            var options = this.getFieldOptions(fieldId);
            options[opt] = option;
            this.updateFieldOptions(fieldId, options);
            return this.getFieldOption(fieldId, opt);
        },
        /**
         * Get a field option
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param opt
         * @returns {*}
         */
        getFieldOption: function (fieldId, opt) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                if (field.config.option.hasOwnProperty(opt)) {
                    var option = field.config.option[opt];
                    if (!emptyObject(option)) {
                        return option;
                    }
                }
            }
            return false;
        },
        /**
         * Get all options of a field
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        getFieldOptions: function (fieldId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field) && field.hasOwnProperty('config') && field.config.hasOwnProperty('option')) {
                if (field.config.option.hasOwnProperty('undefined')) {
                    delete field.config.option.undefined;
                    setField(fieldId, field);
                }

                return field.config.option;

            }

            return false;
        },
        /**
         * Remove an option from a field
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param optId
         * @returns {*}
         */
        removeFieldOption: function (fieldId, optId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                if (field.config.option.hasOwnProperty(optId)) {
                    delete field.config.option[optId];
                    setField(optId);
                    return this.getField(fieldId);
                }
            }

            return false;
        },
        /**
         * Get a field's option default
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        getFieldOptionDefault: function (fieldId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                if (field.config.hasOwnProperty('default')) {
                    return field.config.default;
                }
            }

            return false;
        },
        /**
         * Change a field's type
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param newType
         * @returns {*}
         */
        changeFieldType: function (fieldId, newType) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                field.type = newType;
                setField(fieldId, field);
                return this.getField(fieldId);
            }

            return false;
        },
        /**
         * Get calculation field groups for builder
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        getFieldCalcGroups: function (fieldId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                if (field.config.hasOwnProperty('config') && field.config.config.hasOwnProperty('group')) {
                    return validateCalc(field.config.config.group);
                }
            }

            return false;
        },

        /**
         * Change field calculation groups
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param groups
         * @returns {*}
         */
        setFieldCalcGroups: function (fieldId, groups) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                if( ! field.config.hasOwnProperty( 'config' ) ){
                    field.config.config = {};
                }
                field.config.config.group = validateCalc(groups);
                setField(fieldId, field);
                return this.getField(fieldId);
            }

            return false;
        },
        /**
         * Add a new field calculation line group
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param groupId
         * @param lineId
         * @returns {*}
         */
        newFieldCalcGroup: function (fieldId, groupId, lineId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                var newLine = calcLineFactory(groupId, lineId);
                var groups = this.getFieldCalcGroups(fieldId);
                groups[groupId].lines.push(newLine);
                this.setFieldCalcGroups(fieldId, groups);
                return newLine;
            }

            return false;
        },
        /**
         * Update a calculation field line
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param groupId
         * @param lineId
         * @param type
         * @param data
         * @returns {*}
         */
        updateFieldCalcLine: function (fieldId, groupId, lineId, type, data) {
            if (type === 'operator' || type === 'field') {
                var groups = this.getFieldCalcGroups(fieldId);
                if (!emptyObject(groups) && groups.hasOwnProperty(groupId)) {
                    if (groups[groupId].hasOwnProperty('lines') && groups[groupId].lines.hasOwnProperty(lineId)) {
                        groups[groupId].lines[lineId][type] = data;
                        this.setFieldCalcGroups(fieldId, groups);
                        return groups[groupId];
                    }
                }
                return false;
            } else {
                throw new Error('Invalid calcualtion group key to update. Type arg must be operator or field');
            }
        },
        /**
         * Update a field calculation operator ( operator group, no operator for a line)
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param groupId
         * @param newOperator
         * @returns {*}
         */
        updateFieldCalcOpGroup: function (fieldId, groupId, newOperator) {
            var groups = this.getFieldCalcGroups(fieldId);
            if (!emptyObject(groups) && groups[groupId].hasOwnProperty('operator')) {
                groups[groupId].operator = newOperator;
                this.setFieldCalcGroups(fieldId, groups);
                return groups[groupId];
            }
            return false;
        },
        /**
         * Remove a line from a field's calculation groups
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param groupId
         * @param lineId
         * @returns {*}
         */
        removeFieldCalcLine: function (fieldId, groupId, lineId) {
            var groups = this.getFieldCalcGroups(fieldId);
            if (!emptyObject(groups) && groups.hasOwnProperty(groupId)) {
                if (groups[groupId].hasOwnProperty('lines') && groups[groupId].lines.hasOwnProperty(lineId)) {
                    delete groups[groupId].lines[lineId];
                    groups[groupId].lines.length--;
                    this.setFieldCalcGroups(fieldId, groups);
                    return groups[groupId];
                }
            }
            return false;
        },
        /**
         * Remove a group form a field's calculations
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param groupId
         * @returns {*}
         */
        removeFieldCalcGroup: function (fieldId, groupId) {
            var groups = this.getFieldCalcGroups(fieldId);
            if (!emptyObject(groups) && groups.hasOwnProperty(groupId)) {
                delete groups[groupId];
                groups.length--;
                this.setFieldCalcGroups(fieldId, groups);
                return groups[groupId];

            }
            return false;
        },
        /**
         * Get saved simple formula for a calculation field
         *
         * AKA formular
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        getFieldCalcFormula: function (fieldId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                if (field.config.hasOwnProperty('formular')) {
                    return field.config.formular;
                } else {
                    return '';
                }
            }
            return false;
        },
        /**
         * Update simple field for calculation field
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @param formula
         * @returns {boolean}
         */
        updateFieldCalcFormula: function (fieldId, formula) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                field.config.formular = formula;
                setField(fieldId, field);
                return true;
            }
            return false;
        },
        /**
         * Add a new field calc group with operator and new line group
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @returns {*}
         */
        addFieldCalcGroup: function (fieldId) {
            var groups = this.getFieldCalcGroups(fieldId),
                highestGroupId = -1,
                highestOpGroupId = -1;

            if (emptyObject(groups)) {
                groups = [];
                groups.push( {
                    lines: [calcLineFactory(0, 0)]
                });
            } else {
                if( 1 > groups.length ){
                    highestGroupId = 1;
                }else{
                    highestGroupId = groups.length -1;
                    if ( 1 == groups.length ) {
                        highestOpGroupId =  -1;
                    }else{
                        highestOpGroupId =  groups[highestGroupId - 1]['op-id'];
                    }
                    groups.push( calcOpGroupFactory(highestGroupId + 1, highestOpGroupId + 1 ) );
                    highestGroupId = highestGroupId + 1;
                }

                groups.push( {
                    lines: [calcLineFactory(highestGroupId + 1, 0)]
                });

            }

            this.setFieldCalcGroups(fieldId, groups);
            return this.getFieldCalcGroups(fieldId);

        },
        /**
         * Remove field
         *
         * @since 1.5.1
         *
         * @param fieldId
         * @returns {boolean}
         */
        deleteField: function (fieldId) {
            var field = this.getField(fieldId);
            if (!emptyObject(field)) {
                delete form.fields[fieldId];
                return true;
            }

            return false;
        },
        /**
         * Get conditional groups of form
         *
         * @since 1.5.1
         *
         * @returns {*}
         */
        getConditionals: function () {
            return form.conditional_groups.conditions;
        },
        /**
         * Get a conditional group by ID
         *
         *  @since 1.5.1
         *
         * @param id
         * @returns {*}
         */
        getConditional: function (id) {
            if (has(form.conditional_groups.conditions, id)) {
                return form.conditional_groups.conditions[id];
            }
            return {}
        },
        /**
         * Get processors of form
         *
         * @since 1.5.1
         *
         * @returns {*}
         */
        getProcessors: function () {
            return form.processors;
        },
        /**
         * Get a form processor
         *
         * @since 1.5.1
         *
         * @param id
         * @returns {*}
         */
        getProcessor: function (id) {
            if (has(form.processors, id)) {
                return form.processors[id];
            }
            return {}
        }

    }

}


/**
 * A VueJS-powered entry viewer for Caldera Forms
 *
 * @since 1.5.0
 *
 * @param formId Form ID
 * @param formStore Form data store, should be created with CFFormStoreFactory()
 * @param entryStore Entry data store, should be created with CFEntriesStoreFactory()
 * @param api API instance for this form. Should be instance of CFAPI
 * @param config Configuration. Probably CF_ENTRY_VIEWER_2_CONFIG, but you can add your own if you like.
 *
 * @returns {*}
 *
 * @constructor
 */
function CFEntryViewer2( formId, formStore, entryStore, api, config ){
    var $singleEntryZone = jQuery( document.getElementById( config.targets.entry ) );

    return new Vue({
        data: function() {
            return {
                form: formStore.state,
                entries: entryStore.state,
                page: 1,
                perPage: api.getPerPage(),
                totalPages: entryStore.getTotalPages(),
                singleEntry: {},
                currentView: 'empty'
            }
        },
        el: '#caldera-forms-entries',
        components : {
            'single-entry' : {
                template: '#' + config.targets.entries,
                data: function () {
                    return {
                        singleEntryFields: Object,
                        singleEntry: Object
                    }
                }
            },

        },
        mounted: function () {
            this.paginationButtons();
        },
        methods:{
            paginationButtons: function(){
                var $el = jQuery( this.$el );
                var $next = $el.find( '.caldera-forms-entry-viewer-next-button' ),
                    $prev = $el.find( '.caldera-forms-entry-viewer-prev-button' );


                if( this.page >= this.totalPages ){
                    $next.prop( 'disabled', true ).attr( 'aria-disabled', true );
                }else{
                    $next.prop( 'disabled', false ).attr( 'aria-disabled', false );
                }

                if( this.page == 1 ){
                    $prev.prop( 'disabled', true ).attr( 'aria-disabled', true );
                }else{
                    $prev.prop( 'disabled', false ).attr( 'aria-disabled', false )

                }
            },
            nextPage: function(){
                var self = this;
                this.$set( this, 'page', this.page + 1 );
                jQuery.when( api.getEntries( self.page ) ).then( function(d){
                    entryStore.setEntries(d);
                    self.$set( self, 'entries', entryStore.state );
                    self.paginationButtons();
                }, function(){
                    self.notAllowed();
                });

            },
            prevPage: function(){
                if( 0 >= this.page - 1 ){
                    return false;
                }
                var self = this;
                this.$set( this, 'page', this.page - 1 );
                jQuery.when( api.getEntries( self.page ) ).then( function(d){
                    entryStore.setEntries(d);
                    self.$set( self, 'entries', entryStore.state );
                    self.paginationButtons();
                }, function(){
                    self.notAllowed();
                });

            },
            entryHasField: function( fieldId, entryId ){
                var entry = entryStore.getEntry( entryId );
                if ( false !== entry ) {
                    return entryStore.getFieldFromEntry(entry, fieldId);
                } else {
                    return false;
                }
            },
            updatePerPage: function(){
                var self = this;
                api.setPerPage( this.perPage );
                jQuery.when( api.getEntries( self.page ) ).then( function(d){
                    entryStore.setEntries(d);
                    self.$set( self, 'entries', entryStore.state );
                });
                api.savePerPage( this.perPage );
            },
            fieldValue: function( fieldId, entry ){
                if( 'string' == typeof  entry[ fieldId ] ){
                    return entry[ fieldId ];
                }else if( 'object' == typeof entry[ 'fields' ][ fieldId ] ){
                    return entry[ 'fields' ][ fieldId ].value;
                }else{
                    return '';
                }

            },
            showSingle: function( entryId ){
                var $modal,
                    entry = entryStore.getEntry( entryId ),
                    fields = formStore.getAllFields();
                var single = Vue.extend({
                    template: '#' + config.templates.entry,
                    data: function(){
                        return {
                            fields: fields,
                            entry: entry
                        }
                    },
                    methods: {
                        fieldValue: function (fieldId) {
                            if ('string' == typeof  entry[fieldId]) {
                                return entry[fieldId];
                            } else if ('object' == typeof entry['fields'][fieldId]) {
                                return entry['fields'][fieldId].value;
                            } else {
                                return '';
                            }
                        },
                        close: function () {
                            $singleEntryZone.empty();
                            $modal.destroy();
                        }
                    },
                });

                $singleEntryZone.empty();
                var newDiv = document.createElement("div");
                jQuery( newDiv ).attr( 'id', config.targets.entry + '-' + entryId );
                jQuery( newDiv ).appendTo( $singleEntryZone );
                new single().$mount('#' + config.targets.entry + '-' + entryId );
                $modal = jQuery('[data-remodal-id=' + entryId +']').remodal();
                $modal.open();

            },
            notAllowed: function (r) {
                if ( 'object' != typeof  r && 404 != r.status ) {
                    $singleEntryZone.remove();
                    jQuery('#caldera-forms-entries-nav').remove();
                    jQuery(document.getElementById('caldera-forms-entries')).html('<div class="alert alert-warning">' + config.strings.not_allowed + '</div>');
                }
            }
        }
    });
}

/**
 * Set up the entry viewer
 *
 * @since 1.5.0
 */
jQuery( document ).ready( function ($) {
    if( 'object' == typeof CF_ENTRY_VIEWER_2_CONFIG ){

        var formId = CF_ENTRY_VIEWER_2_CONFIG.formId;

        var tokens = {
            //REST API Nonce
            nonce: CF_ENTRY_VIEWER_2_CONFIG.api.nonce,
            //Special token for entry viewer
            token: CF_ENTRY_VIEWER_2_CONFIG.api.token
        };

        var api = new CFAPI( CF_ENTRY_VIEWER_2_CONFIG.api, CF_ENTRY_VIEWER_2_CONFIG.perPage, formId, tokens, $ );
        $.when( api.getForm(), api.getEntries(1) ).then( function( d1, d2 ){
            var form = d1[0];

            var entries = d2[0];
            var formStore = new CFFormStoreFactory( formId, form.field_details.order, form.field_details.entry_list );
            var entriesStore = new CFEntriesStoreFactory( formId, entries );
            entriesStore.setPage(1);
            if( null != d2[2].getResponseHeader( 'X-CF-API-TOTAL-PAGES')  ){
                entriesStore.setTotalPages(d2[2].getResponseHeader( 'X-CF-API-TOTAL-PAGES' ) );
            }
            if( null != d2[2].getResponseHeader( 'X-CF-API-TOTAL' ) ){
                entriesStore.setTotal( d2[2].getResponseHeader( 'X-CF-API-TOTAL' ) );
            }
            var viewer = new CFEntryViewer2( formId, formStore, entriesStore, api, CF_ENTRY_VIEWER_2_CONFIG );

        }, function(r){
            var entriesId = typeof CF_ENTRY_VIEWER_2_CONFIG.targets == 'object' && typeof CF_ENTRY_VIEWER_2_CONFIG.targets.entries == 'string' ? CF_ENTRY_VIEWER_2_CONFIG.targets.entries : 'caldera-forms-entries';
            var navId = typeof CF_ENTRY_VIEWER_2_CONFIG.targets == 'object' && typeof CF_ENTRY_VIEWER_2_CONFIG.targets.nav == 'string' ? CF_ENTRY_VIEWER_2_CONFIG.targets.nav : 'caldera-forms-entries-nav';
            jQuery('#' + navId).remove();
            if ( 'object' == typeof r && 404 == r.status  ) {
                jQuery('#' + entriesId).html('<div class="alert alert-error">' + CF_ENTRY_VIEWER_2_CONFIG.strings.no_entries + '</div>');
            }else{
                jQuery('#' + entriesId).html('<div class="alert alert-error">' + CF_ENTRY_VIEWER_2_CONFIG.strings.not_allowed + '</div>');

            }
        });

    }

});
