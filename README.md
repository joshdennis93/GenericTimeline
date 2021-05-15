# GenericTimeline
A generic LWC which displays records related to a parent record, optionally using location data to display these records on a map. The configuration of the component itself is fairly flexible and should be able to support displaying any object(/s child records). 

## Installation
1. Clone/download files in repo
2. Use your favourite metadata management tool to add them to your current metadata and push to your org.
3. Add to lightning page via Lightning App Builder. For it to appear, you must set configuration values. Most config values have info text popups, but the key ones to be aware of are:
- Timeline Item Title: The API name of a field you want to show as the name of each child record - this will probably be the 'name' field of the object. 
- Field Names: The data to display in the expanded section. This value is essentially your SELECT field1, field2, field3 part of an SOQL query. Dot notation isn't supported (e.g. no Account.Name if querying a Contact record)
- Object API Name: The (child) object you're querying the data from - your FROM object1 part of an SOQL query.
- Relationship Field API Name: The relationship field connecting the child to the parent, e.g. AccountId for a Case/Contact to Account.
- Enable Map? and related settings: Allows values to be added to a map. These can be any fields, as long as an address can be constructed from it. If your address is stored in one single field (e.g. Address__c = '123 Fake St, Sydney 2000'), then simply set that field in the Street value and leave the rest blank.
- Enable Circle indicator? and related settings: Instead of displaying a marker, displays a translucent yellow circle. Technically one could use this to create a heatmap, as the API allows a developer to set the colour, opacity, border etc. - see force-app\main\default\classes\GenericTimelineController.cls from line 62/where it says 'if(enableCircle)'

## Limitations/Defects
- Only the fields' API names are shown - the lightning data service doesn't return labels.
- There's currently a defect where in order for a map's markers to appear, you need to enable and then disable the 'Enable circle indicator to appear?' setting. No idea why :(
- The Google Maps API will not show a marker if the address returns multiple locations - e.g. '2000, Australia' apparently has multiple results and thus nothing will be displayed on the map.
- The Map LWC base component doesn't appear to let developers select markers programmatically. Ideally, expanding a selection would also select the marker but I couldn't get it working and the documentation didn't help too much.
- I have not performance tested this but I suspect my lack of limiting in the SOQL query will result in this component breaking if you have many child records associated to the parent.
- Date data could probably be formatted in a more pretty way.
- Trying to display the map in a small area of the screen will distort it and generally not work - don't do this!

## Examples
![image1](/images/image1.PNG)

![image2](/images/image2.png)

![image4](/images/image4.png)

![image3](/images/image3.PNG)

## Use cases
- Display any kind of data from child records to a parent (realistically not anything, but it's played nicely so far)
- Track movement of entities on a map (e.g. in COVID-19 use case, identifying locations an infected patient may have visited)
- Visualise plan for sales/service/deliveries (e.g. view a salesperson's travels on a given day by querying for all Work Orders/Opportunities/Events on a given day)
- Identify shipments/logistics (e.g. if a ship carrying coal is going to dock at 3 ports over 14 days, seeing its current location v.s. future docking locations)
