import { LightningElement, wire, api } from "lwc";
import getRecords from "@salesforce/apex/GenericTimelineController.getRecords";
import getAddressData from "@salesforce/apex/GenericTimelineController.getAddressData";

export default class GenericTimeline extends LightningElement {
  @api recordId;
  @api query;
  @api icon;
  @api fieldNames;
  @api queriedRecords;
  @api error;
  @api title;
  @api fromObject;
  @api relationshipFieldAPIName;
  @api orderbyAPIName;
  @api orderbyDirection;
  @api cardTitle;
  @api cardIcon;

  @api recordsWithAddresses = [];
  mapMarkers;
  @api enableMap;
  @api descriptionName;
  @api streetName;
  @api cityName;
  @api stateName;
  @api postcode;
  @api countryName;
  @api enableCircle;
  @api radiusMeters;

  @wire(getRecords, { fromObject: "$fromObject",
                      relationshipFieldAPIName: "$relationshipFieldAPIName",
                      recordId: "$recordId",
                      orderbyAPIName: "$orderbyAPIName",
                      orderbyDirection: "$orderbyDirection",
                    })
  wiredRecords({ error, data }) {
    //this could probably just be a property but it was useful for testing what the object looked like
    if (data) {
      this.queriedRecords = data;
      this.error = undefined;
      console.log('getRecords: ');
      console.log(data);
      data.forEach(data => {
        this.recordsWithAddresses.push(data.Id);
      });
      
      //below logic hits the apex controller, sending configuration data to return map data for consumption
      if (this.enableMap) {
        getAddressData({recordIds: this.recordsWithAddresses,
          fromObject: this.fromObject,
          streetName: this.streetName,
          cityName: this.cityName,
          stateName: this.stateName,
          postcode: this.postcode,
          countryName: this.countryName,
          descriptionName: this.descriptionName,
          enableCircle: this.enableCircle,
          radiusMeters: this.radiusMeters})
          .then(result => {
            console.log(result);
            this.mapMarkers = JSON.parse(result);
        });
      }
    } else if (error) {
      this.error = error;
      this.queriedRecords = undefined;
    }
  }

  /* the below SHOULD work but does not - https://developer.salesforce.com/docs/component-library/bundle/lightning-map/documentation
  handleMarkerSelect(event) {
    console.log('event? ' + event);
    this.selectedMarkerValue = event.target.selectedMarkerValue;
    console.log(this.selectedMarkerValue);
  } */

}