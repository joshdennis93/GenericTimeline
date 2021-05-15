public inherited sharing class GenericTimelineController {
    /**
     * @description called via generticTimeline lwc, constructing a dynamic soql query to return a list of sobjects for use in a timeline.
     * @param  fromObject               the object being queried
     * @param  relationshipFieldAPIName the relationship API name of the child record to the currently viewed (parent) object
     * @param  recordId                 the record id of the currently viewed (parent) object
     * @param  orderbyAPIName           what field to order the resulting query by
     * @param  orderbyDirection         the direction of the sort
     * @return                          returns list of sObjects
     */
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String fromObject, String relationshipFieldAPIName, String recordId, String orderbyAPIName, String orderbyDirection) {
        String dynamicSOQL = 'SELECT Id FROM ' + fromObject + ' WHERE ' + relationshipFieldAPIName + ' = :recordId ' + 'ORDER BY ' + orderbyAPIName + ' ' + orderbyDirection;
        String safeQuery = String.escapeSingleQuotes(dynamicSOQL);
        
        List<sObject> results = Database.query(safeQuery);

        return results;
    }
    /**
     * @description an extension of getRecords, any record id queried from that method is sent to the LWC, which then creates a list of record ids and sends back here if the component is in 'map mode'. Will find the address details & populate a map.
     * NOTE: Platform limitation means only the first 10 addresses will appear on the map unless lat & long values are used
     * @param  recordIds        a list of record ids created in the genericTimeline LWC
     * @param  fromObject       the object being queried
     * @param  streetName       the API name of the street field, set in genericTimeline configuration attributes in app builder
     * @param  cityName         the API name of the city field, set in genericTimeline configuration attributes in app builder
     * @param  stateName        the API name of the state field, set in genericTimeline configuration attributes in app builder
     * @param  postcode         the API name of the postal code field, set in genericTimeline configuration attributes in app builder
     * @param  countryName      the API name of the country field, set in genericTimeline configuration attributes in app builder
     * @param  descriptionName  the API name of the description field, set in genericTimeline configuration attributes in app builder
     * @param  enableCircle     enables a circle overlay to appear on the map
     * @param  radiusMeters     mandatory if enableCircle is enabled, determines the size of the circle
     * @return                  returns a list of map<string,object>s, comprising all data required to populate address information on a lightning map component
     */
    @AuraEnabled(cacheable=true)
    public static String getAddressData(List<String> recordIds, String fromObject, String streetName, String cityName,
                                         String stateName, String postcode, String countryName, String descriptionName, 
                                         Boolean enableCircle, integer radiusMeters) {        
        String nameField = setNameField(fromObject);
        String allFields = 'Id';
        allFields += ', ' + nameField;
        allFields += String.isBlank(descriptionName) ? '' : ', ' + descriptionName;
        allFields += String.isBlank(streetName) ? '' : ', ' + streetName;
        allFields += String.isBlank(cityName) ? '' : ', ' + cityName;
        allFields += String.isBlank(stateName) ? '' : ', ' + stateName;
        allFields += String.isBlank(postcode) ? '' : ', ' + postcode;
        allFields += String.isBlank(countryName) ? '' : ', ' + countryName;
        String dynamicSOQL = 'SELECT ' + allFields 
        + ' FROM ' + fromObject
        + ' WHERE id IN :recordIds';

        String safeQuery = String.escapeSingleQuotes(dynamicSOQL);
        List<sObject> resultList = Database.query(safeQuery);

        List<Map<String,Object>> markerList = new List<Map<String,Object>>();
        for(sObject sobj : resultList) {
            Map<String,Object> markerMap = new Map<String,Object>();
            markerMap.put('title', sObj.get(nameField));
            if(!String.isBlank(descriptionName)) {
                markerMap.put('description',sObj.get(descriptionName));
            }
            if(enableCircle) {
                markerMap.put('type', 'Circle');
                markerMap.put('radius', radiusMeters);
                markerMap.put('strokeColor', '#FFF000');
                markerMap.put('strokeOpacity', 0.8);
                markerMap.put('strokeWeight', 2);
                markerMap.put('fillColor', '#FFF000');
                markerMap.put('fillOpacity', 0.35);
            }
            markerMap.put('value',sObj.get('Id'));
            Map<String,Object> addressMap = new Map<String,Object>();
            if(!String.isBlank(streetName)) {
                addressMap.put('Street',sObj.get(streetName));
            }
            if(!String.isBlank(cityName)) {
                addressMap.put('City',sObj.get(cityName));
            }
            if(!String.isBlank(stateName)) {
                addressMap.put('State',sObj.get(stateName));
            }
            if(!String.isBlank(postcode)) {
                addressMap.put('PostalCode',sObj.get(postcode));
            }
            if(!String.isBlank(countryName)) {
                addressMap.put('Country',sObj.get(countryName));
            }
            markerMap.put('location',addressMap);
            markerList.add(markerMap); 
        }
        return JSON.serialize(markerList);
    }
    /**
     * @description While most SF objects have a 'Name' field which can be set/used as a default, most Service Cloud objects use a different field altogether. This allows a name to be set without much fuss, and can easily be extended if required.
     * @param  objectName the object whose Name field is being set
     * @return            returns the mapped Name (etc.) field
     */
    public static String setNameField(String objectName) {
        String nameField;

        switch on objectName {
            when 'Case' {
                nameField = 'CaseNumber';
            }
            when 'WorkOrder' {
                nameField = 'WorkOrderNumber';
            }
            when 'WorkOrderLineItem' {
                nameField = 'LineItemNumber';
            }
            when 'ServiceAppointment' {
                nameField = 'AppointmentNumber';
            }
            when 'KnowledgeArticle' {
                nameField = 'ArticleNumber';
            }
            when else {
                nameField = 'Name';
            }
        }
        return nameField;
    }
}